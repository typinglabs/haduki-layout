import { describe, expect, test } from "bun:test";
import { Kana, Kanas, validateLayout } from "./core";
import { generateLayout } from "./generate-random";
import { objectEntries } from "./utils";

const top26: (keyof typeof Kanas)[] = [
  "い",
  "う",
  "ん",
  "か",
  "の",
  "と",
  "し",
  "た",
  "て",
  "く",
  "な",
  "に",
  "は",
  "こ",
  "る",
  "っ",
  "す",
  "き",
  "ま",
  "も",
  "つ",
  "お",
  "ら",
  "を",
  "さ",
  "あ",
];

describe("generateLayout", () => {
  test("STEP1: シフトキー4つが単打に配置されること", () => {
    const layout = generateLayout(top26);

    const shiftKanas = ["ゃ", "ゅ", "ょ", "゛"];
    const oneStrokes = Object.values(layout).map((info) => info.oneStroke);

    shiftKanas.forEach((kana) => {
      const occurrences = oneStrokes.filter((k) => k === kana).length;
      expect(occurrences).toBe(1);
    });
  });

  describe("STEP2", () => {
    test("拗音になるかなは単打ではない場合、通常シフトに配置されること", () => {
      const layout = generateLayout(top26);

      let count = 0;
      for (const [, info] of objectEntries(layout)) {
        if (!info.normalShift) continue;
        if (["ち", "ひ", "み", "り"].includes(info.normalShift)) {
          count++;
        }
      }
      expect(count).toBe(4);
    });

    test("は が単打ではない場合はエラーになること", () => {
      const top26WithoutHa: (keyof typeof Kanas)[] = [...top26.filter((kana) => kana !== "は"), "ひ"];

      expect(() => generateLayout(top26WithoutHa)).toThrow("'は'はtop26に含めて単打に配置してください");
    });

    test("ふへほ は単打ではない場合は ゅ後置シフトに配置されること", () => {
      const layout = generateLayout(top26);

      let count = 0;
      for (const [, info] of objectEntries(layout)) {
        if (!info.shift1) continue;
        if (["ふ", "へ", "ほ"].includes(info.shift1)) {
          count++;
        }
      }
      expect(count).toBe(3);
    });

    test("TOP26の濁音になるかなは単打に配置されること", () => {
      const layout = generateLayout(top26);
      const kanaToCheck = ["か", "く", "さ", "す"];

      let count = 0;
      for (const [, info] of objectEntries(layout)) {
        if (kanaToCheck.includes(info.oneStroke)) {
          count++;
        }
      }
      expect(count).toBe(4);
    });

    test("TOP26の拗音になるかなは単打に配置されること", () => {
      const layout = generateLayout(top26);
      const kanaToCheck = ["き", "し", "に"];

      let count = 0;
      for (const [, info] of objectEntries(layout)) {
        if (kanaToCheck.includes(info.oneStroke)) {
          count++;
        }
      }
      expect(count).toBe(3);
    });
  });

  describe("STEP3", () => {
    test("あいおが単打に配置されること", () => {
      const layout = generateLayout(top26);

      const kanaToCheck = ["あ", "い", "お"];
      let count = 0;
      for (const [, info] of objectEntries(layout)) {
        if (kanaToCheck.includes(info.oneStroke)) {
          count++;
        }
      }
      expect(count).toBe(3);
    });

    test("えが後置シフトに配置されること", () => {
      const layout = generateLayout(top26);

      let found = false;
      for (const [, info] of objectEntries(layout)) {
        if (info.shift1 === "え" || info.shift2 === "え") {
          found = true;
        }
      }
      expect(found).toBe(true);
    });
  });
});
