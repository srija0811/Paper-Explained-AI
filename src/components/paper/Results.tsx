import { BarChart3, Download, Image as ImageIcon, Play, Volume2 } from "lucide-react";

const FIGURES = [
  { label: "Figure 1", caption: "Model architecture overview", tone: "from-primary/70 to-accent/40" },
  { label: "Figure 2", caption: "Accuracy vs. training steps", tone: "from-accent/60 to-glow/40" },
  { label: "Figure 3", caption: "Ablation study results", tone: "from-glow/60 to-primary/40" },
  { label: "Table 1", caption: "Benchmark comparison", tone: "from-primary/50 to-glow/50" },
];

const NARRATION = [
  {
    t: "00:00",
    text: "This paper tackles a long-standing bottleneck: models that reason well but scale poorly.",
  },
  {
    t: "00:18",
    text: "The authors introduce a sparse routing layer that activates only the experts a query needs.",
  },
  {
    t: "00:41",
    text: "On four public benchmarks it matches dense baselines while using 38% less compute.",
  },
  {
    t: "01:05",
    text: "The catch: routing becomes unstable on very small batches — a limitation the authors note openly.",
  },
];

export function Results({ fileName, onReset }: { fileName: string; onReset: () => void }) {
  return (
    <div className="space-y-8">
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
              Paper summary
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{fileName}</h2>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            Explain another paper
          </button>
        </div>

        <p className="mt-5 leading-relaxed text-muted-foreground">
          The paper proposes a sparsely-routed transformer variant that keeps inference cost flat as
          model capacity grows. Instead of activating every parameter per token, a lightweight router
          selects a small subset of expert blocks, trained end-to-end with a load-balancing objective.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { k: "Core idea", v: "Learned sparse expert routing" },
            { k: "Headline result", v: "38% less compute, equal accuracy" },
            { k: "Main limitation", v: "Unstable on small batch sizes" },
          ].map((item) => (
            <div key={item.k} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{item.k}</p>
              <p className="mt-1.5 text-sm font-medium">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-5 text-accent" />
          <h2 className="font-display text-xl font-semibold">Extracted figures</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f) => (
            <figure key={f.label} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div
                className={`flex aspect-4/3 items-center justify-center bg-gradient-to-br ${f.tone}`}
              >
                <BarChart3 className="size-8 opacity-80" />
              </div>
              <figcaption className="p-3">
                <p className="text-xs font-semibold text-accent">{f.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{f.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Volume2 className="size-5 text-accent" />
            <h2 className="font-display text-xl font-semibold">Narration preview</h2>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
            <button
              type="button"
              aria-label="Play narration"
              className="bg-gradient-brand flex size-11 shrink-0 items-center justify-center rounded-full"
            >
              <Play className="size-5 text-primary-foreground" />
            </button>
            <div className="flex h-10 flex-1 items-end gap-1">
              {Array.from({ length: 44 }).map((_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full bg-primary/60"
                  style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">01:32</span>
          </div>
          <ul className="mt-5 space-y-4">
            {NARRATION.map((line) => (
              <li key={line.t} className="flex gap-4 text-sm">
                <span className="tabular-nums text-accent">{line.t}</span>
                <span className="text-muted-foreground">{line.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Play className="size-5 text-accent" />
            <h2 className="font-display text-xl font-semibold">Video preview</h2>
          </div>
          <div className="mt-5 flex aspect-video items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/30 via-glow/20 to-accent/20">
            <button
              type="button"
              aria-label="Play explainer video"
              className="flex size-16 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-transform hover:scale-105"
            >
              <Play className="size-7 text-foreground" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>1080p · 01:32 · MP4</span>
            <span>Narrated explainer</span>
          </div>
          <button
            type="button"
            className="bg-gradient-brand mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-5" /> Download Video
          </button>
        </section>
      </div>
    </div>
  );
}
