import { Kanas, Layout, OrderedInfos } from "./core";
import assert from "node:assert/strict";

export type Keystroke = { key: string; shiftKey: boolean };

const positionToUsKeyboardKeyMap: Record<string, string> = {
  "0": "q",
  "1": "w",
  "2": "e",
  "3": "r",
  "4": "t",
  "5": "y",
  "6": "u",
  "7": "i",
  "8": "o",
  "9": "p",
  "10": "a",
  "11": "s",
  "12": "d",
  "13": "f",
  "14": "g",
  "15": "h",
  "16": "j",
  "17": "k",
  "18": "l",
  "19": ";",
  "20": "z",
  "21": "x",
  "22": "c",
  "23": "v",
  "24": "b",
  "25": "n",
  "26": "m",
  "27": ",",
  "28": ".",
  "29": "/",
};

const dakutenInverse: Record<string, string> = {
  が: "か",
  ぎ: "き",
  ぐ: "く",
  げ: "け",
  ご: "こ",
  ざ: "さ",
  じ: "し",
  ず: "す",
  ぜ: "せ",
  ぞ: "そ",
  だ: "た",
  ぢ: "ち",
  づ: "つ",
  で: "て",
  ど: "と",
  ば: "は",
  び: "ひ",
  ぶ: "ふ",
  べ: "へ",
  ぼ: "ほ",
  ぱ: "は",
  ぴ: "ひ",
  ぷ: "ふ",
  ぺ: "へ",
  ぽ: "ほ",
  ゔ: "う",
};

const kogakiInverse: Record<string, string> = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
};

const keyForPosition = (position: string) => {
  const key = positionToUsKeyboardKeyMap[position];
  if (!key) throw new Error(`unknown key position: ${position}`);
  return key;
};

const toHiragana = (kana: string): string =>
  Array.from(kana)
    .map((c) => {
      const code = c.charCodeAt(0);
      // カタカナ(ァ〜ヴ)をひらがなに変換
      if (code >= 0x30a1 && code <= 0x30f4) {
        return String.fromCharCode(code - 0x60);
      }
      // 長音記号の全角ハイフンはそのまま
      if (c === "ｰ") return "ー";
      return c;
    })
    .join("");

type Slot = keyof Pick<OrderedInfos, "oneStroke" | "shift1" | "shift2" | "normalShift">;

/**
 * かながどのキー位置のスロット（単打/ゅシフト/ょシフト/通常シフト）に配置されているかを検索する
 */
const findSlot = (layout: Layout, target: string): { position: string; slot: Slot } | undefined => {
  for (const [pos, info] of Object.entries(layout)) {
    const entries: [Slot, string | undefined][] = [
      ["oneStroke", info.oneStroke],
      ["shift1", info.shift1],
      ["shift2", info.shift2],
      ["normalShift", info.normalShift],
    ];
    for (const [slot, kana] of entries) {
      if (kana === target) return { position: pos, slot };
    }
  }
  return undefined;
};

/**
 * シフトキーの位置を検索する
 */
const findShiftKeyPosition = (layout: Layout, kana: "ゃ" | "ゅ" | "ょ" | "゛"): string => {
  const hit = Object.entries(layout).find(([, info]) => info.oneStroke === kana);
  if (!hit) throw new Error(`${kana} のシフトキーが見つかりません`);
  return hit[0];
};

/**
 * 位置とシフトをストロークに変換する
 */
const keystroke = (position: string, shiftKey: boolean): Keystroke => ({
  key: keyForPosition(position),
  shiftKey,
});

/**
 * 1文字のかなのストロークを計算する
 */
