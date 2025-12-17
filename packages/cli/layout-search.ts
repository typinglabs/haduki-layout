import {
  Kana,
  Kanas,
  KeyPosition,
  keyPositions,
  Layout,
  KeyAssignment,
  validateLayout,
  keySlots,
  validateKeyAssignment,
  LayoutValidationError,
  KeySlot,
  dakutenInverse,
  kogakiInverse,
  kogakiKanas,
  dakuonKanas,
} from "./core";
import { objectFromEntries } from "./utils";
import { StrokeConversionError, textToStrokes } from "./stroke";
import { getTrigramStrokeTime } from "./stroke-time";
import { loadKanaByFrequency, loadTrigramDataset, TrigramEntry } from "./dataset";
import { printLayout } from "./generate-random";

function createEmptyLayout(): Layout {
  const entries = keyPositions.map(
    (pos) =>
      [
        pos,
        { oneStroke: undefined as unknown as Kana, shift1: undefined, shift2: undefined, normalShift: undefined },
      ] as [KeyPosition, KeyAssignment]
  );
  return objectFromEntries(entries);
}

const fixedShiftKeyPositions: Record<string, KeyPosition> = {
  ゃ: 11, // s
  ゅ: 12, // d
  ょ: 17, // k
  ゛: 18, // l
};

/**
 * シフトキー（ゃ/ゅ/ょ/゛）を固定位置に配置した初期レイアウトを返す
 */
export function createLayoutWithShiftKeys(): Layout {
  const layout = createEmptyLayout();
  (["ゃ", "ゅ", "ょ", "゛"] as const).forEach((kana) => {
    const pos = fixedShiftKeyPositions[kana];
    layout[pos].oneStroke = kana as Kana;
  });
  return layout;
}

export type PlacementCandidate = {
  slot: KeySlot;
  position: KeyPosition;
};

function canAssignKana(layout: Layout, position: KeyPosition, slot: KeySlot, kana: Kana): boolean {
  if (layout[position][slot]) return false;

  const newAssignment: KeyAssignment = { ...layout[position], [slot]: kana };
  try {
    validateKeyAssignment(newAssignment);
    return true;
  } catch (e) {
    if (e instanceof LayoutValidationError) {
      return false;
    }
    throw e;
  }
}

/**
 * あるかなを配置できる場所を取得する
 */
export function getPlacementCandidates(layout: Layout, kana: Kana): PlacementCandidate[] {
  const kanaInfo = Kanas[kana as keyof typeof Kanas];
  if (!kanaInfo || kanaInfo.type !== "normal") return [];

  const isMiddleRow = (position: KeyPosition) => position >= 10 && position < 20;
  const isHaRowKana = (k: Kana) => ["は", "ひ", "ふ", "へ", "ほ"].includes(k);
  const isVowelKana = (k: Kana) => ["あ", "い", "う", "え", "お"].includes(k);
  const forbiddenVowelPositions = new Set<KeyPosition>([0, 1, 2, 3, 4, 14, 24]);

  const candidates: PlacementCandidate[] = [];
  for (const position of keyPositions) {
    // 拗音になるかなとは行かなはは中段には置かない
    // if ((kanaInfo.isYouon || isHaRowKana(kana)) && isMiddleRow(position)) continue;
    if (kanaInfo.isYouon && isMiddleRow(position)) continue;
    // 母音は左手上段(QWERT)と左手5列目(T/G/B)に置かない
    if (isVowelKana(kana) && forbiddenVowelPositions.has(position)) continue;

    for (const slot of keySlots) {
      if (canAssignKana(layout, position, slot, kana)) {
        candidates.push({ slot, position });
      }
    }
  }
  return candidates;
}

const punctuation = new Set(["、", "。"]);

export type SearchLayoutOptions = {
  trigrams?: TrigramEntry[];
  kanaOrder?: string[];
};

function reorderKanaOrder(baseOrder: string[]): string[] {
  // TOP26（句読点除く）は元の順序を維持したまま残す。それ以外で、
  // 濁音/拗音/外来音にならないかなを後ろに寄せる。
  const top26 = baseOrder.filter((k) => !punctuation.has(k)).slice(0, 26);

  const main: string[] = [];
  const plainTail: string[] = [];

  for (const kana of baseOrder) {
    const info = Kanas[kana as keyof typeof Kanas];
    if (!info || info.type !== "normal") continue;

    const isTop26 = top26.includes(kana);
    const isPlain = !info.isYouon && !info.isDakuon && !info.isGairaion && !punctuation.has(kana);

    if (!isTop26 && isPlain) {
      // 後ろに固める対象
      plainTail.push(kana);
    } else {
      main.push(kana);
    }
  }

  return [...main, ...plainTail];
}

