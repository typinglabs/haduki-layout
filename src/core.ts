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
  // "ぁ",
  // "ぃ",
  // "ぅ",
  // "ぇ",
  // "ぉ",
  // "ゎ",
] as const;

export type Kana = (typeof kanas)[number];

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
  う: { type: "normal", kana: "う", isDakuon: true, isYouon: false, isGairaion: true },
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
  ち: { type: "normal", kana: "ち", isDakuon: true, isYouon: true, isGairaion: true },
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
  ま: { type: "normal", kana: "ま", isDakuon: false, isYouon: false, isGairaion: false },
  み: { type: "normal", kana: "み", isDakuon: false, isYouon: true, isGairaion: false },
  む: { type: "normal", kana: "む", isDakuon: false, isYouon: false, isGairaion: false },
  め: { type: "normal", kana: "め", isDakuon: false, isYouon: false, isGairaion: false },
  も: { type: "normal", kana: "も", isDakuon: false, isYouon: false, isGairaion: false },
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
} satisfies Partial<Record<Kana, KanaInfo>>;

export const keyPositions = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
] as const;

export const dakuonKanas = [
  "が",
  "ぎ",
  "ぐ",
  "げ",
  "ご",
  "ざ",
  "じ",
  "ず",
  "ぜ",
  "ぞ",
  "だ",
  "ぢ",
  "づ",
  "で",
  "ど",
  "ば",
  "び",
  "ぶ",
  "べ",
  "ぼ",
  "ぱ",
  "ぴ",
  "ぷ",
  "ぺ",
  "ぽ",
  "ゔ",
];

export const dakutenInverse: Record<string, Kana> = {
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

export const kogakiKanas = ["ぁ", "ぃ", "ぅ", "ぇ", "ぉ"];

export const kogakiInverse: Record<string, Kana> = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
};

export type KeyPosition = (typeof keyPositions)[number];

export const keySlots = ["oneStroke", "shift1", "shift2", "normalShift"] as const;

export type KeySlot = (typeof keySlots)[number];

/**
 * 1つのキーへのかなの割り当て
 */
export type KeyAssignment = {
  oneStroke: Kana;
  shift1?: Kana;
  shift2?: Kana;
  normalShift?: Kana;
};

/**
 * 配列のレイアウト
 */
export type Layout = {
  [key in KeyPosition]: KeyAssignment;
};

/**
 * ルールを満たしているレイアウト
 */
export type ValidatedLayout = {
  [key in KeyPosition]: KeyAssignment;
};

/**
 * 配列のバリデーションのエラー
 */
export class LayoutValidationError extends Error {}

/**
 * かな割り当てが条件を満たしていることを確認する
 */
