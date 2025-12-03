// 条件を満たす配列をランダムに生成する
// 各キー位置には、単打・通常シフト・ゅ後置シフト・ょ後置シフトのうちいくつかが配置される
// 次の条件を満たすように配置する必要がある。
// 条件1. 拗音になるカナの排他的配置
//  拗音になるイ段のかな（き、し、ち、に、ひ、み、り）は、各位置に1つしか配置できない。
// 条件2. 濁音になるカナの排他的配置
//  濁音になるかな（か、き、く、け、こ、さ、し、....、ま、み、む、め、も）は、各位置に1つしか配置できない。
//  ま行の濁音化をパ行にするため、ま行も必要。
//  またこれらのカナはシフトキーには配置しないことにする。ローマ字テーブルが複雑になるため。
// 条件3. 通常シフトを使うカナの排他的配置
//  通常シフトは句読点、あ行小書き、外来音で使用するが単打ではないカナを1打で打つために使用する。
//  そのため、あいうえおふてうとしちつ は同じ場所に配置できない。
// 条件4. 拗音になるカナの後置シフトには何も配置しない
//  し、き、ち、ひ、み、りの後置シフトに配置しると拗音が打てなくなるため、何も配置しないようにする。

// 以下の手順で配列を生成する
// STEP1. シフトキーを配置する
//  ゃゅょ゛の4つのシフトキーを配置する
// STEP2. 濁音になる26かなを配置する
//  濁音になる26のかなの位置を、シフトキーの4キーを除いた26箇所から決めて配置する。濁音にならない拗音の"にり"の扱いはややこしいので後で決める。
//  ↑32キーにするのが丸いか。
// STEP3. あいうえおと句読点を配置する
//  シフトキーと拗音になるかな、外来音になるかな（ふてうとしつ）以外の場所から、あいうえおと句読点の位置を決めて配置する。
// STEP4. 残りの濁音、拗音、外来音のいずれにもならないものを、シフトキーを除いた場所に配置する
//  拗音になるかなのところに置いても良いが、1つまで。
// STEP5. 各位置に配置したかなから、どのキーを単打、通常シフト、ゅ後置シフト、ょ後置シフトにするかを決める
//  拗音になるかなに他のキーがあれば、拗音になるかなは強制的に通常シフト位置に配置される。

type ShiftKeyKana = {
  type: "shiftKey";
  kana: string;
};

type NormalKana = {
  type: "normal";
  kana: string;
  isDakuon: boolean;
  isYouon: boolean;
  isGairaion: boolean;
};

type KanaInfo = NormalKana | ShiftKeyKana;

const Kanas = {
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
} satisfies Record<string, KanaInfo>;

const KeyPosition =
  0 |
  1 |
  2 |
  3 |
  4 |
  5 |
  6 |
  7 |
  8 |
  9 |
  10 |
  11 |
  12 |
  13 |
  14 |
  15 |
  16 |
  17 |
  18 |
  19 |
  20 |
  21 |
  22 |
  23 |
  24 |
  25 |
  26 |
  27 |
  28 |
  29;

type KeyPosition = typeof KeyPosition;

type Layout = {
  [key in KeyPosition]: KanaInfo[];
};

const emptyLayout: Layout = {
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

/**
 * 配列を表示する
 */
function printLayout(layout: Layout) {
  for (let i = 0; i < 4; i++) {
    let line = "";
    for (let j = 0; j < 30; j++) {
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
 * 条件を満たすキー配列をランダムに生成する
 */
function generateRandomLayout(): Layout {
  const layout: Layout = { ...emptyLayout };

  // STEP1. シフトキーを配置する
  const shiftKeys = [Kanas.ゃ, Kanas.ゅ, Kanas.ょ, Kanas.゛];
  const shiftKeyPositions = getRandomSample(Object.keys(layout), 4);
  shiftKeys.forEach((shiftKey, index) => {
    const position = Number(shiftKeyPositions[index]) as KeyPosition;
    layout[position].push(shiftKey);
  });

  // STEP2. シフトキー以外の位置に濁音になるかなを配置する
  const dakuonKanas = Object.values(Kanas).filter((kana) => kana.type === "normal" && kana.isDakuon) as NormalKana[];
  const availablePositionsForDakuon = Object.keys(layout).filter((position) => !shiftKeyPositions.includes(position));
  const dakuonPositions = getRandomSample(availablePositionsForDakuon, dakuonKanas.length);
  dakuonKanas.forEach((kana, index) => {
    const position = Number(dakuonPositions[index]) as KeyPosition;
    layout[position].push(kana);
  });

  // STEP3. あいうえおと句読点を配置する
  const aiueoKanas = [Kanas.あ, Kanas.い, Kanas.う, Kanas.え, Kanas.お, Kanas["。"], Kanas["、"]];
  const availablePositionsForAiueo = Object.keys(layout).filter((position) => {
    // シフトキーが含まれず、拗音、外来音が含まれていない位置はOK
    const isAvailable = layout[Number(position)].every((kana) => {
      if (kana.type === "shiftKey") return false;
      if (kana.isYouon) return false;
      if (kana.isGairaion) return false;
      return true;
    });
    return isAvailable;
  });
  const aiueoPositions = getRandomSample(availablePositionsForAiueo, aiueoKanas.length);
  aiueoKanas.forEach((kana, index) => {
    const position = Number(aiueoPositions[index]) as KeyPosition;
    layout[position].push(kana);
  });

  // STEP4. 残りのかなを配置する
  const remainingKanas = Object.values(Kanas).filter((kana) => {
    if (kana.type === "shiftKey") return false;
    return !kana.isDakuon && !kana.isYouon && !kana.isGairaion;
  });
  // シフトキー以外の位置に配置する。ただし、拗音になるかなの位置には1つまで配置できる。
  const availablePositionsForRemaining = Object.keys(layout)
    .map((position) => {
      const kanas = layout[Number(position)];
      // シフトキーの位置配置できない
      if (kanas.some((kana) => kana.type === "shiftKey")) return [];
      // 拗音になるかなの位置には最大で1つしかおけない
      if (kanas.some((kana) => kana.type === "normal" && kana.isYouon)) return [Number(position)];
      // それ以外の場所は、空きスペースの分だけ配置できる
      return new Array(4 - kanas.length).fill(Number(position));
    })
    .flat();
  const remainingPositions = getRandomSample(availablePositionsForRemaining, remainingKanas.length);
  remainingKanas.forEach((kana, index) => {
    const position = Number(remainingPositions[index]) as KeyPosition;
    layout[position].push(kana);
  });

  return layout;
}

function main() {
  const layout = generateRandomLayout();
  printLayout(layout);
}

main();
