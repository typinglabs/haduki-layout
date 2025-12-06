import { describe, expect, test } from "bun:test";
import { Layout, validateLayout } from "./core";
import { exportRomanTable, layoutToRomanTableString } from "./roman-table";

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

describe("romanTable", () => {
  test("exampleLayoutが適切なこと", () => {
    expect(() => validateLayout(exampleLayout)).not.toThrow();
  });

  describe("単打", () => {
    test("単打のマッピングが作成されること", () => {
      const table = exportRomanTable(exampleLayout);

      const expectedSingles = [
        { input: "q", nextInput: "ま" },
        { input: "w", nextInput: "す" },
        { input: "e", nextInput: "て" },
        { input: "r", nextInput: "と" },
        { input: "t", nextInput: "つ" },
        { input: "y", nextInput: "さ" },
        { input: "u", nextInput: "し" },
        { input: "i", nextInput: "か" },
        { input: "o", nextInput: "こ" },
        { input: "p", nextInput: "き" },
        { input: "a", nextInput: "も" },
        { input: "s", output: "ゃ" },
        { input: "d", output: "ゅ" },
        { input: "f", nextInput: "う" },
        { input: "g", nextInput: "ん" },
        { input: "h", nextInput: "く" },
        { input: "j", nextInput: "い" },
        { input: "k", output: "ょ" },
        { input: "l", output: "゛" },
        { input: ";", nextInput: "お" },
        { input: "z", nextInput: "を" },
        { input: "x", nextInput: "っ" },
        { input: "c", nextInput: "に" },
        { input: "v", nextInput: "る" },
        { input: "b", nextInput: "た" },
        { input: "n", nextInput: "の" },
        { input: "m", nextInput: "な" },
        { input: ",", nextInput: "は" },
        { input: ".", nextInput: "り" },
        { input: "/", nextInput: "ー" },
      ];

      expect(table).toEqual(expect.arrayContaining(expectedSingles));
    });
  });

  describe("濁点後置シフト", () => {
    test("か -> が", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "かl", output: "が" }]));
    });

    test("き -> ぎ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "きl", output: "ぎ" }]));
    });

    test("シフト面のかなはシフトを省略できること ん/へ -> べ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "んl", output: "べ" }]));
    });

    test("大文字でもシフトができること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(
        expect.arrayContaining([
          { input: "かL", output: "が" },
          { input: "きL", output: "ぎ" },
          // { input: "まL", output: "ぱ" },
          { input: "んL", output: "べ" },
        ])
      );
    });
  });

  describe("ゃシフト", () => {
    test("き -> きゃ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "きs", output: "きゃ" }]));
    });

    test("シフトを省略できること るゃ -> ちゃ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "るs", output: "ちゃ" }]));
    });

    test("拗音でない場合は濁点になること か -> が", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "かs", output: "が" }]));
    });

    test("大文字でもシフトができること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(
        expect.arrayContaining([
          { input: "きS", output: "きゃ" },
          { input: "るS", output: "ちゃ" },
          { input: "かS", output: "が" },
        ])
      );
    });
  });

  describe("ゅシフト", () => {
    test("も -> や", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "もd", output: "せ" }]));
    });

    test("シフトを省略できること るゅ -> ちゅ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "るd", output: "ちゅ" }]));
    });

    test("は行のマイナーかな（ひ以外）は ゅシフトで打てること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(
        expect.arrayContaining([
          { input: "のd", output: "ふ" },
          { input: "んd", output: "へ" },
          { input: "いd", output: "ほ" },
        ])
      );
    });
  });

  describe("ょシフト", () => {
    test("も -> あ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "もk", output: "あ" }]));
    });

    test("シフトを省略できること るょ -> ちょ", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "るk", output: "ちょ" }]));
    });

    test("半濁音（ぴ以外）が ょシフトで打てること", () => {
      const table = exportRomanTable(exampleLayout);

      expect(table).toEqual(
        expect.arrayContaining([
          { input: "はk", output: "ぱ" },
          { input: "のk", output: "ぷ" },
          { input: "んk", output: "ぺ" },
          { input: "いk", output: "ぽ" },
        ])
      );
    });
  });

  describe("通常シフト", () => {
    test("通常シフトで小書きが入力できること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "A", output: "ぁ" }]));
    });

    test("通常シフトで拗音になるマイナーかなを入力できること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(
        expect.arrayContaining([
          { input: "X", nextInput: "み" },
          { input: "V", nextInput: "ち" },
        ])
      );
    });

    test("通常シフトで外来音で使うマイナーかなを入力できること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(expect.arrayContaining([{ input: "N", nextInput: "ふ" }]));
    });

    test("シフトが定義されていない場合は、単打のかなが入力できること", () => {
      const table = exportRomanTable(exampleLayout);
      expect(table).toEqual(
        expect.arrayContaining([
          { input: "Q", nextInput: "ま" },
          { input: "W", nextInput: "す" },
        ])
      );
    });
  });
});