export type LayoutScore = {
  score: number;
  totalCount: number;
  totalSeconds: number;
  kpm: number;
};

/**
 * 打鍵単位3-gramの、最後の1単位に関する情報を返す
 */
function getTrigramTailInfo(layout: Layout, trigram: string): { time: number; strokeCount: number } {
  try {
    const strokes = textToStrokes(layout, trigram);
    let time = 0;
    let strokeCount = 0;
    for (let i = 2; i < strokes.length; i++) {
      if (strokes[i].strokeUnitIndex < 2) {
        // 1文字目と2文字目はスキップ
        continue;
      }
      time += getTrigramStrokeTime([strokes[i - 2], strokes[i - 1], strokes[i]]);
      strokeCount++;
    }
    return { time, strokeCount: strokeCount };
  } catch (e) {
    if (e instanceof StrokeConversionError) {
      // まだ打てない文字がある場合は無視する
      return { time: 0, strokeCount: 0 };
    }
    throw e;
  }
}

/**
 * 打鍵単位3-gramの、最後の1単位を入力するのにかかる時間を計算する
 */
function getTrigramTailTime(layout: Layout, trigram: string): number {
  return getTrigramTailInfo(layout, trigram).time;
}

/**
 * レイアウトのスコアを計算する
 * - score: 3-gramの件数を秒数で割ったもの、とりあえず
 * - totalCount: 対象3-gramの総出現回数
 * - totalSeconds: 3文字目打鍵にかかる時間（秒）
 * - kpm: strokes/分（3文字目部分のみ）
 */
export function scoreLayout(layout: Layout, trigrams: TrigramEntry[]): LayoutScore {
  let totalTimeMs = 0;
  let totalCount = 0;
  let totalStrokes = 0;

  for (const entry of trigrams) {
    const info = getTrigramTailInfo(layout, entry.trigram);
    if (info.time > 0) {
      totalCount += entry.count;
      totalTimeMs += info.time * entry.count;
      totalStrokes += info.strokeCount * entry.count;
    }
  }

  const totalSeconds = totalTimeMs / 1000;
  const kpm = totalSeconds === 0 ? 0 : (totalStrokes * 60) / totalSeconds;

  return {
    score: Math.round((totalCount / totalSeconds) * 1000 * 60),
    kpm: Math.round(kpm * 100) / 100,
    totalSeconds: Math.round(totalSeconds),
    totalCount,
  };
}

/**
 * 貪欲法でレイアウトを構築する
 * - シフトキーは固定位置に配置済み
 * - 頻度上位26（句読点を除く）は単打に配置
 * - 評価関数は仮で固定（最初の候補を採用）
 */
function greedySearch({ kanaOrder, trigrams: _trigrams }: { kanaOrder: string[]; trigrams: TrigramEntry[] }): Layout {
  const trigrams = new Set(_trigrams);
  const layout = createLayoutWithShiftKeys();
  const top26 = kanaOrder.filter((k) => !punctuation.has(k)).slice(0, 26);
  const isTop26 = (kana: string) => top26.includes(kana);

  // 拗音を最後の方に配置すると配置できなくなる場合があるので、少し前にしておく
  const index = kanaOrder.indexOf("ひ");
  if (index > -1) {
    kanaOrder.splice(index, 1);
    const target = 41;
    kanaOrder.splice(target, 0, "ひ");
  }

  for (const kana of kanaOrder) {
    const candidates = getPlacementCandidates(layout, kana as Kana)
      .filter((c) => (isTop26(kana) ? c.slot === "oneStroke" : true))
      .filter((c) => (!isTop26(kana) ? c.slot !== "oneStroke" : true));

    if (candidates.length === 0) {
      throw new Error(`${kana} を配置できる候補がありません`);
    }

    let best_cost = Infinity;
    let best_candidate = candidates[0];
    const relatedTrigrams = Array.from(trigrams).filter((t) => t.trigram.includes(kana));
    for (const candidate of candidates) {
      // 新しく打てるようになった3-gramの打鍵時間を足し合わせる
      let cost = 0;
      const newLayout: Layout = {
        ...layout,

        [candidate.position]: { ...layout[candidate.position], [candidate.slot]: kana as Kana },
      };
      for (const trigram of relatedTrigrams) {
        cost += getTrigramTailTime(newLayout, trigram.trigram) * trigram.count;
      }
      if (cost < best_cost) {
        best_cost = cost;
        best_candidate = candidate;
      }
    }

    layout[best_candidate.position][best_candidate.slot] = kana as Kana;
    // 打てるようになった3-gramを削除する
    for (const trigram of trigrams) {
      if (!trigram.trigram.includes(kana)) continue;
      if (getTrigramTailTime(layout, trigram.trigram) > 0) {
        trigrams.delete(trigram);
      }
    }
  }

  return layout;
}

