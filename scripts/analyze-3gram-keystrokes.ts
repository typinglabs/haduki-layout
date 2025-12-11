import { readFileSync } from "node:fs";
import { exampleLayout } from "../src/layout-fixtures";
import { textToStrokes } from "../src/stroke";

type Entry = { count: number; text: string };

const filePath = process.argv[2] ?? "dataset/wikipedia.hiragana-ized.3gram.txt";

const lines = readFileSync(filePath, "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

const entries: Entry[] = lines.map((line) => {
  const [countStr, text] = line.split("\t");
  return { count: Number(countStr), text };
});

type Bucket = { occurrences: number; entries: number };
const buckets = new Map<number, Bucket>();
let skippedEntries = 0;

for (const entry of entries) {
  try {
    const strokes = textToStrokes(exampleLayout, entry.text);
    if (strokes.length === 0) {
      skippedEntries++;
      continue;
    }
    const len = strokes.length;
    const bucket = buckets.get(len) ?? { occurrences: 0, entries: 0 };
    bucket.occurrences += entry.count;
    bucket.entries += 1;
    buckets.set(len, bucket);
  } catch {
    skippedEntries++;
  }
}

const totalOccurrences = Array.from(buckets.values()).reduce((sum, b) => sum + b.occurrences, 0);
const totalEntries = Array.from(buckets.values()).reduce((sum, b) => sum + b.entries, 0);

const sortedLens = Array.from(buckets.keys()).sort((a, b) => a - b);

console.log(`ファイル: ${filePath}`);
console.log(`対象エントリ数: ${totalEntries} / ${entries.length} (スキップ: ${skippedEntries})`);
console.log(`総出現回数: ${totalOccurrences.toLocaleString()}`);
console.log("");
console.log("打鍵数別分布:");
for (const len of sortedLens) {
  const bucket = buckets.get(len)!;
  const occPct = ((bucket.occurrences / totalOccurrences) * 100).toFixed(2);
  const entryPct = ((bucket.entries / totalEntries) * 100).toFixed(2);
  console.log(
    `${len}打鍵: ${bucket.occurrences.toLocaleString()}回（${occPct}%）, ${bucket.entries.toLocaleString()}行（${entryPct}%）`
  );
}
