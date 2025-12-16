import { describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createLayoutWithShiftKeys,
  getPlacementCandidates,
  searchLayout,
  scoreLayout,
  getTrigramOrder,
} from "./layout-search";
import { validateLayout } from "./core";
import { loadKanaByFrequency, loadTrigramDataset } from "./dataset";

describe("loadTrigramDataset", () => {
  test("タブ区切りの3-gramデータを読み込めること", () => {
    const tmpPath = join(tmpdir(), "trigram-sample.tsv");
    const content = ["100\tている", "50\tいる。", "", "25\tとして"].join("\n");
    writeFileSync(tmpPath, content);

    const result = loadTrigramDataset(tmpPath);

    expect(result).toEqual([
      { trigram: "ている", count: 100 },
      { trigram: "いる。", count: 50 },
      { trigram: "として", count: 25 },
    ]);
  });
});

describe("loadKanaByFrequency", () => {
  test("1gramを頻度順に読み込み、ゃゅょを除外すること", () => {
    const tmpPath = join(tmpdir(), "onegram-sample.tsv");
    const content = ["10\tあ", "5\tゃ", "20\tい", "15\tゅ", "7\tん"].join("\n");
    writeFileSync(tmpPath, content);

    const result = loadKanaByFrequency(tmpPath);

    expect(result).toEqual([
      "い", // 20
      "あ", // 10
      "ん", // 7
    ]);
  });
});

describe("createLayoutWithShiftKeys", () => {
  test("ゃゅょ゛が固定位置に配置されること", () => {
    const layout = createLayoutWithShiftKeys();
    expect(layout[11].oneStroke).toBe("ゃ");
    expect(layout[12].oneStroke).toBe("ゅ");
    expect(layout[17].oneStroke).toBe("ょ");
    expect(layout[18].oneStroke).toBe("゛");
  });
});

describe("getPlacementCandidatesWithSlots", () => {
  test("shiftキーが置かれているキーは全スロット除外されること", () => {
    const layout = createLayoutWithShiftKeys();
    const candidates = getPlacementCandidates(layout, "あ");
    const positions = candidates.map((c) => c.position);
    expect(positions).not.toContain(11);
    expect(positions).not.toContain(12);
    expect(positions).not.toContain(17);
    expect(positions).not.toContain(18);
  });

  test("拗音/濁音になるかなは拗音/濁音配置済みキーを除外すること", () => {
    const layout = createLayoutWithShiftKeys();
    layout[5].oneStroke = "き"; // 拗音になる
    const positions = getPlacementCandidates(layout, "し").map((c) => c.position);
    expect(positions).not.toContain(5);
  });

  test("外来音は拗音/外来音配置済みキーを除外すること", () => {
    const layout = createLayoutWithShiftKeys();
    layout[6].normalShift = "あ"; // 外来音に使われる母音
    const positions = getPlacementCandidates(layout, "て").map((c) => c.position);
    expect(positions).not.toContain(6);
  });

  test("ふ/へ/ほが置かれているキーのshift2は除外されること", () => {
    const layout = createLayoutWithShiftKeys();
    layout[7].oneStroke = "ふ";
    const slots = getPlacementCandidates(layout, "あ").filter((c) => c.position === 7);
    expect(slots.some((c) => c.slot === "shift2")).toBe(false);
  });

  test("は はoneStrokeのみ候補になること", () => {
    const layout = createLayoutWithShiftKeys();
    const slots = getPlacementCandidates(layout, "は");
    expect(slots.every((c) => c.slot === "oneStroke")).toBe(true);
  });
});

describe("searchLayout", () => {
  test("貪欲法で配置したレイアウトがvalidateLayoutを通過すること", () => {
    const layout = searchLayout({ trigrams: [], kanaOrder: ["あ", "い", "う", "え", "お"] });
    expect(() => validateLayout(layout)).not.toThrow();
  });

  test("同じかなが複数のスロットに配置されないこと", () => {
    const layout = searchLayout({ trigrams: [], kanaOrder: ["あ", "い", "う", "え", "お", "か", "き"] });
    const counts = new Map<string, number>();

    for (const info of Object.values(layout)) {
      for (const slot of ["oneStroke", "shift1", "shift2", "normalShift"] as const) {
        const kana = info[slot];
        if (!kana) continue;
        counts.set(kana, (counts.get(kana) ?? 0) + 1);
      }
    }

    for (const [, count] of counts.entries()) {
      expect(count).toBe(1);
    }
  });
});

describe("getTrigramOrder", () => {
  test("一番順番が大きいものが採用されること", () => {
    const kanaOrder = ["い", "う", "ん", "し"];

    expect(getTrigramOrder("いいい", kanaOrder)).toBe(0);
    expect(getTrigramOrder("いいう", kanaOrder)).toBe(1);
    expect(getTrigramOrder("いうん", kanaOrder)).toBe(2);
    expect(getTrigramOrder("うんし", kanaOrder)).toBe(3);
  });

  test("濁音の順番は清音での順番になること", () => {
    const kanaOrder = ["い", "う", "ん", "し"];

    expect(getTrigramOrder("いいゔ", kanaOrder)).toBe(1);
    expect(getTrigramOrder("ゔんじ", kanaOrder)).toBe(3);
  });

  test("拗音の順番はゃゅょ抜きでの順番になること", () => {
    const kanaOrder = ["い", "う", "ん", "し", "か", "き"];

    expect(getTrigramOrder("いうしゃ", kanaOrder)).toBe(3);
    expect(getTrigramOrder("んしゅきょ", kanaOrder)).toBe(5);
  });

  test("小書きの順番は対応する母音の順番になること", () => {
    const kanaOrder = ["い", "う", "ん", "し"];

    expect(getTrigramOrder("ぃぃぃ", kanaOrder)).toBe(0);
    expect(getTrigramOrder("いいぅ", kanaOrder)).toBe(1);
    expect(getTrigramOrder("ぃぅし", kanaOrder)).toBe(3);
  });
});
