import { describe, expect, test } from "bun:test";
import { Keystroke } from "./stroke";
import { getStrokeTime, parameters } from "./stroke-time";

describe("getStrokeTime", () => {
  describe("push", () => {
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
});
