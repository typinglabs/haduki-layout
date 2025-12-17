import { describe, expect, test } from "bun:test";
import { Keystroke } from "./stroke";
import { getHandMoveDistance, getStrokeTime, parameters } from "./stroke-time";

describe("getHandMoveDistance", () => {
  test("qキーからqキー", () => {
    // 移動なし
    expect(getHandMoveDistance("q", "q")).toBe(0);
  });
  test("qキーからwキー", () => {
    // 左手薬指を下に0.5キー分動かす
    expect(getHandMoveDistance("q", "w")).toBe(0.5);
  });
  test("qキーからeキー", () => {
    // 左手中指を下に0.75キー分動かす
    expect(getHandMoveDistance("q", "e")).toBe(0.75);
  });
  test("qキーからrキー", () => {
    // 移動なし
    expect(getHandMoveDistance("q", "r")).toBe(0);
  });
  test("qキーからtキー", () => {
    // 左手人差し指を右に1キー分動かす
    expect(getHandMoveDistance("q", "t")).toBe(1);
  });
});

describe("getStrokeTime", () => {
  describe("打鍵時間 push", () => {
    test("左手小指の打鍵時間がpush[1]になること", () => {
      expect(getStrokeTime([{ key: "a", shiftKey: false }])).toBe(parameters.push[1]);
    });

    test("左手薬指の打鍵時間がpush[2]になること", () => {
      expect(getStrokeTime([{ key: "s", shiftKey: false }])).toBe(parameters.push[2]);
    });

    test("左手中指の打鍵時間がpush[3]になること", () => {
      expect(getStrokeTime([{ key: "d", shiftKey: false }])).toBe(parameters.push[3]);
    });

    test("左手人差し指の打鍵時間がpush[4]になること", () => {
      expect(getStrokeTime([{ key: "f", shiftKey: false }])).toBe(parameters.push[4]);
      expect(getStrokeTime([{ key: "g", shiftKey: false }])).toBe(parameters.push[4]);
    });

    test("右手人差し指の打鍵時間がpush[7]になること", () => {
      expect(getStrokeTime([{ key: "h", shiftKey: false }])).toBe(parameters.push[7]);
      expect(getStrokeTime([{ key: "j", shiftKey: false }])).toBe(parameters.push[7]);
    });

    test("右手中指の打鍵時間がpush[8]になること", () => {
      expect(getStrokeTime([{ key: "k", shiftKey: false }])).toBe(parameters.push[8]);
    });

    test("右手薬指の打鍵時間がpush[9]になること", () => {
      expect(getStrokeTime([{ key: "l", shiftKey: false }])).toBe(parameters.push[9]);
    });

    test("右手小指の打鍵時間がpush[0]になること", () => {
      expect(getStrokeTime([{ key: ";", shiftKey: false }])).toBe(parameters.push[0]);
    });
  });

  describe("手の交代 alt", () => {
    test("左手から右手に交代するとaltが加算されること", () => {
      const strokes: Keystroke[] = [
        { key: "a", shiftKey: false },
        { key: "l", shiftKey: false },
      ];
      expect(getStrokeTime(strokes)).toBe(parameters.push[1] + parameters.alt + parameters.push[9]);
    });

    test("右手から左手に交代するとaltが加算されること", () => {
      const strokes: Keystroke[] = [
        { key: "k", shiftKey: false },
        { key: "s", shiftKey: false },
      ];
      expect(getStrokeTime(strokes)).toBe(parameters.push[8] + parameters.alt + parameters.push[2]);
    });
  });

  describe("同指連続のペナルティ pena", () => {
    test("同じ指を連続で使うとpenaが加算されること 左手人差し指", () => {
      const strokes: Keystroke[] = [
        { key: "f", shiftKey: false },
        { key: "f", shiftKey: false },
      ];
      expect(getStrokeTime(strokes)).toBe(parameters.push[4] * 2 + parameters.pena[4]);
    });

    test("同じ指を連続で使うとpenaが加算されること 右手人差し指", () => {
      const strokes: Keystroke[] = [
        { key: "j", shiftKey: false },
        { key: "j", shiftKey: false },
      ];
      expect(getStrokeTime(strokes)).toBe(parameters.push[7] * 2 + parameters.pena[7]);
    });

    test("1つ打鍵を開けて同じ指を連続で使うと、pena*0.3が加算されること", () => {
      const strokes: Keystroke[] = [
        { key: "f", shiftKey: false },
        { key: "j", shiftKey: false },
        { key: "f", shiftKey: false },
      ];
      const expectedTime =
        parameters.push[4] +
        (parameters.push[7] + parameters.alt) +
        (parameters.push[4] + parameters.alt + parameters.pena[4] * 0.3);
      expect(getStrokeTime(strokes)).toBe(expectedTime);
    });
  });

  describe("手の移動 move", () => {
    test("直前に同じ手でキーを押していた場合、move * 距離 が加算されること", () => {
      const strokes: Keystroke[] = [
        { key: "a", shiftKey: false },
        { key: "g", shiftKey: false },
      ];
      const expectedTime = parameters.push[1] + parameters.move * 1 + parameters.push[4];
      expect(getStrokeTime(strokes)).toBe(expectedTime);
    });

    test("二つ前に同じ手でキーを押していた場合、move * 距離 * 0.3が加算されること", () => {
      const strokes: Keystroke[] = [
        { key: "a", shiftKey: false },
        { key: "j", shiftKey: false },
        { key: "g", shiftKey: false },
      ];
      const expectedTime =
        parameters.push[1] +
        (parameters.alt + parameters.push[7]) +
        (parameters.alt + parameters.push[4] + parameters.move * 1 * 0.3);
      expect(getStrokeTime(strokes)).toBe(expectedTime);
    });
  });
});
