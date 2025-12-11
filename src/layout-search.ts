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

/**
 * 貪欲法でレイアウトを構築する
 * - シフトキーは固定位置に配置済み
 * - 頻度上位26（句読点を除く）は単打に配置
 * - 評価関数は仮で固定（最初の候補を採用）
 */
export function searchLayout(): Layout {
  const layout = createLayoutWithShiftKeys();

  const kanaOrder = loadKanaByFrequency(); // shiftキーは除外済み
  const top26 = kanaOrder.filter((k) => !punctuation.has(k)).slice(0, 26);
  const isTop26 = (kana: string) => top26.includes(kana);

  for (const kana of kanaOrder) {
    const candidates = getPlacementCandidates(layout, kana as Kana).filter((c) =>
      isTop26(kana) ? c.slot === "oneStroke" : true
    );

    if (candidates.length === 0) {
      throw new Error(`${kana} を配置できる候補がありません`);
    }

    const chosen = candidates[0];
    layout[chosen.position][chosen.slot] = kana as Kana;
  }

  // 評価は「3-gramの最後の1単位（きゃふぁなどは1つと数える）を打つのにかかる時間の合計」とする
  // 3-gramの全ての文字が打てるようになった時に、その分を加算する

  // - [ ] 配置途中のレイアウトで、あるtrigramを打てるかどうかを判定する関数を作る
  // - [ ] あるレイアウトで、trigramの3文字目を打つときにかかるコストを計算する関数を作る

  // 余ったかな（頻度ファイルに無い場合）も考えるならここで対応するが、現状は頻度リストに含まれるもののみ
  return validateLayout(layout);
}
