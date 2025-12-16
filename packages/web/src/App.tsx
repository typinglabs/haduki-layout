import { keyPositions } from "../../src/core";
import { layout20251216adcale } from "../../src/layout-fixtures";

type KeyInfo = {
  position: number;
  row: number;
  col: number;
  label: string;
};

const rowOffsets = [0, 0.25, 0.75]; // middle row is +0.25, bottom is +0.5 from middle
const keyWidth = 72;
const keyHeight = 72;

function buildKeys(slot: "oneStroke" | "shift1" | "shift2" | "normalShift"): KeyInfo[] {
  return keyPositions.map((position) => {
    const row = Math.floor(position / 10);
    const col = position % 10;
    const label = layout20251216adcale[position][slot] ?? "";
    return {
      position,
      row,
      col: col + rowOffsets[row],
      label,
    };
  });
}

function normalizeLabel(label: string): string {
  if (label === "ゃ") return "ゃ゛";
  if (label === "ょ") return "ょ゜";
  return label;
}

type BoardProps = {
  title: string;
  slot: "oneStroke" | "shift1" | "shift2" | "normalShift";
};

function KeyboardBoard({ title, slot }: BoardProps) {
  const keys = buildKeys(slot);
  const width = (10 + Math.max(...rowOffsets)) * keyWidth;
  const titleOffset = 36;
  const height = 3 * keyHeight + titleOffset;

  return (
    <section className="relative" style={{ width, height }}>
      <div className="text-base font-semibold text-slate-700 mb-1">{title}</div>
      <div className="absolute">
        {keys.map((key) => {
          const text = normalizeLabel(key.label);
          const wide = text.length >= 2;
          return (
            <div
              key={`${slot}-${key.position}`}
              className="absolute flex items-center justify-center border border-slate-300 rounded-md bg-white"
              style={{
                left: key.col * keyWidth,
                top: key.row * keyHeight,
                width: 64,
                height: 64,
              }}
              title={`pos ${key.position}`}
            >
              <span
                className={`text-[1.75rem] font-bold leading-none ${
                  wide ? "tracking-tight translate-x-0.5 inline-block" : ""
                }`}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="max-w-6xl mx-auto px-5 pb-12 pt-7 text-slate-900">
      <header className="mb-5">
        <h1 className="text-2xl font-bold mb-1">20251216アドカレ版</h1>
      </header>

      <div className="flex flex-wrap gap-5 mb-4">
        <KeyboardBoard title="単打" slot="oneStroke" />
      </div>

      <div className="flex flex-wrap gap-4">
        <KeyboardBoard title="ゅ後置シフト" slot="shift1" />
        <KeyboardBoard title="ょ後置シフト" slot="shift2" />
        <KeyboardBoard title="通常シフト" slot="normalShift" />
      </div>
    </main>
  );
}
