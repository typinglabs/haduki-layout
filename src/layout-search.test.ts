import { describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createLayoutWithShiftKeys,
  getPlacementCandidates,
  loadKanaByFrequency,
  loadTrigramDataset,
  searchLayout,
} from "./layout-search";
import { validateLayout } from "./core";

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
    const layout = searchLayout();
    expect(() => validateLayout(layout)).not.toThrow();
  });
});
