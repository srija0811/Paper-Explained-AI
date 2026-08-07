import { Check, Loader2 } from "lucide-react";

export const PIPELINE_STEPS = [
  "Parsing PDF structure",
  "Summarizing key contributions",
  "Extracting figures & tables",
  "Writing narration script",
  "Rendering explainer video",
] as const;

export function ProgressPanel({ progress, step }: { progress: number; step: number }) {
  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Building your explainer</h2>
        <span className="text-sm font-medium text-accent">{Math.round(progress)}%</span>
      </div>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-gradient-brand h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {PIPELINE_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex size-6 items-center justify-center rounded-full border ${
                  done
                    ? "border-transparent bg-gradient-brand"
                    : active
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="size-3.5 text-primary-foreground" />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span className="text-[11px]">{i + 1}</span>
                )}
              </span>
              <span className={done || active ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
