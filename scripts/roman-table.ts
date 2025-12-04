import { KeyPosition, Layout } from "./core";
import { objectEntries } from "./utils";

type RomanTableEntry = {
  input: string;
  output?: string;
  nextInput?: string;
};

const positionToUsKeyboardKeyMap = {
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
} satisfies { [key in KeyPosition]: string };

const dakuonPair = {
  か: "が",
  き: "ぎ",
  く: "ぐ",
  け: "げ",
  こ: "ご",
  さ: "ざ",
  し: "じ",
  す: "ず",
  せ: "ぜ",
  そ: "ぞ",
  た: "だ",
  ち: "ぢ",
  つ: "づ",
  て: "で",
  と: "ど",
  は: "ば",
  ひ: "び",
  ふ: "ぶ",
  へ: "べ",
  ほ: "ぼ",
  ま: "ぱ",
  み: "ぴ",
  む: "ぷ",
  め: "ぺ",
  も: "ぽ",
};

/**
 * かなを濁音化する
 */
function addDakuten(kana: string): string {
  if (!(kana in dakuonPair)) {
    throw new Error(`${kana}は濁音化できません`);
  }
  return dakuonPair[kana as keyof typeof dakuonPair];
}

/**
 * キー位置をUSキーボードのキーに変換する
 */
function positionToUsKeyboardKey(position: KeyPosition): string {
  return positionToUsKeyboardKeyMap[position];
}

/**
 * Google日本語用のローマ字テーブルの形式
 */
type RomanTable = RomanTableEntry[];

/**
 * レイアウトをローマ字テーブル形式に変換する
 */
function exportRomanTable(layout: Layout): RomanTable {
  const table: RomanTable = [];

  // 単打
  for (const [position, info] of objectEntries(layout)) {
    const key = positionToUsKeyboardKey(position);
    // シフトキーの場合
    if (info.oneStroke === "ゃ" || info.oneStroke === "ゅ" || info.oneStroke === "ょ") {
      table.push({ input: key, output: info.oneStroke });
    } else {
      table.push({ input: key, nextInput: info.oneStroke });
    }
  }

  // 濁点後置シフト
  const dakuten = objectEntries(layout).find(([_, info]) => info.oneStroke === "゛");
  if (!dakuten) throw new Error("濁点が見つかりません");
  const dakutenKey = positionToUsKeyboardKey(dakuten[0]);
  for (const [, info] of objectEntries(layout)) {
    const dakuonKana = info.dakuonKanaInfo?.kana;
    if (dakuonKana) {
      table.push({ input: `${dakuonKana}${dakutenKey}`, output: addDakuten(dakuonKana) });
    }
  }

  // ゃ後置シフト（拗音の場合はゃ後置、それ以外は濁音化）
  const lya = objectEntries(layout).find(([_, info]) => info.oneStroke === "ゃ");
  if (!lya) throw new Error("ゃが見つかりません");
  const lyaKey = positionToUsKeyboardKey(lya[0]);
  for (const [, info] of objectEntries(layout)) {
    const dakuonKana = info.dakuonKanaInfo?.kana;
    const youonKana = info.youonKanaInfo?.kana;
    if (youonKana) {
      table.push({ input: `${youonKana}${lyaKey}`, output: `${youonKana}ゃ` });
    } else if (dakuonKana) {
      table.push({ input: `${dakuonKana}${lyaKey}`, output: addDakuten(dakuonKana) });
    }
  }

  return table;
}

/**
 * ローマ字テーブルを文字列に変換する
 */
export function layoutToRomanTableString(layout: Layout): string {
  const romanTable = exportRomanTable(layout);
  return romanTable
    .map((entry) => {
      let line = entry.input;
      if (entry.output) {
        if (entry.nextInput) {
          return `${entry.input}\t${entry.output}\t${entry.nextInput}`;
        } else {
          return `${entry.input}\t${entry.output}`;
        }
      } else {
        return `${entry.input}\t\t${entry.nextInput}`;
      }
    })
    .join("\n");
}
