import { readFileSync } from "node:fs";
import { exampleLayout, top26Kanas } from "./layout-fixtures";
import { keystrokeCountForKana, strokesForKana, KanaCount, textToStrokes, keystrokesToString } from "./stroke";
import { generateLayout, printLayout } from "./generate-random";
import { getStrokeTime } from "./stroke-time";
import { layoutToRomanTableString } from "./roman-table";

function runKeystrokes(datasetPath: string) {
  const lines = readFileSync(datasetPath, "utf-8").trim().split("\n");
  const dataset: KanaCount[] = lines
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 2)
    .map(([kana, count]) => ({ kana, count: Number(count) }));

  const exampleLayout = generateLayout(top26Kanas);
  printLayout(exampleLayout);

  let totalWithShiftCount = 0;
  let totalWithoutShiftCount = 0;
  let totalKana = 0;
  for (const entry of dataset) {
    totalKana += entry.kana.length * entry.count;
    try {
      const strokes = strokesForKana(exampleLayout, entry.kana);
      totalWithoutShiftCount += strokes.length * entry.count;
      totalWithShiftCount += keystrokeCountForKana(exampleLayout, entry.kana) * entry.count;
    } catch (error) {
      if (entry.count > 0) {
        console.warn(`未対応のかなをスキップ: ${entry.kana} (count: ${entry.count})`);
      }
    }
  }

  const efficiencyWithoutShift = totalWithoutShiftCount / totalKana;
  const efficiencyWithShift = totalWithShiftCount / totalKana;

  console.log(
    JSON.stringify(
      {
        totalKana,
        keystrokesWithoutShift: totalWithoutShiftCount,
        keystrokesWithShift: totalWithShiftCount,
        efficiencyKanaPerKeystrokeWithoutShift: efficiencyWithoutShift,
        efficiencyKanaPerKeystrokeWithShift: efficiencyWithShift,
      },
      null,
      2
    )
  );
}

function runGenerateRandom() {
  const layout = generateLayout(top26Kanas);
  printLayout(layout);
}

async function runStrokeTime() {
  const text = await readStdin();
  const normalizedText = text.replace(/\s+/g, "");
  const strokes = textToStrokes(exampleLayout, normalizedText);
  const totalMs = getStrokeTime(strokes);
  const strokeString = keystrokesToString(strokes);
  const kanaCount = normalizedText.length;
  const efficiency = kanaCount === 0 ? 0 : strokes.length / kanaCount;
  const kpm = totalMs === 0 ? 0 : (strokes.length * 60000) / totalMs;

  console.log(
    JSON.stringify(
      {
        totalMs,
        strokes: strokes.length,
        kanaCount,
        efficiency,
        kpm,
        strokeString,
      },
      null,
      2
    )
  );
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function generateRomanTable() {
  console.log(layoutToRomanTableString(exampleLayout));
}

async function main() {
  const [, , command, ...args] = process.argv;
  switch (command) {
    case "keystrokes": {
      const datasetArg = args.find((arg) => arg.startsWith("--dataset="));
      const datasetPath = datasetArg ? datasetArg.split("=")[1] : "dataset/kouy-1-million.tsv";
      runKeystrokes(datasetPath);
      break;
    }
    case "generate": {
      runGenerateRandom();
      break;
    }
    case "stroke-time": {
      await runStrokeTime();
      break;
    }
    case "roman-table": {
      generateRomanTable();
      break;
    }
    default:
      console.log("Usage:");
      console.log("  bun scripts/cli.ts keystrokes [--dataset=path]");
      console.log("  bun scripts/cli.ts stroke-time < text");
      break;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
