import { Keystroke } from "./stroke";

/**
 * 打鍵する指
 */
type Finger = 1 | 2 | 3 | 4 | 7 | 8 | 9 | 0;

/**
 * 打鍵する手
 */
type Hand = "Left" | "Right";

function fingerToHand(finger: Finger): Hand {
  if ([1, 2, 3, 4].includes(finger)) {
    return "Left";
  } else {
    return "Right";
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
  const getFinger = (key: string): Finger => {
    const finger = fingeringMap[key];
    if (finger === undefined) throw new Error(`未対応のキーです: ${key}`);
    return finger;
  };

  let lastHand: Hand | null = null;
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

  return strokes.reduce((total, stroke, index) => {
    const finger = getFinger(stroke.key);
    const hand = fingerToHand(finger);

    // 打鍵時間
    let time = parameters.push[finger];

    // 手の交代
    if (lastHand !== null && lastHand !== hand) {
      time += parameters.alt;
    }
    lastHand = hand;

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
