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
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "ゎ",
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

export type KeyPosition = (typeof keyPositions)[number];

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

/**
 * ルールを満たしているレイアウト
 */
export type ValidatedLayout = {
  [key in KeyPosition]: OrderedInfos;
};

/**
 * 配列が条件を満たしていることを確認する
 */
export function validateLayout(layout: Layout): ValidatedLayout {
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

  for (const [, info] of Object.entries(layout)) {
    // シフトキーに関するルール:
    const kanaInfo = Kanas[info.oneStroke as keyof typeof Kanas];
    if (kanaInfo?.type === "shiftKey") {
      // シフトキーの後置シフトには何も配置されていないこと
      if (info.shift1 || info.shift2) {
        throw new Error("シフトキーの後置にはかなを配置できません");
      }
      // 濁点シフトキー（ゃ、゛）の通常シフトには何も配置されていないこと
      if ((info.oneStroke === "ゃ" || info.oneStroke === "゛") && info.normalShift) {
        throw new Error(`濁点シフトキー（${info.oneStroke}）の通常シフトにはかなを配置できません`);
      }
    }

    // 拗音に関するルール:
    const youonKanas = [info.oneStroke, info.shift1, info.shift2, info.normalShift].filter(isYouonKana);
    if (youonKanas.length > 1) {
      // 拗音になるかなが排他的に配置されていること
      throw new Error("拗音になるかなは1キーに1つまでです");
    }
    if (youonKanas.length === 1) {
      // 拗音になるかなの後置シフトには何も配置されていないこと
      if (info.shift1 || info.shift2) {
        throw new Error("拗音になるかなの後置シフトにはかなを配置できません");
      }
    }
    if (info.normalShift && !["、", "。"].includes(info.normalShift) && !isYouonKana(info.normalShift)) {
      throw new Error("拗音になるかなと句読点以外は通常シフトに配置できません");
    }

    // 濁音に関するルール:
    const dakuonKanas = [info.oneStroke, info.shift1, info.shift2, info.normalShift].filter(isDakuonKana);
    if (dakuonKanas.length > 1) {
      // 濁音になるかなが排他的に配置されていること
      throw new Error("濁音になるかなは1キーに1つまでです");
    }

    // 半濁音に関するルール:
    const haKana = [info.oneStroke, info.shift1, info.shift2, info.normalShift].filter((kana) => kana === "は");
    if (haKana.length > 0) {
      if (info.oneStroke !== haKana[0]) {
        // は は単打に配置されていること
        throw new Error("'は'は単打に配置する必要があります");
      }
      if (info.shift1 || info.shift2) {
        // は の後置には何も配置されていないこと
        throw new Error("'は'の後置にはかなを配置できません");
      }
    }

    const hahifuKanas = [info.oneStroke, info.shift1, info.shift2, info.normalShift].filter(
      (kana) => kana !== undefined && ["ふ", "へ", "ほ"].includes(kana)
    );
    if (hahifuKanas.length > 0) {
      const hahifuKana = hahifuKanas[0];
      if (info.oneStroke !== hahifuKana && info.shift1 !== hahifuKana) {
        // ふ、へ、ほが単打でない場合は、ゅ後置シフトに配置されていること
        throw new Error(`'${hahifuKana}'は ゅ後置シフトに配置しなければいけません`);
      }
      if (info.shift2) {
        throw new Error(`'${hahifuKana}'の ょ後置シフトにはかなを配置できません`);
      }
    }

    // 外来音に関するルール
    const gairaionKanas = [info.oneStroke, info.shift1, info.shift2, info.normalShift].filter(isGairaionKana);
    if (gairaionKanas.length > 1) {
      // 外来音になるかながが排他的に配置されていること
      throw new Error("外来音になるかなは1キーに1つまでです");
    } else if (gairaionKanas.length === 1) {
      // 外来音になるかなの通常シフトには何も配置されていないこと（外来音になるかなが通常シフトにある場合を除く）
      if (info.normalShift && !isGairaionKana(info.normalShift)) {
        throw new Error(`外来音になるかなの通常シフトにはかなを配置できません ${JSON.stringify(info)}`);
      }
    }
  }

  return layout;
}
