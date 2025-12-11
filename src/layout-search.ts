import { readFileSync } from "node:fs";
import { Kana, Kanas, KeyPosition, keyPositions, Layout, OrderedInfos, validateLayout } from "./core";
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
      ] as [KeyPosition, OrderedInfos]
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

export type PlacementCandidate = { slot: "oneStroke"; position: KeyPosition };

/**
 * 現在のレイアウトに、指定したかなを配置できる候補（単打スロットのみ）を返す
 * - 既に何か配置済みのキーは除外
 * - シフトキーが置かれている場所は除外
 */
export function getPlacementCandidates(layout: Layout, kana: Kana): PlacementCandidate[] {
  const kanaInfo = Kanas[kana as keyof typeof Kanas];
  if (!kanaInfo || kanaInfo.type !== "normal") return [];

  return keyPositions
    .filter((pos) => {
      const info = layout[pos];
      const isShiftKey = Kanas[info.oneStroke as keyof typeof Kanas]?.type === "shiftKey";
      return !isShiftKey && info.oneStroke === undefined;
    })
    .map((pos) => ({ slot: "oneStroke", position: pos }));
}

type PlaceInfo = {
  isShiftKey: boolean;
  youonPlaced: boolean;
  dakuonPlaced: boolean;
  gairaionPlaced: boolean;
};

function buildPlaceInfo(layout: Layout): Record<KeyPosition, PlaceInfo> {
  const placeInfo: Record<KeyPosition, PlaceInfo> = objectFromEntries(
    keyPositions.map((pos) => [
      pos,
      { isShiftKey: false, youonPlaced: false, dakuonPlaced: false, gairaionPlaced: false },
    ])
  );

  for (const pos of keyPositions) {
    const info = layout[pos];
    const slots: (keyof OrderedInfos)[] = ["oneStroke", "shift1", "shift2", "normalShift"];
    for (const slot of slots) {
      const kana = info[slot];
      if (!kana) continue;
      const kanaInfo = Kanas[kana as keyof typeof Kanas];
      if (!kanaInfo) continue;
      if (slot === "oneStroke" && kanaInfo.type === "shiftKey") {
        placeInfo[pos].isShiftKey = true;
        continue;
      }
      if (kanaInfo.type === "normal") {
        if (kanaInfo.isYouon) placeInfo[pos].youonPlaced = true;
        if (kanaInfo.isDakuon) placeInfo[pos].dakuonPlaced = true;
        if (kanaInfo.isGairaion) placeInfo[pos].gairaionPlaced = true;
      }
    }
  }

  return placeInfo;
}

export type PlacementCandidateWithSlot = {
  slot: keyof Pick<OrderedInfos, "oneStroke" | "shift1" | "shift2" | "normalShift">;
  position: KeyPosition;
};

const huheho: Kana[] = ["ふ", "へ", "ほ"];

/**
 * shift1 / shift2 / oneStroke / normalShift への配置候補を返す
 * 生成ルールと同等の制約をチェックする:
 * - 既に埋まっているスロット、シフトキーが置かれているキーは除外
 * - 濁音/拗音になるかなは、同種のかなが配置済みのキーでは除外
 * - 外来音になるかなは、拗音または外来音が配置済みのキーでは除外
 * - ふ/へ/ほ が配置されているキーの shift2 は使用不可
 * - 「は」は oneStroke のみ配置可
 */
export function getPlacementCandidatesWithSlots(layout: Layout, kana: Kana): PlacementCandidateWithSlot[] {
  const kanaInfo = Kanas[kana as keyof typeof Kanas];
  if (!kanaInfo || kanaInfo.type !== "normal") return [];

  const placeInfo = buildPlaceInfo(layout);
  const slots: PlacementCandidateWithSlot["slot"][] = ["oneStroke", "shift1", "shift2", "normalShift"];

  const candidates: PlacementCandidateWithSlot[] = [];

  for (const position of keyPositions) {
    const info = layout[position];
    const pInfo = placeInfo[position];

    if (pInfo.isShiftKey) continue;

    for (const slot of slots) {
      // 「は」は単打のみ
      if (kana === "は" && slot !== "oneStroke") continue;
      // ふへほ自身も shift2 に置かない
      if (huheho.includes(kana) && slot === "shift2") continue;

      if (info[slot] !== undefined) continue;

      // shift2 は、ふ/へ/ほ が置かれているキーでは使えない
      if (slot === "shift2" && (huheho.includes(info.oneStroke as Kana) || huheho.includes(info.shift1 as Kana))) {
        continue;
      }

      // 濁音/拗音は同種が配置済みのキーでは不可
      if ((kanaInfo.isDakuon || kanaInfo.isYouon) && (pInfo.youonPlaced || pInfo.dakuonPlaced)) continue;

      // 外来音は拗音/外来音が配置済みのキーでは不可
      if (kanaInfo.isGairaion && (pInfo.youonPlaced || pInfo.gairaionPlaced)) continue;

      // 外来音が既に配置されているキーのnormalShiftには、外来音以外を置けない
      if (slot === "normalShift" && pInfo.gairaionPlaced && !kanaInfo.isGairaion) continue;
      // 通常シフトに置けるのは拗音になるかな、または句読点のみ
      if (
        slot === "normalShift" &&
        !(kanaInfo.isYouon || kana === "、" || kana === "。")
      ) {
        continue;
      }

      // 拗音が配置されているキーでは、shift1/shift2 を使えない
      if (pInfo.youonPlaced && (slot === "shift1" || slot === "shift2")) continue;
      // 拗音を置くときは、そのキーのshift1/shift2が空である必要がある
      if (kanaInfo.isYouon && (info.shift1 !== undefined || info.shift2 !== undefined)) continue;
      // 拗音はshift1/shift2には置かない
      if (kanaInfo.isYouon && (slot === "shift1" || slot === "shift2")) continue;

      // 'は' が既に単打で置かれているキーの後置には置かない
      if (info.oneStroke === "は" && (slot === "shift1" || slot === "shift2")) continue;

      candidates.push({ slot, position });
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
    const candidates = getPlacementCandidatesWithSlots(layout, kana as Kana).filter((c) =>
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
