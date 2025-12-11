import { Keystroke, keyForPosition } from "./stroke";

/**
 * 打鍵する指
 */
type Finger = 1 | 2 | 3 | 4 | 7 | 8 | 9 | 0;

/**
 * 打鍵する手
 */
type Hand = "left" | "right";

function fingerToHand(finger: Finger): Hand {
  if ([1, 2, 3, 4].includes(finger)) {
    return "left";
  } else {
    return "right";
  }
}

/**
 * キーと指の対応表
 */
const fingeringMap: Record<string, Finger> = {
  q: 1,
  w: 2,
  e: 3,
  r: 4,
  t: 4,
  y: 7,
  u: 7,
  i: 8,
  o: 9,
  p: 0,
  a: 1,
  s: 2,
  d: 3,
  f: 4,
  g: 4,
  h: 7,
  j: 7,
  k: 8,
  l: 9,
  ";": 0,
  z: 1,
  x: 2,
  c: 3,
  v: 4,
  b: 4,
  n: 7,
  m: 7,
  ",": 8,
  ".": 9,
  "/": 0,
};

const getFinger = (key: string): Finger => {
  const finger = fingeringMap[key];
  if (finger === undefined) throw new Error(`未対応のキーです: ${key}`);
  return finger;
};

/** 座標 */
type Coord = { x: number; y: number };

/**
 * キーの座標
 *
 * 座標系はQキーの左上を原点とし、左向きにx軸、下向きにy軸を取った。
 * キー1個の大きさが1で、キーボードはロースタッガードを仮定。
 */
const keyPosition: Record<string, Coord> = {
  q: { x: 0.5, y: 0.5 },
  w: { x: 1.5, y: 0.5 },
  e: { x: 2.5, y: 0.5 },
  r: { x: 3.5, y: 0.5 },
  t: { x: 4.5, y: 0.5 },
  y: { x: 5.5, y: 0.5 },
  u: { x: 6.5, y: 0.5 },
  i: { x: 7.5, y: 0.5 },
  o: { x: 8.5, y: 0.5 },
  p: { x: 9.5, y: 0.5 },
  a: { x: 0.75, y: 1.5 },
  s: { x: 1.75, y: 1.5 },
  d: { x: 2.75, y: 1.5 },
  f: { x: 3.75, y: 1.5 },
  g: { x: 4.75, y: 1.5 },
  h: { x: 5.75, y: 1.5 },
  j: { x: 6.75, y: 1.5 },
  k: { x: 7.75, y: 1.5 },
  l: { x: 8.75, y: 1.5 },
  ";": { x: 9.75, y: 1.5 },
  z: { x: 1.25, y: 2.5 },
  x: { x: 2.25, y: 2.5 },
  c: { x: 3.25, y: 2.5 },
  v: { x: 4.25, y: 2.5 },
  b: { x: 5.25, y: 2.5 },
  n: { x: 6.25, y: 2.5 },
  m: { x: 7.25, y: 2.5 },
  ",": { x: 8.25, y: 2.5 },
  ".": { x: 9.25, y: 2.5 },
  "/": { x: 10.25, y: 2.5 },
};

/**
 * ホームポジションでの指の座標
 *
 * 少しハの字に構えていると仮定し、小指と人差し指を同じy座標にしている。
 * 薬指はそれより0.5キーぶん上、中指は0.75キーぶん上。
 */
const fingerPosition: Record<Finger, Coord> = {
  1: { x: 0.75, y: 1.75 },
  2: { x: 1.75, y: 1.25 },
  3: { x: 2.75, y: 1 },
  4: { x: 3.75, y: 1.75 },
  7: { x: 6.75, y: 1.75 },
  8: { x: 7.75, y: 1 },
  9: { x: 8.75, y: 1.25 },
  0: { x: 9.75, y: 1.75 },
};

/**
 * 片手であるキーからあるキーへ移動する時の手の移動距離
 *
 * 指はホームポジションから相対位置を保って固定したまま、手を移動させるとして計算する
 */
export function getHandMoveDistance(fromKey: string, toKey: string): number {
  const fromPos = keyPosition[fromKey];
  const toPos = keyPosition[toKey];
  if (!fromPos || !toPos) throw new Error(`未対応のキーです: ${fromKey}, ${toKey}`);

  const fromFinger = getFinger(fromKey);
  const toFinger = getFinger(toKey);

  const fromHand = fingerToHand(fromFinger);
  const toHand = fingerToHand(toFinger);
  if (fromHand !== toHand) throw new Error(`異なる手の移動は計算できません: ${fromKey} -> ${toKey}`);

  const fromFingerPos = fingerPosition[fromFinger];
  const toFingerPos = fingerPosition[toFinger];

  const dx = toPos.x - fromPos.x + fromFingerPos.x - toFingerPos.x;
  const dy = toPos.y - fromPos.y + fromFingerPos.y - toFingerPos.y;
  return Math.hypot(dx, dy);
}

