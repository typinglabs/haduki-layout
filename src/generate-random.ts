import assert from "node:assert/strict";
import { Kanas, KeyPosition, UnorderedLayout, keyPositions, Layout, OrderedInfos, Kana } from "./core";
import { objectEntries, objectFromEntries } from "./utils";

const emptyLayout: UnorderedLayout = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: [],
  13: [],
  14: [],
  15: [],
  16: [],
  17: [],
  18: [],
  19: [],
  20: [],
  21: [],
  22: [],
  23: [],
  24: [],
  25: [],
  26: [],
  27: [],
  28: [],
  29: [],
};

const shiftKeyKanas = [Kanas.ゃ, Kanas.ゅ, Kanas.ょ, Kanas.゛];

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

function placeShiftKeys(layout: Layout): KeyPosition[] {
  const positions = getRandomSample([...keyPositions], shiftKeyKanas.length) as KeyPosition[];
  shiftKeyKanas.forEach((kana, idx) => {
    layout[positions[idx]].oneStroke = kana.kana;
  });
  return positions;
}

/**
 * 配列からランダムにサンプルを取得する
 */
function getRandomSample<T>(array: T[], sampleSize: number): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, sampleSize);
}

class RandomAccessArray<T> {
  private items: T[];
  constructor(values: T[]) {
    this.items = values.slice();
  }
  getRandomIndex(): number {
    if (this.items.length === 0) throw new Error("RandomAccessArray is empty");
    return Math.floor(Math.random() * this.items.length);
  }
  remove(index: number): T {
    if (index < 0 || index >= this.items.length) throw new Error("index out of bounds");
    const last = this.items.length - 1;
    [this.items[index], this.items[last]] = [this.items[last], this.items[index]];
    const value = this.items.pop() as T;
    return value;
  }
  empty(): boolean {
    return this.items.length === 0;
  }
  size(): number {
    return this.items.length;
  }
  values(): T[] {
    return this.items.slice();
  }
}

function shuffle<T>(array: readonly T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function placeNormalShift(layout: Layout, kana: Kana): void {
  for (const pos of shuffle(keyPositions)) {
    const info = layout[pos];
    if (shiftKeyKanas.some((k) => k.kana === info.oneStroke)) continue;
    if (info.normalShift) continue;
    info.normalShift = kana;
    return;
  }
  throw new Error(`failed to place ${kana} into normalShift`);
}

function placeShift1(layout: Layout, kana: Kana): void {
  for (const pos of shuffle(keyPositions)) {
    const info = layout[pos];
    if (shiftKeyKanas.some((k) => k.kana === info.oneStroke)) continue;
    if (!info.shift1) {
      info.shift1 = kana;
      return;
    }
  }
  throw new Error(`failed to place ${kana} into shift1`);
}

function placeShift1OrShift2(layout: Layout, kana: Kana): void {
  for (const pos of shuffle(keyPositions)) {
    const info = layout[pos];
    if (shiftKeyKanas.some((k) => k.kana === info.oneStroke)) continue;
    if (!info.shift1) {
      info.shift1 = kana;
      return;
    }
    if (!info.shift2) {
      info.shift2 = kana;
      return;
    }
  }
  throw new Error(`failed to place ${kana} into shift1 or shift2`);
}

/**
 * 配列を表示する
 */
export function printUnordered(layout: UnorderedLayout) {
  for (let i = 0; i < 4; i++) {
    let line = "";
    for (const j of keyPositions) {
      if (layout[j][i]) {
        line += layout[j][i].kana;
      } else {
        line += "　";
      }
      if (j % 10 === 9) {
        console.log(line);
        line = "";
      }
    }
    console.log();
  }
}

/**
 * 配列を表示する
 */
export function printLayout(layout: Layout) {
  const props = ["oneStroke", "shift1", "shift2", "normalShift"] as const;
  for (const prop of props) {
    let line = "";
    for (const i of keyPositions) {
      if (layout[i][prop]) {
        line += layout[i][prop];
      } else {
        line += "　";
      }
      if (i % 10 === 9) {
        console.log(line);
        line = "";
      }
    }
    console.log();
  }
}

/**
 * 条件を満たすキー配列を生成する
 *
 * TOP26を単打に配置し、打鍵効率を下げる（1打で打てるかなを増やす）
 */
export function generateLayout(top26s: (keyof typeof Kanas)[]): Layout {
  if (top26s.length > keyPositions.length - shiftKeyKanas.length) {
    throw new Error("top26s is too long");
  }

  const layout = createEmptyLayout();
  // STEP1. 後置シフトキーゃゅょ゛を配置する
  placeShiftKeys(layout);

  const availableOneStroke = keyPositions.filter((p) => !layout[p].oneStroke);
  const takeOneStroke = (): KeyPosition => {
    const pos = availableOneStroke.shift();
    if (pos === undefined) {
      throw new Error("no empty oneStroke slot available");
    }
    return pos;
  };

  // STEP2. 濁音または拗音になる24かなを配置する
  // 単打になるかどうかはtop26のリストを見て決める
  const dakuonOrYouons = objectEntries(Kanas).filter(
    ([kana, info]) => info.type === "normal" && (info.isDakuon || info.isYouon)
  );
  for (const [kana, info] of dakuonOrYouons) {
    assert.ok(info.type === "normal");

    if (top26s.includes(kana)) {
      // top26は単打に配置する
      const pos = takeOneStroke();
      layout[pos].oneStroke = kana as Kana;
    } else if (info.isYouon) {
      // 拗音は単打でなければ、通常シフトに配置する
      placeNormalShift(layout, kana as Kana);
    } else if (kana === "は") {
      // は は単打でなければならない
      throw new Error("'は'はtop26に含めて単打に配置してください");
    } else if (["ふ", "へ", "ほ"].includes(kana)) {
      // ふへほは、単打でなければゅ後置シフトに配置する
      placeShift1(layout, kana as Kana);
    } else {
      // そうでない場合は、ゅ後置シフトまたはょ後置シフトに配置する
      placeShift1OrShift2(layout, kana as Kana);
    }
  }

  // STEP3. 通常シフトに関係する母音と句読点配置する
  // 母音を配置できる場所は、シフトと拗音がある場所以外
  // 句読点を配置できる場所は、ゃ゛シフトと単打ではない拗音がある場所以外
  const vowels = ["あ", "い", "え", "お"] as const;
  for (const vowel of vowels) {
    if (top26s.includes(vowel)) {
      // 単打の空いているところで、拗音と外来音に関するカナ（ふてうとしちつ）が配置されていない場所に配置する
    } else {
      // シフト1または2の空いているところで、拗音と外来音に関するカナが配置されていない場所に配置する
    }
  }
  const kutoutens = ["、", "。"] as const;
  for (const kutouten of kutoutens) {
    // ゃ"シフトと単打ではない拗音がある場所以外に配置する
  }

  return layout;
}