const strokesForSingleKana = (layout: Layout, kana: string): Keystroke[] => {
  const slotInfo = findSlot(layout, kana);
  if (slotInfo) {
    const { position, slot } = slotInfo;
    if (slot === "oneStroke") {
      return [keystroke(position, false)];
    }
    if (slot === "normalShift") {
      return [keystroke(position, true)];
    }
    if (slot === "shift1") {
      const lyuPos = findShiftKeyPosition(layout, "ゅ");
      return [keystroke(position, false), keystroke(lyuPos, false)];
    }
    if (slot === "shift2") {
      const lyoPos = findShiftKeyPosition(layout, "ょ");
      return [keystroke(position, false), keystroke(lyoPos, false)];
    }
  }

  // 濁音・半濁音
  const base = dakutenInverse[kana];
  if (base) {
    const baseInfo = findSlot(layout, base);
    if (!baseInfo) throw new Error(`${base} がレイアウトに見つかりません`);

    if (["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"].includes(kana)) {
      if (kana === "ぴ") {
        // ぴは は + ゅ
        const lyuPos = findShiftKeyPosition(layout, "ゅ");
        const haInfo = findSlot(layout, "は");
        assert.ok(haInfo);

        return [keystroke(haInfo.position, false), keystroke(lyuPos, false)];
      } else {
        // それ以外は ベース + ょ
        const lyoPos = findShiftKeyPosition(layout, "ょ");
        return [keystroke(baseInfo.position, false), keystroke(lyoPos, false)];
      }
    } else {
      // 濁音はベースキー単打 + ゛キー
      const dakutenPos = findShiftKeyPosition(layout, "゛");
      return [keystroke(baseInfo.position, false), keystroke(dakutenPos, false)];
    }
  }

  throw new Error(`${kana} を入力する方法が見つかりません`);
};

const isYouonSuffix = (kana: string) => ["ゃ", "ゅ", "ょ"].includes(kana);

const isGairaionSuffix = (kana: string) => ["ぁ", "ぃ", "ぅ", "ぇ", "ぉ"].includes(kana);

const isDakuon = (kana: string): boolean => dakutenInverse[kana] !== undefined;

/**
 * 打鍵単位を打つためのストロークを計算する
 */
export function strokesForKana(layout: Layout, kana: string): Keystroke[] {
  const normalized = toHiragana(kana);
  kana = normalized;

  if (kana.length === 1) {
    return strokesForSingleKana(layout, kana);
  }

  if (kana.length === 2) {
    if (isYouonSuffix(kana[1])) {
      const isDakuYouon = isDakuon(kana[0]);
      const suffix = kana[1] as "ゃ" | "ゅ" | "ょ";
      const shiftPos = findShiftKeyPosition(layout, suffix);

      if (isDakuYouon) {
        return [...strokesForSingleKana(layout, kana[0]), keystroke(shiftPos, false)];
      } else {
        const slotInfo = findSlot(layout, kana[0]);
        assert.ok(slotInfo);
        return [keystroke(slotInfo.position, false), keystroke(shiftPos, false)];
      }
    } else if (isGairaionSuffix(kana[1])) {
      const isDakuGairaion = isDakuon(kana[0]);
      const suffixInfo = findSlot(layout, kogakiInverse[kana[1]]);
      assert.ok(suffixInfo);

      if (isDakuGairaion) {
        return [...strokesForSingleKana(layout, kana[0]), keystroke(suffixInfo.position, true)];
      } else {
        const baseInfo = findSlot(layout, kana[0]);
        assert.ok(baseInfo);
        const needsShift = baseInfo.slot !== "oneStroke";
        return [keystroke(baseInfo.position, needsShift), keystroke(suffixInfo.position, true)];
      }
    }
  }

  throw new Error(`${kana} を入力する方法が見つかりません`);
}

export function keystrokeCountForKana(layout: Layout, kana: string): number {
  const strokes = strokesForKana(layout, kana);
  let count = strokes.length;

  // 連続シフトは1打鍵でカウントする
  let prevShift = false;
  for (let i = 0; i < strokes.length; i++) {
    if (strokes[i].shiftKey && prevShift === false) {
      count++;
    }
    prevShift = strokes[i].shiftKey;
  }
  return count;
}

export type KanaCount = { kana: string; count: number };

export function totalKeystrokesForDataset(layout: Layout, dataset: KanaCount[]): number {
  return dataset.reduce((sum, { kana, count }) => sum + keystrokeCountForKana(layout, kana) * count, 0);
}
