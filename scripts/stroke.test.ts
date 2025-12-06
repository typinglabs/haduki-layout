import { describe, expect, test } from "bun:test";
import { Layout } from "./core";
import { strokesForKana, Keystroke, keystrokeCountForKana, totalKeystrokesForDataset } from "./stroke";

const exampleLayout: Layout = {
  0: { oneStroke: "ま" },
  1: { oneStroke: "す", shift2: "や" },
  2: { oneStroke: "て", shift2: "ゆ" },
  3: { oneStroke: "と", shift2: "め" },
  4: { oneStroke: "つ" },
  5: { oneStroke: "さ" },
  6: { oneStroke: "し" },
  7: { oneStroke: "か", shift1: "よ" },
  8: { oneStroke: "こ", shift1: "ね" },
  9: { oneStroke: "き" },
  10: { oneStroke: "も", shift1: "せ", shift2: "あ", normalShift: "ぁ" },
  11: { oneStroke: "ゃ" },
  12: { oneStroke: "ゅ", normalShift: "、" },
  13: { oneStroke: "う", shift1: "ろ", shift2: "ら", normalShift: "ぅ" },
  14: { oneStroke: "ん", shift1: "へ" },
  15: { oneStroke: "く", shift1: "れ", shift2: "え", normalShift: "ぇ" },
  16: { oneStroke: "い", shift1: "ほ", normalShift: "ぃ" },
  17: { oneStroke: "ょ", normalShift: "。" },
  18: { oneStroke: "゛" },
  19: { oneStroke: "お", shift1: "け", shift2: "ぬ", normalShift: "ぉ" },
  20: { oneStroke: "を", shift1: "そ" },
  21: { oneStroke: "っ", normalShift: "み" },
  22: { oneStroke: "に" },
  23: { oneStroke: "る", normalShift: "ち" },
  24: { oneStroke: "た", shift1: "わ" },
  25: { oneStroke: "の", shift1: "ふ" },
  26: { oneStroke: "な", normalShift: "ひ" },
  27: { oneStroke: "は" },
  28: { oneStroke: "り" },
  29: { oneStroke: "ー" },
};

const expectStrokes = (actual: Keystroke[], expected: Keystroke[]) => {
  expect(actual).toEqual(expected);
};

