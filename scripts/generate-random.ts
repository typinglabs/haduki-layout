import { Kanas, KeyPosition, UnorderedLayout, NormalKana, keyPositions, Layout, OrderedInfos } from "./core";
import { layoutToRomanTableString } from "./roman-table";
import { objectEntries, objectFromEntries, objectKeys } from "./utils";

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
function printLayout(layout: UnorderedLayout) {
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
 * 条件を満たすキー配列をランダムに生成する
 *
 * 以下の手順で配列を生成する。
 * STEP1. シフトキーを配置する
 *  ゃゅょ゛の4つのシフトキーを配置する
 * STEP2. 濁音になる26かなを配置する
 *  濁音になる26のかなの位置を、シフトキーの4キーを除いた26箇所から決めて配置する。濁音にならない拗音の"にり"の扱いはややこしいので後で決める。
 *  ↑32キーにするのが丸いか。
 * STEP3. あいうえおと句読点を配置する
 *  シフトキーと拗音になるかな、外来音になるかな（ふてうとしつ）以外の場所から、あいうえおと句読点の位置を決めて配置する。
 * STEP4. 残りの濁音、拗音、外来音のいずれにもならないものを、シフトキーを除いた場所に配置する
 *  拗音になるかなのところに置いても良いが、1つまで。
 * STEP5. 各位置に配置したかなから、どのキーを単打、通常シフト、ゅ後置シフト、ょ後置シフトにするかを決める
 *  拗音になるかなに他のキーがあれば、拗音になるかなは強制的に通常シフト位置に配置される。
 */
function generateRandomLayout(): UnorderedLayout {
  const layout: UnorderedLayout = { ...emptyLayout };

  // STEP1. シフトキーを配置する
  const shiftKeys = [Kanas.ゃ, Kanas.ゅ, Kanas.ょ, Kanas.゛];
  const shiftKeyPositions = getRandomSample(objectKeys(layout), 4);
  shiftKeys.forEach((shiftKey, index) => {
    layout[shiftKeyPositions[index]].push(shiftKeys[index]);
  });

  // STEP2. シフトキー以外の位置に濁音になるかなを配置する
  const dakuonKanas = Object.values(Kanas).filter((kana) => kana.type === "normal" && kana.isDakuon) as NormalKana[];
  const availablePositionsForDakuon = objectKeys(layout).filter((position) => !shiftKeyPositions.includes(position));
  const dakuonPositions = getRandomSample(availablePositionsForDakuon, dakuonKanas.length);
  dakuonKanas.forEach((kana, index) => {
    layout[dakuonPositions[index]].push(kana);
  });

  // STEP3. あいうえおと句読点を配置する
  const aiueoKanas = [Kanas.あ, Kanas.い, Kanas.う, Kanas.え, Kanas.お, Kanas["。"], Kanas["、"]];
  const availablePositionsForAiueo = objectKeys(layout).filter((position) => {
    // シフトキーが含まれず、拗音、外来音が含まれていない位置はOK
    const isAvailable = layout[position as KeyPosition].every((kana) => {
      if (kana.type === "shiftKey") return false;
      if (kana.isYouon) return false;
      if (kana.isGairaion) return false;
      return true;
    });
    return isAvailable;
  });
  const aiueoPositions = getRandomSample(availablePositionsForAiueo, aiueoKanas.length);
  aiueoKanas.forEach((kana, index) => {
    layout[aiueoPositions[index]].push(kana);
  });

  // STEP4. 残りのかなを配置する
  const remainingKanas = Object.values(Kanas).filter((kana) => {
    if (kana.type === "shiftKey") return false;
    return !kana.isDakuon && !kana.isYouon && !kana.isGairaion;
  });
  // シフトキー以外の位置に配置する。ただし、拗音になるかなの位置には1つまで配置できる。
  const availablePositionsForRemaining = objectKeys(layout)
    .map((position) => {
      const kanas = layout[position];
      // シフトキーの位置配置できない
      if (kanas.some((kana) => kana.type === "shiftKey")) return [];
      // 拗音になるかなの位置には最大で1つしかおけない
      if (kanas.some((kana) => kana.type === "normal" && kana.isYouon)) return [position];
      // それ以外の場所は、空きスペースの分だけ配置できる
      // TODO
      // const positions: KeyPosition[] = new Array(4 - kanas.length).fill(position);
      const positions: KeyPosition[] = new Array(3 - kanas.length).fill(position);
      return positions;
    })
    .flat();
  const remainingPositions = getRandomSample(availablePositionsForRemaining, remainingKanas.length);
  remainingKanas.forEach((kana, index) => {
    layout[remainingPositions[index]].push(kana);
  });

  return layout;
}

/**
 * ランダムに生成した配列を元に、各キーの役割を決める
 */
function orderLayout(unorderedLayout: UnorderedLayout): Layout {
  const mapped: [KeyPosition, OrderedInfos][] = objectEntries(unorderedLayout).map(([position, kanas]) => {
    if (kanas.length === 0) {
      throw new Error("キーにかなが割り当てられていません");
    }
    const dakuonKana: NormalKana = kanas.find((kana) => kana.type === "normal" && kana.isDakuon) as NormalKana;
    if (kanas.length === 1) {
      const youonKana: NormalKana = kanas.find((kana) => kana.type === "normal" && kana.isYouon) as NormalKana;
      return [position, { oneStroke: kanas[0].kana, dakuonKanaInfo: dakuonKana, youonKanaInfo: youonKana }];
    } else {
      // 拗音になるかなが含まれている場合、強制的に通常シフトに割り当てる
      const youonKana: NormalKana = kanas.find((kana) => kana.type === "normal" && kana.isYouon) as NormalKana;
      if (youonKana) {
        const otherKana = kanas.find((kana) => kana.kana !== youonKana.kana);
        if (!otherKana) {
          throw new Error("otherKana is undefined");
        }
        return [
          position,
          {
            oneStroke: otherKana.kana,
            normalShift: youonKana.kana,
            dakuonKanaInfo: dakuonKana,
            youonKanaInfo: youonKana,
          },
        ];
      } else {
        // 拗音になるかなが含まれていない場合、句読点を通常シフトに割り当ててから、残りのカナをランダムに割り当てる
        const kutoutenKana = kanas.find((kana) => kana.kana === "。" || kana.kana === "、");
        const otherKanas = kanas.filter((kana) => kana.kana !== kutoutenKana?.kana);
        if (otherKanas.length > 3) {
          throw new Error("1つの位置に句読点を除き3つ以上のかなが割り当てられています");
        }

        const shuffledOtherKanas = getRandomSample(otherKanas, otherKanas.length);
        const orderedInfos: OrderedInfos = {
          oneStroke: shuffledOtherKanas[0].kana,
          shift1: shuffledOtherKanas[1]?.kana,
          shift2: shuffledOtherKanas[2]?.kana,
          normalShift: kutoutenKana?.kana,
          dakuonKanaInfo: dakuonKana,
        };

        return [position, orderedInfos];
      }
    }
  });
  const layout = objectFromEntries(mapped);
  return layout;
}

function main() {
  const unorderedLayout = generateRandomLayout();
  printLayout(unorderedLayout);

  const layout = orderLayout(unorderedLayout);
  console.log(layoutToRomanTableString(layout));
}

main();
