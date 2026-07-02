"use client";

type RatingScaleProps = {
  name: string;
  value: number | null;
  onChange: (value: number) => void;
  labels: [string, string, string, string, string];
  error?: boolean;
};

export default function RatingScale({
  name,
  value,
  onChange,
  labels,
  error,
}: RatingScaleProps) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={name}
        className="grid grid-cols-5 gap-2 sm:gap-3"
      >
        {labels.map((label, i) => {
          const score = i + 1;
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(score)}
              className={[
                "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-3 text-center transition-all duration-200 ease-out will-change-transform sm:px-2 sm:py-4",
                selected
                  ? "-translate-y-0.5 scale-105 border-v4-red bg-v4-red text-white shadow-lg shadow-v4-red/25"
                  : "border-v4-gray-light bg-white text-v4-charcoal hover:-translate-y-0.5 hover:border-v4-red/50 hover:bg-v4-red/5 hover:shadow-md active:translate-y-0 active:scale-95",
                error && !value ? "border-v4-red/60" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "text-lg font-bold transition-colors duration-200 sm:text-xl",
                  selected ? "text-white" : "text-v4-near-black",
                ].join(" ")}
              >
                {score}
              </span>
              <span
                className={[
                  "text-[10px] leading-tight transition-colors duration-200 sm:text-xs",
                  selected ? "text-white/90" : "text-v4-charcoal/70",
                ].join(" ")}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
