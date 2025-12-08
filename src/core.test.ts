import { describe, expect, test } from "bun:test";
import { Kanas, Layout, keyPositions, validateLayout } from "./core";

describe("かな", () => {
  test("濁音になるかなが21個あること", () => {
    const dakuonKanas = Object.values(Kanas).filter((kanaInfo) => kanaInfo.type === "normal" && kanaInfo.isDakuon);

    expect(dakuonKanas).toHaveLength(21);
  });

  test("拗音になるかなは「き、し、ち、に、ひ、み、り」であること", () => {
    const youonKanas = Object.values(Kanas)
      .filter((kanaInfo) => kanaInfo.type === "normal" && kanaInfo.isYouon)
      .map((info) => info.kana);
    expect(youonKanas).toEqual(["き", "し", "ち", "に", "ひ", "み", "り"]);
  });

  test("外来音になるかなは「あ、い、う、え、お、し、ち、つ、て、と、ふ」であること", () => {
    const gairaionKanas = Object.values(Kanas)
      .filter((kanaInfo) => kanaInfo.type === "normal" && kanaInfo.isGairaion)
      .map((info) => info.kana);
    expect(gairaionKanas).toEqual(["あ", "い", "う", "え", "お", "し", "ち", "つ", "て", "と", "ふ"]);
  });
});

describe("validateLayout", () => {
  const baseLayout: Layout = Object.fromEntries(
    keyPositions.map((position) => [position, { oneStroke: "あ" }])
  ) as Layout;

  describe("シフトキーに関するルール", () => {
    test("シフトキーの後置シフトに他のかなが配置されていたらエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "ゃ", shift1: "い" },
      };

      expect(() => validateLayout(layout)).toThrow("シフトキーの後置にはかなを配置できません");
    });

    test("シフトキーの後置シフトに何も配置されていなければ通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "ゃ" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    test("濁点シフトキー（ゃ）の通常シフトにかながあるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "ゃ", normalShift: "あ" },
      };

      expect(() => validateLayout(layout)).toThrow("濁点シフトキー（ゃ）の通常シフトにはかなを配置できません");
    });

    test("濁点シフトキー（ゃ）の通常シフトが空なら通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "ゃ" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    test("濁点シフトキー（゛）の通常シフトにかながあるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "゛", normalShift: "あ" },
      };

      expect(() => validateLayout(layout)).toThrow("濁点シフトキー（゛）の通常シフトにはかなを配置できません");
    });

    test("濁点シフトキー（゛）の通常シフトが空なら通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "゛" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });
  });

  describe("拗音に関するルール", () => {
    test("拗音になるかなが同じキーに複数あるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "き", shift1: "し" },
      };

      expect(() => validateLayout(layout)).toThrow("拗音になるかなは1キーに1つまでです");
    });

    test("拗音になるかなの後置シフトにかながあるとエラーになる（拗音になるかなが単打の場合）", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "き", shift1: "な" },
      };

      expect(() => validateLayout(layout)).toThrow("拗音になるかなの後置シフトにはかなを配置できません");
    });

    test("拗音になるかなの後置シフトにかながあるとエラーになる（拗音になるかなが通常シフトの場合）", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "な", normalShift: "き", shift1: "い" },
      };

      expect(() => validateLayout(layout)).toThrow("拗音になるかなの後置シフトにはかなを配置できません");
    });

    test("拗音になるかなの後置シフトに何もなければ通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "き" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    test("拗音になるかなが単打でない場合は通常シフトに置く必要がある", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "な", shift1: "き" },
      };

      // NOTE: この条件は後置シフトに配置されていなければ自然に満たされる
      expect(() => validateLayout(layout)).toThrow("拗音になるかなの後置シフトにはかなを配置できません");
    });

    test("拗音になるかなが通常シフトにあれば通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "な", normalShift: "き" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });
  });

  describe("濁音に関するルール", () => {
    test("濁音になるかなが同じキーに複数あるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "か", shift1: "く" },
      };

      expect(() => validateLayout(layout)).toThrow("濁音になるかなは1キーに1つまでです");
    });

    test("濁音になるかなが1つなら通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "か" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });
  });

  describe("半濁音に関するルール", () => {
    test("は が後置シフトにあるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "あ", shift1: "は" },
      };

      expect(() => validateLayout(layout)).toThrow("'は'は単打に配置する必要があります");
    });

    test("は の後置シフトがあるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "は", shift1: "あ" },
      };

      expect(() => validateLayout(layout)).toThrow("'は'の後置にはかなを配置できません");
    });

    test("は が単打にあり、後置シフトが定義されていないと通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "は" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    test("ふへほ が単打ではない場合、ゅ後置シフトに定義されていないとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "な", shift2: "ふ" },
      };

      expect(() => validateLayout(layout)).toThrow("'ふ'は ゅ後置シフトに配置しなければいけません");
    });

    test("ふへほ に ょ後置シフトが定義されているとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "ふ", shift2: "な" },
      };

      expect(() => validateLayout(layout)).toThrow("'ふ'の ょ後置シフトにはかなを配置できません");
    });

    test("ふへほ が単打で、ょ後置シフトが定義されていないと通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "ふ", shift1: "な" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    test("ふへほ が ゅ後置シフトで、ょ後置シフトが定義されていない通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "な", shift1: "ふ" },
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });
  });

  describe("外来音に関するルール", () => {
    test("外来音になるかなが同じキーに複数あるとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "あ", shift1: "ふ" },
      };

      expect(() => validateLayout(layout)).toThrow("外来音になるかなは1キーに1つまでです");
    });

    test("外来音になるかなが同じキーに1つしかなければ通る", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "あ", shift1: "な" },
      };

      expect(() => validateLayout(layout)).not.toThrowError();
    });

    test("外来音になるかながある場所の、通常シフトに定義されているとエラーになる", () => {
      const layout: Layout = {
        ...baseLayout,
        0: { oneStroke: "あ", normalShift: "な" },
      };

      expect(() => validateLayout(layout)).toThrowError("外来音になるかなの通常シフトにはかなを配置できません");
    });
  });
});
