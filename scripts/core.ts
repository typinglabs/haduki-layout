const kanas = [
  "あ",
  "い",
  "う",
  "え",
  "お",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "は",
  "ひ",
  "ふ",
  "へ",
  "ほ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "や",
  "ゆ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "わ",
  "を",
  "ん",
  "っ",
  "ー",
  "ゃ",
  "ゅ",
  "ょ",
  "゛",
  "。",
  "、",
] as const;

type Kana = (typeof kanas)[number];

type ShiftKeyKana = {
  type: "shiftKey";
  kana: Kana;
};

export type NormalKana = {
  type: "normal";
  kana: Kana;
  isDakuon: boolean;
  isYouon: boolean;
  isGairaion: boolean;
};

export type KanaInfo = NormalKana | ShiftKeyKana;

export const Kanas = {
  あ: { type: "normal", kana: "あ", isDakuon: false, isYouon: false, isGairaion: true },
  い: { type: "normal", kana: "い", isDakuon: false, isYouon: false, isGairaion: true },
  う: { type: "normal", kana: "う", isDakuon: false, isYouon: false, isGairaion: true },
  え: { type: "normal", kana: "え", isDakuon: false, isYouon: false, isGairaion: true },
  お: { type: "normal", kana: "お", isDakuon: false, isYouon: false, isGairaion: true },
  か: { type: "normal", kana: "か", isDakuon: true, isYouon: false, isGairaion: false },
  き: { type: "normal", kana: "き", isDakuon: true, isYouon: true, isGairaion: false },
  く: { type: "normal", kana: "く", isDakuon: true, isYouon: false, isGairaion: false },
  け: { type: "normal", kana: "け", isDakuon: true, isYouon: false, isGairaion: false },
  こ: { type: "normal", kana: "こ", isDakuon: true, isYouon: false, isGairaion: false },
  さ: { type: "normal", kana: "さ", isDakuon: true, isYouon: false, isGairaion: false },
  し: { type: "normal", kana: "し", isDakuon: true, isYouon: true, isGairaion: true },
  す: { type: "normal", kana: "す", isDakuon: true, isYouon: false, isGairaion: false },
  せ: { type: "normal", kana: "せ", isDakuon: true, isYouon: false, isGairaion: false },
  そ: { type: "normal", kana: "そ", isDakuon: true, isYouon: false, isGairaion: false },
  た: { type: "normal", kana: "た", isDakuon: true, isYouon: false, isGairaion: false },
  ち: { type: "normal", kana: "ち", isDakuon: true, isYouon: true, isGairaion: false },
  つ: { type: "normal", kana: "つ", isDakuon: true, isYouon: false, isGairaion: true },
  て: { type: "normal", kana: "て", isDakuon: true, isYouon: false, isGairaion: true },
  と: { type: "normal", kana: "と", isDakuon: true, isYouon: false, isGairaion: true },
  な: { type: "normal", kana: "な", isDakuon: false, isYouon: false, isGairaion: false },
  に: { type: "normal", kana: "に", isDakuon: false, isYouon: true, isGairaion: false },
  ぬ: { type: "normal", kana: "ぬ", isDakuon: false, isYouon: false, isGairaion: false },
  ね: { type: "normal", kana: "ね", isDakuon: false, isYouon: false, isGairaion: false },
  の: { type: "normal", kana: "の", isDakuon: false, isYouon: false, isGairaion: false },
  は: { type: "normal", kana: "は", isDakuon: true, isYouon: false, isGairaion: false },
  ひ: { type: "normal", kana: "ひ", isDakuon: true, isYouon: true, isGairaion: false },
  ふ: { type: "normal", kana: "ふ", isDakuon: true, isYouon: false, isGairaion: true },
  へ: { type: "normal", kana: "へ", isDakuon: true, isYouon: false, isGairaion: false },
  ほ: { type: "normal", kana: "ほ", isDakuon: true, isYouon: false, isGairaion: false },
  ま: { type: "normal", kana: "ま", isDakuon: true, isYouon: false, isGairaion: false },
  み: { type: "normal", kana: "み", isDakuon: true, isYouon: true, isGairaion: false },
  む: { type: "normal", kana: "む", isDakuon: true, isYouon: false, isGairaion: false },
  め: { type: "normal", kana: "め", isDakuon: true, isYouon: false, isGairaion: false },
  も: { type: "normal", kana: "も", isDakuon: true, isYouon: false, isGairaion: false },
  や: { type: "normal", kana: "や", isDakuon: false, isYouon: false, isGairaion: false },
  ゆ: { type: "normal", kana: "ゆ", isDakuon: false, isYouon: false, isGairaion: false },
  よ: { type: "normal", kana: "よ", isDakuon: false, isYouon: false, isGairaion: false },
  ら: { type: "normal", kana: "ら", isDakuon: false, isYouon: false, isGairaion: false },
  り: { type: "normal", kana: "り", isDakuon: false, isYouon: true, isGairaion: false },
  る: { type: "normal", kana: "る", isDakuon: false, isYouon: false, isGairaion: false },
  れ: { type: "normal", kana: "れ", isDakuon: false, isYouon: false, isGairaion: false },
  ろ: { type: "normal", kana: "ろ", isDakuon: false, isYouon: false, isGairaion: false },
  わ: { type: "normal", kana: "わ", isDakuon: false, isYouon: false, isGairaion: false },
  を: { type: "normal", kana: "を", isDakuon: false, isYouon: false, isGairaion: false },
  ん: { type: "normal", kana: "ん", isDakuon: false, isYouon: false, isGairaion: false },
  っ: { type: "normal", kana: "っ", isDakuon: false, isYouon: false, isGairaion: false },
  ー: { type: "normal", kana: "ー", isDakuon: false, isYouon: false, isGairaion: false },
  ゃ: { type: "shiftKey", kana: "ゃ" },
  ゅ: { type: "shiftKey", kana: "ゅ" },
  ょ: { type: "shiftKey", kana: "ょ" },
  ゛: { type: "shiftKey", kana: "゛" },
  "。": { type: "normal", kana: "。", isDakuon: false, isYouon: false, isGairaion: false },
  "、": { type: "normal", kana: "、", isDakuon: false, isYouon: false, isGairaion: false },
} satisfies Record<Kana, KanaInfo>;

