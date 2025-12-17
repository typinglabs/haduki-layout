import { readFileSync } from "node:fs";
import { layout20251213beamsearch as exampleLayout, top26Kanas, layout20251216adcale } from "./layout-fixtures";
import { keystrokeCountForKana, strokesForKana, KanaCount, textToStrokes, keystrokesToString } from "./stroke";
import { generateLayout, printLayout } from "./generate-random";
import { getStrokeTime, getStrokeTimeByTrigram } from "./stroke-time";
import { layoutToRomanTableString } from "./roman-table";
import { scoreLayout, searchLayout } from "./layout-search";
import { loadTrigramDataset } from "./dataset";
import { Layout, validateLayout } from "./core";

function runKeystrokes(datasetPath: string) {
  const lines = readFileSync(datasetPath, "utf-8").trim().split("\n");
  const dataset: KanaCount[] = lines
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 2)
    .map(([kana, count]) => ({ kana, count: Number(count) }));

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
  const totalMsByTrigram = getStrokeTimeByTrigram(strokes);
  const strokeString = keystrokesToString(strokes);
  const kanaCount = normalizedText.length;
  const efficiency = kanaCount === 0 ? 0 : strokes.length / kanaCount;
  const kpm = totalMs === 0 ? 0 : (strokes.length * 60000) / totalMs;

  console.log(
    JSON.stringify(
      {
        totalMs,
        totalMsByTrigram,
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
  const layout = layout20251216adcale;
  console.log(layoutToRomanTableString(layout));
}

function runScoreLayout(layout: Layout) {
  validateLayout(layout);
  printLayout(layout);
  const trigrams = loadTrigramDataset();
  const score = scoreLayout(layout, trigrams);

  // 3-gramの合計1094322391エントリから、未対応のゖを含む2128+1443+1318エントリを除外した件数
  const EXPECTED_TOTAL_COUNT = 1094317502;
  if (score.totalCount !== EXPECTED_TOTAL_COUNT) {
    console.log("3-gramの件数の数え上げが間違っています");
    console.log(
      `expected: ${EXPECTED_TOTAL_COUNT}, actual: ${score.totalCount}, diff: ${score.totalCount - EXPECTED_TOTAL_COUNT}`
    );
  }

  console.log(JSON.stringify(score, null, 2));
}

function runSearchLayout() {
  const layout = searchLayout();
  printLayout(layout);
  runScoreLayout(layout);

  console.log(JSON.stringify(layout, null, 2));
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
    case "search": {
      runSearchLayout();
      break;
    }
    case "score": {
      runScoreLayout(layout20251216adcale);
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
