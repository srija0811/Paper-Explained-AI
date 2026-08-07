import { BarChart3, Download, Image as ImageIcon, Loader2, Pause, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const FIGURES = [
  { label: "Figure 1", caption: "Model architecture overview", tone: "from-primary/70 to-accent/40" },
  { label: "Figure 2", caption: "Accuracy vs. training steps", tone: "from-accent/60 to-glow/40" },
  { label: "Figure 3", caption: "Ablation study results", tone: "from-glow/60 to-primary/40" },
  { label: "Table 1", caption: "Benchmark comparison", tone: "from-primary/50 to-glow/50" },
];

type Line = { t: string; at: number; dur: number; title: string; text: string };

const NARRATION: Line[] = [
  {
    t: "00:00",
    at: 0,
    dur: 7,
    title: "The problem",
    text: "This paper tackles a long-standing bottleneck: models that reason well but scale poorly.",
  },
  {
    t: "00:07",
    at: 7,
    dur: 7,
    title: "The idea",
    text: "The authors introduce a sparse routing layer that activates only the experts a query needs.",
  },
  {
    t: "00:14",
    at: 14,
    dur: 7,
    title: "The result",
    text: "On four public benchmarks it matches dense baselines while using 38% less compute.",
  },
  {
    t: "00:21",
    at: 21,
    dur: 7,
    title: "The catch",
    text: "Routing becomes unstable on very small batches — a limitation the authors note openly.",
  },
];

const DURATION = 28;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function lineAt(time: number) {
  let idx = 0;
  NARRATION.forEach((l, i) => {
    if (time >= l.at) idx = i;
  });
  return idx;
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, title: string) {
  const idx = lineAt(time);
  const line = NARRATION[idx]!;
  const local = Math.min(1, (time - line.at) / 0.6);

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(0.5, "#141a3a");
  bg.addColorStop(1, "#1b1030");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // decorative orb
  const orb = ctx.createRadialGradient(w * 0.82, h * 0.22, 0, w * 0.82, h * 0.22, w * 0.35);
  orb.addColorStop(0, "rgba(99,102,241,0.45)");
  orb.addColorStop(1, "rgba(99,102,241,0)");
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = local;
  ctx.fillStyle = "#8b93ff";
  ctx.font = `600 ${Math.round(w * 0.022)}px "DM Sans", sans-serif`;
  ctx.fillText(title.slice(0, 60), w * 0.08, h * 0.2);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(w * 0.055)}px "Space Grotesk", sans-serif`;
  ctx.fillText(line.title, w * 0.08, h * 0.34);

  ctx.fillStyle = "rgba(226,232,240,0.88)";
  ctx.font = `400 ${Math.round(w * 0.032)}px "DM Sans", sans-serif`;
  const maxW = w * 0.84;
  const words = line.text.split(" ");
  let cur = "";
  let y = h * 0.48;
  words.forEach((word) => {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(cur, w * 0.08, y);
      y += w * 0.045;
      cur = word;
    } else {
      cur = test;
    }
  });
  ctx.fillText(cur, w * 0.08, y);
  ctx.globalAlpha = 1;

  // progress bar
  const pw = w * 0.84;
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(w * 0.08, h * 0.86, pw, 6);
  const g = ctx.createLinearGradient(w * 0.08, 0, w * 0.92, 0);
  g.addColorStop(0, "#6366f1");
  g.addColorStop(1, "#c084fc");
  ctx.fillStyle = g;
  ctx.fillRect(w * 0.08, h * 0.86, pw * Math.min(1, time / DURATION), 6);
}

export function Results({ fileName, onReset }: { fileName: string; onReset: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const paint = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawFrame(ctx, canvas.width, canvas.height, t, fileName);
    },
    [fileName],
  );

  useEffect(() => {
    paint(0);
  }, [paint]);

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => () => {
    stopLoop();
    stopSpeech();
  }, [stopLoop]);

  const speakFrom = (from: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setNote("Voice playback isn't supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const text = NARRATION.filter((l) => l.at + l.dur > from)
      .map((l) => l.text)
      .join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const play = () => {
    setNote(null);
    const from = time >= DURATION ? 0 : time;
    startRef.current = performance.now() - from * 1000;
    setPlaying(true);
    speakFrom(from);
    const loop = () => {
      const t = (performance.now() - startRef.current) / 1000;
      if (t >= DURATION) {
        setTime(DURATION);
        paint(DURATION);
        setPlaying(false);
        stopSpeech();
        return;
      }
      setTime(t);
      paint(t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const pause = () => {
    stopLoop();
    stopSpeech();
    setPlaying(false);
  };

  const toggle = () => (playing ? pause() : play());

  const download = async () => {
    setNote(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canRecord =
      typeof window !== "undefined" &&
      typeof MediaRecorder !== "undefined" &&
      typeof canvas.captureStream === "function";

    if (!canRecord) {
      const blob = new Blob(
        [
          `Paper Explained AI — narration script\n${fileName}\n\n` +
            NARRATION.map((l) => `[${l.t}] ${l.title}\n${l.text}\n`).join("\n"),
        ],
        { type: "text/plain" },
      );
      triggerDownload(blob, `${fileName.replace(/\.pdf$/i, "")}-narration.txt`);
      setNote("Video recording isn't supported here — downloaded the narration script instead.");
      return;
    }

    pause();
    setRendering(true);
    const stream = canvas.captureStream(30);
    const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((m) =>
      MediaRecorder.isTypeSupported(m),
    );
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.start();

    // Render the full timeline fast (4x speed) into the recording.
    const renderStart = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const t = ((performance.now() - renderStart) / 1000) * 4;
        paint(Math.min(t, DURATION));
        if (t >= DURATION) return resolve();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    recorder.stop();
    await done;
    triggerDownload(
      new Blob(chunks, { type: mime ?? "video/webm" }),
      `${fileName.replace(/\.pdf$/i, "")}-explainer.webm`,
    );
    setRendering(false);
    setTime(0);
    paint(0);
  };

  const activeLine = lineAt(time);

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
              onClick={toggle}
              aria-label={playing ? "Pause narration" : "Play narration"}
              className="bg-gradient-brand flex size-11 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105"
            >
              {playing ? (
                <Pause className="size-5 text-primary-foreground" />
              ) : (
                <Play className="size-5 text-primary-foreground" />
              )}
            </button>
            <div className="flex h-10 flex-1 items-end gap-1">
              {Array.from({ length: 44 }).map((_, i) => {
                const played = i / 44 <= time / DURATION;
                const wobble = speaking && played ? Math.abs(Math.sin(i * 0.7 + time * 6)) : Math.abs(Math.sin(i * 0.7));
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-[height] duration-100 ${played ? "bg-primary" : "bg-primary/30"}`}
                    style={{ height: `${20 + wobble * 80}%` }}
                  />
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmt(time)} / {fmt(DURATION)}
            </span>
          </div>
          <ul className="mt-5 space-y-4">
            {NARRATION.map((line, i) => (
              <li key={line.t} className="flex gap-4 text-sm">
                <span className="tabular-nums text-accent">{line.t}</span>
                <span className={i === activeLine && playing ? "text-foreground" : "text-muted-foreground"}>
                  {line.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Play className="size-5 text-accent" />
            <h2 className="font-display text-xl font-semibold">Video preview</h2>
          </div>
          <div className="relative mt-5 overflow-hidden rounded-xl border border-border">
            <canvas ref={canvasRef} width={960} height={540} className="block w-full" />
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause explainer video" : "Play explainer video"}
              className="absolute inset-0 flex items-center justify-center transition-opacity hover:bg-background/10"
            >
              {!playing && (
                <span className="flex size-16 items-center justify-center rounded-full bg-background/70 backdrop-blur">
                  <Play className="size-7 text-foreground" />
                </span>
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>960p · {fmt(DURATION)} · WebM</span>
            <span>Narrated explainer</span>
          </div>
          <button
            type="button"
            onClick={download}
            disabled={rendering}
            className="bg-gradient-brand mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {rendering ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Rendering video…
              </>
            ) : (
              <>
                <Download className="size-5" /> Download Video
              </>
            )}
          </button>
          {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
        </section>
      </div>
    </div>
  );
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