export const keyPositions = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
] as const;

export type KeyPosition = (typeof keyPositions)[number];

/**
 * 各かなの位置のみを決めたレイアウト（シフトは未定）
 *
 * 以下のの条件を満たす必要がある。
 * 条件1. 拗音になるカナの排他的配置
 *  拗音になるイ段のかな（き、し、ち、に、ひ、み、り）を、各位置に1つまで配置する。
 * 条件2. 濁音になるカナの排他的配置
 *  濁音になるかな（か、き、く、け、こ、さ、し、....、ま、み、む、め、も）を、各位置に1つまで配置する。
 *  ま行の濁音化をパ行にするため、ま行も必要。
 *  またこれらのカナはシフトキーがある位置には配置しないことにする。ローマ字テーブルが複雑になるため。
 * 条件3. 通常シフトを使うカナの排他的配置
 *  通常シフトは句読点、あ行小書き、外来音で使用するが単打ではないカナ（ふ、て、う、と、し、ち）を1打で打つために使用する。
 *  そのため、あいうえおふてうとしちつ は各位置に1つまで配置する。
 * 条件4. 拗音になるカナの後置シフトには何も配置しない
 *  し、き、ち、ひ、み、りの後置シフトに配置すると拗音が打てなくなるため、何も配置しない。
 */
export type UnorderedLayout = {
  [key in KeyPosition]: KanaInfo[];
};

export type OrderedInfos = {
  oneStroke: Kana;
  shift1?: Kana;
  shift2?: Kana;
  normalShift?: Kana;
};

/**
 * シフトまで決めた完全な配列のレイアウト
 */
export type Layout = {
  [key in KeyPosition]: OrderedInfos;
};
