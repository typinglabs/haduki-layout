import { readFileSync } from "node:fs";
import { exampleLayout, top26Kanas } from "./layout-fixtures";
import { keystrokeCountForKana, strokesForKana, KanaCount } from "./stroke";
import { generateLayout, printLayout } from "./generate-random";
import { layoutToRomanTableString } from "./roman-table";

function runKeystrokes(datasetPath: string) {
  const lines = readFileSync(datasetPath, "utf-8").trim().split("\n");
  const dataset: KanaCount[] = lines
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 2)
    .map(([kana, count]) => ({ kana, count: Number(count) }));

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

  // console.log(layoutToRomanTableString(layout));
}

function main() {
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
    default:
      console.log("Usage:");
      console.log("  bun scripts/cli.ts keystrokes [--dataset=path]");
      break;
  }
}

main();
