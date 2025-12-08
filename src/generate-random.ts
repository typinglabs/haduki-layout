import assert from "node:assert/strict";
import {
  Kanas,
  KeyPosition,
  UnorderedLayout,
  keyPositions,
  Layout,
  OrderedInfos,
  Kana,
  KanaInfo,
  NormalKana,
  validateLayout,
} from "./core";
import { getRandomInt, objectEntries, objectFromEntries } from "./utils";

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

type PlaceInfo = {
  type: "shiftKey" | "kanaKey" | undefined;
  youonPlaced: boolean;
  gairaionPlaced: boolean;
};

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
  const placeInfo: Record<KeyPosition, PlaceInfo> = objectFromEntries(
    keyPositions.map((pos) => [pos, { type: undefined, youonPlaced: false, gairaionPlaced: false }])
  );
  const updatePlaceInfo = (pos: KeyPosition, info: NormalKana) => {
    if (info.isYouon) placeInfo[pos].youonPlaced = true;
    if (info.isGairaion) placeInfo[pos].gairaionPlaced = true;
  };

  // STEP1. 後置シフトキーゃゅょ゛を配置する
  const shiftKeys = ["ゃ", "ゅ", "ょ", "゛"] as const;
  for (const shiftKey of shiftKeys) {
    const candidates = keyPositions.filter((pos) => !layout[pos].oneStroke);
    const pos = candidates[getRandomInt(candidates.length)];
    layout[pos].oneStroke = shiftKey;
    placeInfo[pos].type = "shiftKey";
  }

  // STEP2. 濁音または拗音になる24かなを配置する
  // 単打になるかどうかはtop26のリストを見て決める
  const dakuonOrYouons = objectEntries(Kanas).filter(
    ([, info]) => info.type === "normal" && (info.isDakuon || info.isYouon)
  );
  for (const [kana, info] of dakuonOrYouons) {
    assert.ok(info.type === "normal");

    if (top26s.includes(kana)) {
      // top26は単打に配置する
      const positions = keyPositions.filter((pos) => placeInfo[pos].type !== "shiftKey" && !layout[pos].oneStroke);
      const pos = positions[getRandomInt(positions.length)];
      layout[pos].oneStroke = kana;
      updatePlaceInfo(pos, info);
    } else if (info.isYouon) {
      // 拗音は単打でなければ、通常シフトに配置する
      const positions = keyPositions.filter((pos) => placeInfo[pos].type !== "shiftKey" && !layout[pos].normalShift);
      const pos = positions[getRandomInt(positions.length)];
      layout[pos].normalShift = kana;
      updatePlaceInfo(pos, info);
    } else if (kana === "は") {
      // は は単打でなければならない
      throw new Error("'は'はtop26に含めて単打に配置してください");
    } else if (["ふ", "へ", "ほ"].includes(kana)) {
      // ふへほは、単打でなければゅ後置シフトに配置する
      const positions = keyPositions.filter((pos) => placeInfo[pos].type !== "shiftKey" && !layout[pos].shift1);
      const pos = positions[getRandomInt(positions.length)];
      layout[pos].shift1 = kana;
      updatePlaceInfo(pos, info);
    } else {
      // そうでない場合は、ゅ後置シフトまたはょ後置シフトに配置する
      const slot: "shift1" | "shift2" = Math.random() < 0.5 ? "shift1" : "shift2";
      const positions = keyPositions.filter((pos) => placeInfo[pos].type !== "shiftKey" && !layout[pos][slot]);
      const pos = positions[getRandomInt(positions.length)];
      layout[pos][slot] = kana;
      updatePlaceInfo(pos, info);
    }
  }

  // STEP3. 通常シフトに関係する母音と句読点配置する
  const vowels = ["あ", "い", "え", "お"] as const;
  for (const kana of vowels) {
    // 母音を配置できる場所は、シフトと拗音がある場所以外
    if (top26s.includes(kana)) {
      const positions = keyPositions.filter(
        (pos) => !layout[pos].oneStroke && !placeInfo[pos].youonPlaced && !placeInfo[pos].gairaionPlaced
      );
      const pos = positions[getRandomInt(positions.length)];
      layout[pos].oneStroke = kana;
      updatePlaceInfo(pos, Kanas[kana]);
    } else {
      // シフト1または2の空いているところで、拗音と外来音に関するカナが配置されていない場所に配置する
      const slot: "shift1" | "shift2" = Math.random() < 0.5 ? "shift1" : "shift2";
      const positions = keyPositions.filter(
        (pos) => !layout[pos][slot] && !placeInfo[pos].youonPlaced && placeInfo[pos].gairaionPlaced
      );
      const pos = positions[getRandomInt(positions.length)];
      layout[pos][slot] = kana;
      updatePlaceInfo(pos, Kanas[kana]);
    }
  }
  // 句読点を配置できる場所は、ゃ゛シフトと単打ではない拗音がある場所以外
  for (const kana of ["、", "。"] as const) {
    const positions = keyPositions.filter(
      (pos) =>
        !layout[pos].normalShift &&
        !["ゃ", "゛"].includes(layout[pos].oneStroke) &&
        !placeInfo[pos].youonPlaced &&
        !placeInfo[pos].gairaionPlaced
    );
    const pos = positions[getRandomInt(positions.length)];
    layout[pos].normalShift = kana;
    updatePlaceInfo(pos, Kanas[kana]);
  }

  // STEP4. 残りのかなを配置する
  // 後置シフトに置く場合は色々条件があるので注意する
  const restKanas = objectEntries(Kanas).filter(
    ([, info]) => info.type === "normal" && !info.isDakuon && !info.isYouon && !info.isGairaion
  );
  for (const [kana] of restKanas) {
    if (top26s.includes(kana)) {
      const positions = keyPositions.filter((pos) => !layout[pos].oneStroke);
      const pos = positions[getRandomInt(positions.length)];
      layout[pos].oneStroke = kana;
    } else {
      const slot: "shift1" | "shift2" = Math.random() < 0.5 ? "shift1" : "shift2";
      // shift1に置く場合は、拗音または'は'が置かれているところがNG
      // shift2に置く場合は、それに加えてふへほが置かれているところがNG
      const huheho: Kana[] = ["ふ", "へ", "ほ"] as const;
      const positions =
        slot === "shift1"
          ? keyPositions.filter(
              (pos) => !layout[pos][slot] && !placeInfo[pos].youonPlaced && layout[pos].oneStroke !== "は"
            )
          : keyPositions.filter(
              (pos) =>
                !layout[pos][slot] &&
                !placeInfo[pos].youonPlaced &&
                layout[pos].oneStroke !== "は" &&
                !huheho.includes(layout[pos].oneStroke) &&
                !huheho.includes(layout[pos].shift1!)
            );
      const pos = positions[getRandomInt(positions.length)];
      layout[pos][slot] = kana;
    }
  }

  return validateLayout(layout);
}
