import { readFileSync } from "node:fs";
import { Kanas } from "./core";

export type TrigramEntry = { trigram: string; count: number };

/**
 * wikipedia.hiragana-ized.3gram.txt を読み込んで3-gramの配列を返す
 */
export function loadTrigramDataset(path = "dataset/wikipedia.hiragana-ized.3gram.txt"): TrigramEntry[] {
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    const [countStr, trigram] = line.split("\t");
    return { trigram, count: Number(countStr) };
  });
}

export type OneGramEntry = { kana: string; count: number };

const shiftKeyKanas = new Set(["ゃ", "ゅ", "ょ"]);

/**
 * wikipedia.hiragana-ized.1gram.txt を読み込み、頻度順（降順）にかなを並べる
 * シフトキーのかな（ゃ/ゅ/ょ）は除外する
 */
export function loadKanaByFrequency(path = "dataset/wikipedia.hiragana-ized.1gram.txt"): string[] {
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const entries: OneGramEntry[] = lines.map((line) => {
    const [countStr, kana] = line.split("\t");
    return { kana, count: Number(countStr) };
  });

  const kanaSet = new Set(Object.keys(Kanas));

  return entries
    .filter((entry) => kanaSet.has(entry.kana) && !shiftKeyKanas.has(entry.kana))
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.kana);
}