describe("strokesForKana", () => {
  test("単打のかなを1打で返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "き"), [{ key: "p", shiftKey: false }]);
  });

  test("ゅシフトのかなはベース+ゅキーで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "よ"), [
      { key: "i", shiftKey: false },
      { key: "d", shiftKey: false },
    ]);
  });

  test("ょシフトのかなはベース+ょキーで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "や"), [
      { key: "w", shiftKey: false },
      { key: "k", shiftKey: false },
    ]);
  });

  test("通常シフトのかなをshift付きで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぁ"), [{ key: "a", shiftKey: true }]);
  });

  test("句読点は通常シフトで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "、"), [{ key: "d", shiftKey: true }]);
    expectStrokes(strokesForKana(exampleLayout, "。"), [{ key: "k", shiftKey: true }]);
  });

  test("濁音はベース+゛キーで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "が"), [
      { key: "i", shiftKey: false },
      { key: "l", shiftKey: false },
    ]);
  });

  test("濁音はベース+゛キーで返す（ベースが後置シフトにある場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぼ"), [
      { key: "j", shiftKey: false },
      { key: "l", shiftKey: false },
    ]);
  });

  test("半濁音（ぴ以外）はベース+ょで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぱ"), [
      { key: ",", shiftKey: false },
      { key: "k", shiftKey: false },
    ]);
    expectStrokes(strokesForKana(exampleLayout, "ぷ"), [
      { key: "n", shiftKey: false },
      { key: "k", shiftKey: false },
    ]);
  });

  test("ぴ は は+ゅで返す", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぴ"), [
      { key: ",", shiftKey: false },
      { key: "d", shiftKey: false },
    ]);
  });

  test("拗音はベース+ゃキーで返す（ベースが単打の場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "きゃ"), [
      { key: "p", shiftKey: false },
      { key: "s", shiftKey: false },
    ]);
  });

  test("拗音はベース+ゃキーで返す（ベースが通常シフトの場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "ちゃ"), [
      { key: "v", shiftKey: false },
      { key: "s", shiftKey: false },
    ]);
  });

  test("濁音の拗音はベース+濁点+ゃキーで返す（ベースが単打の場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぎゃ"), [
      { key: "p", shiftKey: false },
      { key: "l", shiftKey: false },
      { key: "s", shiftKey: false },
    ]);
  });

  test("濁音の拗音はベース+濁点+ゃキーで返す（ベースが通常シフトの場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぢゃ"), [
      { key: "v", shiftKey: false },
      { key: "l", shiftKey: false },
      { key: "s", shiftKey: false },
    ]);
  });

  test("外来音はベース+シフト+母音で返す（ベースが単打の場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "てぃ"), [
      { key: "e", shiftKey: false },
      { key: "j", shiftKey: true },
    ]);
    expectStrokes(strokesForKana(exampleLayout, "うぃ"), [
      { key: "f", shiftKey: false },
      { key: "j", shiftKey: true },
    ]);
    expectStrokes(strokesForKana(exampleLayout, "とぅ"), [
      { key: "r", shiftKey: false },
      { key: "f", shiftKey: true },
    ]);
    expectStrokes(strokesForKana(exampleLayout, "しぇ"), [
      { key: "u", shiftKey: false },
      { key: "h", shiftKey: true },
    ]);
  });

  test("外来音はシフト+ベース+シフト+母音で返す（ベースが後置シフトの場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "ふぁ"), [
      { key: "n", shiftKey: true },
      { key: "a", shiftKey: true },
    ]);
    expectStrokes(strokesForKana(exampleLayout, "ちぇ"), [
      { key: "v", shiftKey: true },
      { key: "h", shiftKey: true },
    ]);
  });

  test("濁音の外来音はベース+濁点+シフト+母音で返す（ベースが単打の場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "でぃ"), [
      { key: "e", shiftKey: false },
      { key: "l", shiftKey: false },
      { key: "j", shiftKey: true },
    ]);
    expectStrokes(strokesForKana(exampleLayout, "ゔぃ"), [
      { key: "f", shiftKey: false },
      { key: "l", shiftKey: false },
      { key: "j", shiftKey: true },
    ]);
  });

  test("濁音の外来音はベース+濁点+シフト+母音で返す（ベースが後置シフトの場合）", () => {
    expectStrokes(strokesForKana(exampleLayout, "ぢぇ"), [
      { key: "v", shiftKey: false },
      { key: "l", shiftKey: false },
      { key: "h", shiftKey: true },
    ]);
  });
});

describe("keystrokeCountForKana", () => {
  test("単打は1打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "ま")).toBe(1);
    expect(keystrokeCountForKana(exampleLayout, "す")).toBe(1);
  });

  test("後置シフトのかなは2打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "や")).toBe(2);
    expect(keystrokeCountForKana(exampleLayout, "よ")).toBe(2);
    expect(keystrokeCountForKana(exampleLayout, "ね")).toBe(2);
  });

  test("濁音は2打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "が")).toBe(2);
    expect(keystrokeCountForKana(exampleLayout, "ぜ")).toBe(2);
  });

  test("清音の拗音は2打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "きゃ")).toBe(2);
    expect(keystrokeCountForKana(exampleLayout, "しゃ")).toBe(2);
    expect(keystrokeCountForKana(exampleLayout, "ひゃ")).toBe(2);
  });

  test("濁音の拗音は3打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "ぎゃ")).toBe(3);
    expect(keystrokeCountForKana(exampleLayout, "じゃ")).toBe(3);
    expect(keystrokeCountForKana(exampleLayout, "びゃ")).toBe(3);
  });

  test("清音の外来音は3打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "ふぁ")).toBe(3);
    expect(keystrokeCountForKana(exampleLayout, "てぃ")).toBe(3);
    expect(keystrokeCountForKana(exampleLayout, "うぃ")).toBe(3);
  });

  test("濁音の外来音は4打鍵で打てること", () => {
    expect(keystrokeCountForKana(exampleLayout, "でぃ")).toBe(4);
    expect(keystrokeCountForKana(exampleLayout, "ゔぃ")).toBe(4);
  });
});

describe("totalKeystrokesForDataset", () => {
  test("データセットの打鍵数を合計する", () => {
    const dataset = [
      { kana: "き", count: 10 },
      { kana: "きゃ", count: 5 },
      { kana: "が", count: 3 },
    ];

    // き(1打)*10 + きゃ(2打)*5 + が(2打)*3 = 10 + 10 + 6 = 26
    expect(totalKeystrokesForDataset(exampleLayout, dataset)).toBe(26);
  });
});
