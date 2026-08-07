import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BrainCircuit, FileVideo, ScanText, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { Uploader } from "@/components/paper/Uploader";
import { PIPELINE_STEPS, ProgressPanel } from "@/components/paper/ProgressPanel";
import { Results } from "@/components/paper/Results";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paper Explained AI — Turn research PDFs into explainer videos" },
      {
        name: "description",
        content:
          "Upload any research paper and get an AI summary, extracted figures, narration and a downloadable explainer video in minutes.",
      },
      { property: "og:title", content: "Paper Explained AI" },
      {
        property: "og:description",
        content:
          "Upload a research PDF and get an AI summary, figures, narration and a downloadable explainer video.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: ScanText, title: "Reads the whole paper", body: "Sections, math, tables and citations are parsed into a structured outline." },
  { icon: BrainCircuit, title: "Explains like a human", body: "Plain-language summaries that keep the nuance and name the limitations." },
  { icon: FileVideo, title: "Ships a video", body: "Narrated explainer with the paper's own figures, ready to download and share." },
];

function Index() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = () => {
    if (!file) return;
    const looksLikePdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!looksLikePdf || file.size === 0) {
      navigate({ to: "/unreadable", search: { name: file.name } });
      return;
    }
    setPhase("working");
    setProgress(0);
    const total = 60;
    for (let i = 1; i <= total; i++) {
      timers.current.push(
        setTimeout(() => {
          setProgress((i / total) * 100);
          if (i === total) setPhase("done");
        }, i * 90),
      );
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFile(null);
    setProgress(0);
    setPhase("idle");
  };

  const step = Math.min(
    PIPELINE_STEPS.length - 1,
    Math.floor((progress / 100) * PIPELINE_STEPS.length),
  );

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-brand flex size-9 items-center justify-center rounded-xl">
            <Sparkles className="size-4.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Paper Explained AI</span>
        </div>
        <a
          href="#upload"
          className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
        >
          Try it free
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-8 pb-16 lg:grid-cols-2 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-accent">
            <Sparkles className="size-3.5" /> PDF → narrated explainer video
          </span>
          <h1 className="mt-5 font-display text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl">
            Understand any research paper in <span className="text-gradient">ninety seconds</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">

            Drop in a PDF. Paper Explained AI summarizes the contribution, pulls out the figures,
            writes the narration and renders a video you can actually share.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#upload"
              className="bg-gradient-brand inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-display font-semibold text-primary-foreground glow-ring transition-opacity hover:opacity-90"
            >
              Upload a paper
            </a>
            <a
              href="#how"
              className="inline-flex items-center rounded-xl border border-border px-6 py-3.5 font-display font-semibold transition-colors hover:bg-secondary"
            >
              How it works
            </a>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImage}
            alt="Glowing neural network emerging from an open research paper"
            width={1536}
            height={1024}
            className="w-full rounded-3xl border border-border glow-ring"
          />
        </div>
      </section>

      <section id="how" className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass-card p-6">
            <Icon className="size-6 text-accent" />
            <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section id="upload" className="mx-auto max-w-4xl scroll-mt-8 px-6 pb-24">
        {phase === "idle" && (
          <Uploader file={file} onFile={setFile} onGenerate={start} busy={false} />
        )}
        {phase === "working" && <ProgressPanel progress={progress} step={step} />}
        {phase === "done" && file && <Results fileName={file.name} onReset={reset} />}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Paper Explained AI — research, made watchable.
        </div>
      </footer>
    </main>
  );
}
