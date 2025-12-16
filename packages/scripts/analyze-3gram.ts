import { readFileSync } from "node:fs";

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

// 念のためカウントで降順ソート
entries.sort((a, b) => b.count - a.count);

const entryCount = entries.length;
const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);

const thresholds = Array.from({ length: 20 }, (_, i) => (i + 1) * 5); // 5%, 10%, ..., 100%
const targetCounts = thresholds.map((p) => (totalCount * p) / 100);

const results: { percent: number; lines: number; lineRatio: number }[] = [];

let cumulative = 0;
let lineIndex = 0;
for (const target of targetCounts) {
  while (lineIndex < entries.length && cumulative < target) {
    cumulative += entries[lineIndex].count;
    lineIndex += 1;
  }

  const linesUsed = lineIndex; // 0-based to 1-based
  results.push({
    percent: thresholds[results.length],
    lines: linesUsed,
    lineRatio: (linesUsed / entryCount) * 100,
  });
}

console.log(`ファイル: ${filePath}`);
console.log(`総出現回数: ${totalCount.toLocaleString()}`);
console.log(`エントリ数: ${entryCount.toLocaleString()}`);
console.log("");
console.log("累積カバー率ごとの行数（5%刻み）:");
results.forEach((r) => {
  const lineRatio = r.lineRatio.toFixed(2);
  console.log(`合計${r.percent}%: ${r.lines.toLocaleString()}行（${lineRatio}%）`);
});
