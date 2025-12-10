import { Kanas, KeyPosition, Layout } from "./core";
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
  う: "ゔ",
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

const handakuonPair = {
  は: "ぱ",
  ひ: "ぴ",
  ふ: "ぷ",
  へ: "ぺ",
  ほ: "ぽ",
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
 * かなを半濁音化する
 */
function addHandakuten(kana: string): string {
  if (!(kana in handakuonPair)) {
    throw new Error(`${kana}は半濁音化できません`);
  }
  return handakuonPair[kana as keyof typeof handakuonPair];
}

/**
 * シフトキーと一緒に入力した時のキーを返す
 */
function withShift(position: string): string {
  const shiftMap: Record<string, string> = {
    q: "Q",
    w: "W",
    e: "E",
    r: "R",
    t: "T",
    y: "Y",
    u: "U",
    i: "I",
    o: "O",
    p: "P",
    a: "A",
    s: "S",
    d: "D",
    f: "F",
    g: "G",
    h: "H",
    j: "J",
    k: "K",
    l: "L",
    ";": ":",
    z: "Z",
    x: "X",
    c: "C",
    v: "V",
    b: "B",
    n: "N",
    m: "M",
    ",": "<",
    ".": ">",
    "/": "?",
  };
  const shifted = shiftMap[position];
  if (!shifted) {
    throw new Error(`無効な位置です: ${position}`);
  }
  return shifted;
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
export function exportRomanTable(layout: Layout): RomanTable {
  const table: RomanTable = [];

  const getKanaInfo = (kana: string | undefined) => (kana ? Kanas[kana as keyof typeof Kanas] : undefined);
  const isDakuonCandidate = (kana: string | undefined) => {
    const info = getKanaInfo(kana);
    return info?.type === "normal" && info.isDakuon;
  };
  const isYouonCandidate = (kana: string | undefined) => {
    const info = getKanaInfo(kana);
    return info?.type === "normal" && info.isYouon;
  };
  const kanaSlots = (info: (typeof layout)[KeyPosition]): (string | undefined)[] => [
    info.oneStroke,
    info.shift1,
    info.shift2,
    info.normalShift,
  ];
  const findDakuonKana = (info: (typeof layout)[KeyPosition]) => kanaSlots(info).find(isDakuonCandidate);
  const findYouonKana = (info: (typeof layout)[KeyPosition]) => kanaSlots(info).find(isYouonCandidate);
  const findHagyouKanaExceptHi = (info: (typeof layout)[KeyPosition]) =>
    kanaSlots(info).find((kana) => kana && ["は", "ふ", "へ", "ほ"].includes(kana));
  const findGairaionKana = (info: (typeof layout)[KeyPosition]) => {
    return kanaSlots(info).find((kana) => {
      const kanaInfo = getKanaInfo(kana);
      return kanaInfo?.type === "normal" && kanaInfo.isGairaion;
    });
  };

  // 単打
  for (const [position, info] of objectEntries(layout)) {
    const key = positionToUsKeyboardKey(position);
    // シフトキーの場合
    if (info.oneStroke === "ゃ" || info.oneStroke === "ゅ" || info.oneStroke === "ょ" || info.oneStroke === "゛") {
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
    const dakuonKana = findDakuonKana(info);
    if (dakuonKana) {
      table.push({ input: `${info.oneStroke}${dakutenKey}`, output: addDakuten(dakuonKana) });
      // ここ、濁点には通常シフトになる文字がないことを仮定しているので注意が必要かも。ゃ後置シフトの箇所も同様。
      table.push({ input: `${info.oneStroke}${withShift(dakutenKey)}`, output: addDakuten(dakuonKana) });
    }
  }

  // ゃ後置シフト（拗音になるかなの場合はゃ後置、それ以外は濁音化）
  const lya = objectEntries(layout).find(([_, info]) => info.oneStroke === "ゃ");
  if (!lya) throw new Error("ゃが見つかりません");
  const lyaKey = positionToUsKeyboardKey(lya[0]);
  for (const [, info] of objectEntries(layout)) {
    const dakuonKana = findDakuonKana(info);
    const youonKana = findYouonKana(info);
    if (youonKana) {
      table.push({ input: `${info.oneStroke}${lyaKey}`, output: `${youonKana}ゃ` });
      table.push({ input: `${info.oneStroke}${withShift(lyaKey)}`, output: `${youonKana}ゃ` });
    } else if (dakuonKana) {
      table.push({ input: `${info.oneStroke}${lyaKey}`, output: addDakuten(dakuonKana) });
      table.push({ input: `${info.oneStroke}${withShift(lyaKey)}`, output: addDakuten(dakuonKana) });
    }
  }

  // ゅ後置シフト（shift1がある場合、拗音になるかなが単打で打てない場合、は+ゅ=ぴを打つ場合）
  const lyu = objectEntries(layout).find(([_, info]) => info.oneStroke === "ゅ");
  if (!lyu) throw new Error("ゅが見つかりません");
  const lyuKey = positionToUsKeyboardKey(lyu[0]);
  for (const [, info] of objectEntries(layout)) {
    const youonKana = findYouonKana(info);
    if (info.shift1) {
      table.push({ input: `${info.oneStroke}${lyuKey}`, output: info.shift1 });
      // table.push({ input: `${info.oneStroke}${withShift(lyuKey)}`, output: info.shift1 });
    } else if (youonKana && youonKana != info.oneStroke) {
      table.push({ input: `${info.oneStroke}${lyuKey}`, output: `${youonKana}ゅ` });
      // table.push({ input: `${info.oneStroke}${withShift(lyuKey)}`, output: `${youonKana}ゅ` });
    } else if (info.oneStroke === "は") {
      table.push({ input: `${info.oneStroke}${lyuKey}`, output: "ぴ" });
      // table.push({ input: `${info.oneStroke}${withShift(lyuKey)}`, output: "ぴ" });
    }
  }

  // ょ後置シフト（shift2がある場合、拗音になるかなが単打で打てない場合、ひ以外のは行の半濁音を打つ場合）
  const lyo = objectEntries(layout).find(([_, info]) => info.oneStroke === "ょ");
  if (!lyo) throw new Error("ょが見つかりません");
  const lyoKey = positionToUsKeyboardKey(lyo[0]);
  for (const [, info] of objectEntries(layout)) {
    const youonKana = findYouonKana(info);
    const hagyouKana = findHagyouKanaExceptHi(info);
    if (info.shift2) {
      table.push({ input: `${info.oneStroke}${lyoKey}`, output: info.shift2 });
      // table.push({ input: `${info.oneStroke}${withShift(lyoKey)}`, output: info.shift2 });
    } else if (youonKana && youonKana != info.oneStroke) {
      table.push({ input: `${info.oneStroke}${lyoKey}`, output: `${youonKana}ょ` });
      // table.push({ input: `${info.oneStroke}${withShift(lyoKey)}`, output: `${youonKana}ょ` });
    } else if (hagyouKana) {
      table.push({ input: `${info.oneStroke}${lyoKey}`, output: addHandakuten(hagyouKana) });
      // table.push({ input: `${info.oneStroke}${withShift(lyoKey)}`, output: addHandakuten(hagyouKana) });
    }
  }

  // 通常シフト
  for (const [position, info] of objectEntries(layout)) {
    const key = positionToUsKeyboardKey(position);

    if (info.normalShift) {
      const kutouten = ["、", "。"];
      if (kutouten.includes(info.normalShift)) {
        // 句読点の場合は確定する
        table.push({ input: `${withShift(key)}`, output: info.normalShift });
      } else {
        table.push({ input: `${withShift(key)}`, nextInput: info.normalShift });
      }
    } else {
      const smallMap: Record<string, string> = { あ: "ぁ", い: "ぃ", う: "ぅ", え: "ぇ", お: "ぉ" };
      const baseVowel = [info.oneStroke, info.shift1, info.shift2, info.normalShift].find(
        (kana) => kana && smallMap[kana]
      ) as keyof typeof smallMap | undefined;
      const gairaionKana = findGairaionKana(info);
      const shiftKeys = ["ゃ", "ゅ", "ょ", "゛"];
      if (shiftKeys.includes(info.oneStroke)) {
        // シフトキーの場合は確定する
        table.push({ input: `${withShift(key)}`, output: info.oneStroke });
      } else if (baseVowel) {
        // 母音があれば小書きを出力する
        table.push({ input: `${withShift(key)}`, output: smallMap[baseVowel] });
      } else if (gairaionKana) {
        // 外来音で使うかながあれば外来音を出力する
        table.push({ input: `${withShift(key)}`, nextInput: gairaionKana });
      } else {
        // そうでなければ単打のかなを出力する
        table.push({ input: `${withShift(key)}`, nextInput: info.oneStroke });
      }
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