type Place = PlacementCandidate;
type Score = number;
type State = { layout: Layout; depth: number; score: Score };

/**
 * 盤面を評価する
 *
 * その手順で配置するかなを配置したときに打てるようになる、3-gramのコストの総和
 */
function evaluateScore(layout: Layout, trigrams: TrigramEntry[]): number {
  const score = trigrams
    .map((trigram) => getTrigramTailTime(layout, trigram.trigram) * trigram.count)
    .reduce((sum, time) => sum + time, 0);
  return score;
}

/**
 * かなを置ける場所を取得する
 */
function getValidPlaces(layout: Layout, kana: Kana): Place[] {
  return getPlacementCandidates(layout, kana);
}

/**
 * 指定した場所にかなを配置する
 */
function placeKana(layout: Layout, place: Place, kana: Kana): Layout {
  return {
    ...layout,
    [place.position]: { ...layout[place.position], [place.slot]: kana },
  };
}

/**
 * 3-gramを何番目のかなを配置できたら打てるようになるかを計算する
 */
export function getTrigramOrder(trigram: string, kanaOrder: string[]): number {
  let maxOrder = 0;
  for (const char of trigram) {
    if (["ゃ", "ゅ", "ょ"].includes(char)) continue;
    let kana: Kana = char as Kana;
    if (dakuonKanas.includes(kana)) kana = dakutenInverse[kana];
    if (kogakiKanas.includes(kana)) kana = kogakiInverse[kana];

    // TODO: 計算量
    const index = kanaOrder.findIndex((k) => k === kana);
    maxOrder = Math.max(maxOrder, index);
  }
  return maxOrder;
}

export function makeTrigramsMap(trigrams: TrigramEntry[], kanaOrder: string[]): Record<number, TrigramEntry[]> {
  const map: Record<number, TrigramEntry[]> = {};
  for (const trigram of trigrams) {
    const order = getTrigramOrder(trigram.trigram, kanaOrder);
    if (!map[order]) {
      map[order] = [trigram];
    } else {
      map[order].push(trigram);
    }
  }
  return map;
}

/**
 * ビームサーチ
 */
function beamSearchLayout({
  kanaOrder,
  trigrams,
  beamWidth,
}: {
  kanaOrder: string[];
  trigrams: TrigramEntry[];
  beamWidth: number;
}): Layout {
  const trigramsMap = makeTrigramsMap(trigrams, kanaOrder);
  const initialLayout = createLayoutWithShiftKeys();
  const state: State = { layout: initialLayout, depth: 0, score: 0 };
  let beam: State[] = [state];

  const top26 = kanaOrder.filter((kana) => !punctuation.has(kana)).slice(0, 26);
  const isTop26 = (kana: string) => top26.includes(kana);

  for (let i = 0; i < kanaOrder.length; i++) {
    const kana: Kana = kanaOrder[i] as Kana;
    console.log({ i, kana, beams: beam.length });
    printLayout(beam[0].layout);

    const nextBeam: State[] = [];
    for (let j = 0; j < Math.min(beamWidth, beam.length); j++) {
      const state = beam[j];

      // TOP26は単打に配置
      const places = getValidPlaces(state.layout, kana).filter((place) => {
        if (isTop26(kana)) {
          return place.slot === "oneStroke";
        } else {
          return place.slot !== "oneStroke";
        }
      });

      for (const place of places) {
        const newLayout = placeKana(state.layout, place, kana);
        const scoreDiff = evaluateScore(newLayout, trigramsMap[i] ?? []);
        const nextState: State = {
          layout: newLayout,
          depth: state.depth + 1,
          score: state.score + scoreDiff,
        };
        nextBeam.push(nextState);
      }
    }
    if (nextBeam.length === 0) {
      // これ以上配置できない場合は現在の最良状態を返す
      return beam[0]?.layout ?? createLayoutWithShiftKeys();
    }
    nextBeam.sort((state1, state2) => state1.score - state2.score);
    beam = nextBeam.slice(0, beamWidth);
  }
  return beam[0].layout;
}

export function searchLayout(options: SearchLayoutOptions = {}): Layout {
  const trigrams = options.trigrams ?? loadTrigramDataset().slice(0, 4000);
  const baseOrder = options.kanaOrder ?? loadKanaByFrequency();
  const kanaOrder = reorderKanaOrder(baseOrder);
  const layout = beamSearchLayout({ kanaOrder, trigrams, beamWidth: 100 });

  return validateLayout(layout);
}
