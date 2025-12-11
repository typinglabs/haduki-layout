import { readFileSync } from "node:fs";
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
} from "./core";
import { objectFromEntries } from "./utils";
import { StrokeConversionError, textToStrokes } from "./stroke";
import { getTrigramStrokeTime } from "./stroke-time";

export type TrigramEntry = { trigram: string; count: number };

/**
 * wikipedia.hiragana-ized.3gram.txt を読み込んで3-gramの配列を返す
 */
export function loadTrigramDataset(path = "dataset/wikipedia.hiragana-ized.3gram.txt"): TrigramEntry[] {
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    const [countStr, trigram] = line.split("\t");
    return { trigram, count: Number(countStr) };
  });
}

const shiftKeyKanas = new Set(["ゃ", "ゅ", "ょ"]);

export type OneGramEntry = { kana: string; count: number };

/**
 * wikipedia.hiragana-ized.1gram.txt を読み込み、頻度順（降順）にかなを並べる
 * シフトキーのかな（ゃ/ゅ/ょ）は除外する
 */
export function loadKanaByFrequency(path = "dataset/wikipedia.hiragana-ized.1gram.txt"): string[] {
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const entries: OneGramEntry[] = lines.map((line) => {
    const [countStr, kana] = line.split("\t");
    return { kana, count: Number(countStr) };
  });

  const kanaSet = new Set(Object.keys(Kanas));

  return entries
    .filter((entry) => kanaSet.has(entry.kana) && !shiftKeyKanas.has(entry.kana))
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.kana);
}

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

  const candidates: PlacementCandidate[] = [];
  for (const position of keyPositions) {
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

/**
 * 打鍵単位3-gramの、最後の1単位を入力するのにかかる時間を計算する
 */
function getTrigramTailTime(layout: Layout, trigram: TrigramEntry): number {
  try {
    const strokes = textToStrokes(layout, trigram.trigram);
    let time = 0;
    for (let i = 0; i < strokes.length - 2; i++) {
      if (strokes[i].strokeUnitIndex < 2) {
        // 1文字目と2文字目はスキップ
        continue;
      }
      time += getTrigramStrokeTime([strokes[i], strokes[i + 1], strokes[i + 2]]);
    }
    return time * trigram.count;
  } catch (e) {
    if (e instanceof StrokeConversionError) {
      // まだ打てない文字がある場合は無視する
      return 0;
    }
    throw e;
  }
}

/**
 * 貪欲法でレイアウトを構築する
 * - シフトキーは固定位置に配置済み
 * - 頻度上位26（句読点を除く）は単打に配置
 * - 評価関数は仮で固定（最初の候補を採用）
 */
export function searchLayout(options: SearchLayoutOptions = {}): Layout {
  const layout = createLayoutWithShiftKeys();
  const trigrams = new Set(options.trigrams ?? loadTrigramDataset());

  const kanaOrder = options.kanaOrder ?? loadKanaByFrequency(); // shiftキーは除外済み
  const top26 = kanaOrder.filter((k) => !punctuation.has(k)).slice(0, 26);
  const isTop26 = (kana: string) => top26.includes(kana);

  for (const kana of kanaOrder) {
    const candidates = getPlacementCandidates(layout, kana as Kana).filter((c) =>
      isTop26(kana) ? c.slot === "oneStroke" : true
    );

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
        cost += getTrigramTailTime(newLayout, trigram);
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
      if (getTrigramTailTime(layout, trigram) > 0) {
        trigrams.delete(trigram);
      }
    }
  }

  return validateLayout(layout);
}
