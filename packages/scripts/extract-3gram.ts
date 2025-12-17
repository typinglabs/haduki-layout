import { readFileSync, writeFileSync } from "node:fs";

const inputPath = process.argv[2] ?? "dataset/oka-wikipedia-3gram.txt";
const outputPath = process.argv[3] ?? "";

type Entry = { count: number; text: string };

const lines = readFileSync(inputPath, "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

const entries: Entry[] = lines.map((line) => {
  const [countStr, text] = line.split("\t");
  return { count: Number(countStr), text };
});

const isHiragana3Gram = (text: string): boolean => Array.from(text).length === 3;
const hasProhibitedChar = (text: string): boolean => text.includes("ゖ");

const filtered = entries.filter((entry) => isHiragana3Gram(entry.text) && !hasProhibitedChar(entry.text));

const total = entries.length;
const filteredCount = filtered.length;

const outputLines = filtered.map((entry) => `${entry.count}\t${entry.text}`).join("\n");

if (outputPath) {
  writeFileSync(outputPath, outputLines);
  console.log(`出力: ${outputPath}`);
} else {
  // console.log だとBunで巨大出力時に文字化け（U+FFFD）が混入することがあったため、
  // 標準出力に直接書き込む
  process.stdout.write(outputLines + "\n");
}

console.error(`入力: ${inputPath}`);
console.error(`総エントリ: ${total}`);
console.error(`3-gram抽出: ${filteredCount} (${((filteredCount / total) * 100).toFixed(2)}%)`);