export function validateKeyAssignment(ka: KeyAssignment) {
  const isYouonKana = (kana: string | undefined) => {
    if (!kana) return false;
    const info = Kanas[kana as keyof typeof Kanas];
    return info?.type === "normal" && info.isYouon;
  };
  const isDakuonKana = (kana: string | undefined) => {
    if (!kana) return false;
    const info = Kanas[kana as keyof typeof Kanas];
    return info?.type === "normal" && info.isDakuon;
  };
  const isGairaionKana = (kana: string | undefined) => {
    if (!kana) return false;
    const info = Kanas[kana as keyof typeof Kanas];
    return info?.type === "normal" && info.isGairaion;
  };

  // シフトキーに関するルール:
  const kanaInfo = Kanas[ka.oneStroke as keyof typeof Kanas];
  if (kanaInfo?.type === "shiftKey") {
    // シフトキーの後置シフトには何も配置されていないこと
    if (ka.shift1 || ka.shift2) {
      throw new LayoutValidationError("シフトキーの後置にはかなを配置できません");
    }
    // 濁点シフトキー（ゃ、゛）の通常シフトには何も配置されていないこと
    if ((ka.oneStroke === "ゃ" || ka.oneStroke === "゛") && ka.normalShift) {
      throw new LayoutValidationError(`濁点シフトキー（${ka.oneStroke}）の通常シフトにはかなを配置できません`);
    }

    // ゅ後置シフトとょ後置シフトの通常シフトには句読点以外は配置されていないこと
    if ((ka.oneStroke === "ゅ" || ka.oneStroke === "ょ") && ka.normalShift) {
      if (!["、", "。"].includes(ka.normalShift)) {
        throw new LayoutValidationError(`${ka.oneStroke}シフトキーの通常シフトには句読点以外を配置できません`);
      }
    }
  }

  // 拗音に関するルール:
  const youonKanas = [ka.oneStroke, ka.shift1, ka.shift2, ka.normalShift].filter(isYouonKana);
  if (youonKanas.length > 1) {
    // 拗音になるかなが排他的に配置されていること
    throw new LayoutValidationError("拗音になるかなは1キーに1つまでです");
  }
  if (youonKanas.length === 1) {
    // 拗音になるかなの後置シフトには何も配置されていないこと
    if (ka.shift1 || ka.shift2) {
      throw new LayoutValidationError("拗音になるかなの後置シフトにはかなを配置できません");
    }
  }
  if (ka.normalShift && !["、", "。"].includes(ka.normalShift) && !isYouonKana(ka.normalShift)) {
    throw new LayoutValidationError("拗音になるかなと句読点以外は通常シフトに配置できません");
  }

  // 濁音に関するルール:
  const dakuonKanas = [ka.oneStroke, ka.shift1, ka.shift2, ka.normalShift].filter(isDakuonKana);
  if (dakuonKanas.length > 1) {
    // 濁音になるかなが排他的に配置されていること
    throw new LayoutValidationError("濁音になるかなは1キーに1つまでです");
  }

  // 半濁音に関するルール:
  const haKana = [ka.oneStroke, ka.shift1, ka.shift2, ka.normalShift].filter((kana) => kana === "は");
  if (haKana.length > 0) {
    if (ka.oneStroke !== haKana[0]) {
      // は は単打に配置されていること
      throw new LayoutValidationError("'は'は単打に配置する必要があります");
    }
    if (ka.shift1 || ka.shift2) {
      // は の後置には何も配置されていないこと
      throw new LayoutValidationError("'は'の後置にはかなを配置できません");
    }
  }

  const hahifuKanas = [ka.oneStroke, ka.shift1, ka.shift2, ka.normalShift].filter(
    (kana) => kana !== undefined && ["ふ", "へ", "ほ"].includes(kana)
  );
  if (hahifuKanas.length > 0) {
    const hahifuKana = hahifuKanas[0];
    if (ka.oneStroke !== hahifuKana && ka.shift1 !== hahifuKana) {
      // ふ、へ、ほが単打でない場合は、ゅ後置シフトに配置されていること
      throw new LayoutValidationError(`'${hahifuKana}'は ゅ後置シフトに配置しなければいけません`);
    }
    if (ka.shift2) {
      throw new LayoutValidationError(`'${hahifuKana}'の ょ後置シフトにはかなを配置できません`);
    }
  }

  // 外来音に関するルール
  const gairaionKanas = [ka.oneStroke, ka.shift1, ka.shift2, ka.normalShift].filter(isGairaionKana);
  if (gairaionKanas.length > 1) {
    // 外来音になるかながが排他的に配置されていること
    throw new LayoutValidationError("外来音になるかなは1キーに1つまでです");
  } else if (gairaionKanas.length === 1) {
    // 外来音になるかなの通常シフトには何も配置されていないこと（外来音になるかなが通常シフトにある場合を除く）
    if (ka.normalShift && !isGairaionKana(ka.normalShift)) {
      throw new LayoutValidationError(`外来音になるかなの通常シフトにはかなを配置できません ${JSON.stringify(ka)}`);
    }
  }
}

/**
 * 配列が条件を満たしていることを確認する
 */
export function validateLayout(layout: Layout): ValidatedLayout {
  for (const [, assignment] of Object.entries(layout)) {
    validateKeyAssignment(assignment);
  }
  return layout;
}