/**
 * 打鍵モデルのパラメーター
 */
type Parameters = {
  /** 手の交代にかかる時間 */
  alt: number;
  /** 打鍵にかかる時間 */
  push: Record<Finger, number>;
  /** 同指連続のペナルティ */
  pena: Record<Finger, number>;
  /** 手の移動時間の定数（ms/距離） */
  move: number;
};

export const parameters: Parameters = {
  alt: 25,
  push: {
    1: 45,
    2: 40,
    3: 30,
    4: 30,
    7: 30,
    8: 30,
    9: 40,
    0: 45,
  },
  pena: {
    1: 130,
    2: 130,
    3: 120,
    4: 120,
    7: 120,
    8: 120,
    9: 130,
    0: 130,
  },
  move: 20,
};

/**
 * ストロークに対する打鍵時間（ms）を計算する
 */
export function getStrokeTime(strokes: Keystroke[]): number {
  let prevHand: Hand | undefined = undefined;
  /** ある指を最後に使ったときを記録する */
  let lastFinger: Record<Finger, { index: number } | undefined> = {
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
    7: undefined,
    8: undefined,
    9: undefined,
    0: undefined,
  };

  /** ある手を最後に使ったときを記録する */
  let lastHand: Record<Hand, { index: number; key: string } | undefined> = {
    left: undefined,
    right: undefined,
  };

  return strokes.reduce((total, stroke, index) => {
    const finger = getFinger(stroke.key);
    const hand = fingerToHand(finger);

    // 打鍵時間
    let time = parameters.push[finger];

    // 手の交代
    if (prevHand !== undefined && prevHand !== hand) {
      time += parameters.alt;
    }
    prevHand = hand;

    // 手の移動
    if (lastHand[hand] !== undefined) {
      const diff = index - lastHand[hand].index;
      if (diff <= 2) {
        const k = diff === 1 ? 1 : 0.3;
        time += k * parameters.move * getHandMoveDistance(lastHand[hand].key, stroke.key);
      }
    }
    lastHand[hand] = { index, key: stroke.key };

    // 同指連続のペナルティ
    if (lastFinger[finger] !== undefined) {
      const diff = index - lastFinger[finger].index;
      if (diff <= 2) {
        const k = diff === 1 ? 1 : 0.3;
        time += k * parameters.pena[finger];
      }
    }
    lastFinger[finger] = { index };

    return total + time;
  }, 0);
}

type TrigramStrokeTime = Array<Array<Array<number>>>;
const SIZE = 30;

const keyToPositionMap: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (let i = 0; i < SIZE; i++) {
    const key = keyForPosition(i.toString());
    map[key] = i;
  }
  return map;
})();

const toIndex = (key: string): number => {
  const index = keyToPositionMap[key];
  if (index === undefined) throw new Error(`未知のキーです: ${key}`);
  return index;
};

/**
 * 3-gramを打つときの、3番目のキーの打鍵時間
 */
const trigramStrokeTime: TrigramStrokeTime = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => -1))
);

// 3-gramの打鍵時間を前計算する
for (let i = 0; i < SIZE; i++) {
  for (let j = 0; j < SIZE; j++) {
    for (let k = 0; k < SIZE; k++) {
      const trigram = keyForPosition(i.toString()) + keyForPosition(j.toString()) + keyForPosition(k.toString());
      const strokes = trigram.split("").map((key) => ({ key, shiftKey: false }));
      const firstTwo = strokes.slice(0, 2);

      // 3キー全体の時間 - 最初の2キーの時間 = 3打鍵目に追加でかかる時間
      const strokeTime = getStrokeTime(strokes) - getStrokeTime(firstTwo);
      trigramStrokeTime[i][j][k] = strokeTime;
    }
  }
}

export function getTrigramStrokeTime(strokes: [Keystroke, Keystroke, Keystroke]): number {
  const a = toIndex(strokes[0].key);
  const b = toIndex(strokes[1].key);
  const c = toIndex(strokes[2].key);
  return trigramStrokeTime[a][b][c];
}

/**
 * 3-gramの打鍵時間を使って、打鍵時間を計算する
 */
export function getStrokeTimeByTrigram(strokes: Keystroke[]): number {
  let strokeTime = getStrokeTime(strokes.slice(0, 2));
  for (let i = 0; i < strokes.length - 2; i++) {
    strokeTime += getTrigramStrokeTime([strokes[i], strokes[i + 1], strokes[i + 2]]);
  }

  return strokeTime;
}
