import {
  BarChart3,
  Bot,
  Download,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  UserCheck,
  Video,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatWidget } from "./ChatWidget";

type FigureItem = {
  filename?: string;
  label: string;
  caption: string;
  page?: number;
  tone?: string;
};

const DEFAULT_FIGURES: FigureItem[] = [
  { label: "Figure 1", caption: "Model architecture & sparse routing overview", page: 1, tone: "from-primary/60 to-accent/40" },
  { label: "Figure 2", caption: "Accuracy vs. training step comparison", page: 3, tone: "from-accent/60 to-glow/40" },
  { label: "Figure 3", caption: "Ablation study & load distribution", page: 5, tone: "from-glow/60 to-primary/40" },
  { label: "Table 1", caption: "Benchmark evaluation metrics", page: 6, tone: "from-primary/50 to-accent/50" },
];

type Line = { t: string; at: number; dur: number; title: string; text: string };

const NARRATION_CONTENT: Record<string, Line[]> = {
  en: [
    {
      t: "00:00",
      at: 0,
      dur: 10,
      title: "The Problem",
      text: "Modern deep learning models grow exponentially in size. This paper addresses a critical bottleneck: how to scale models without proportionally increasing compute costs at inference time.",
    },
    {
      t: "00:10",
      at: 10,
      dur: 12,
      title: "Background & Prior Work",
      text: "Previous mixture-of-experts models required full expert activation, causing memory and latency issues. The authors build on transformer architectures but rethink how information is routed between layers.",
    },
    {
      t: "00:22",
      at: 22,
      dur: 14,
      title: "Methodology",
      text: "The core innovation is a learned sparse routing layer. For each input token, a lightweight gating network selects only the top-K expert pathways to activate, leaving the rest idle. This is trained end-to-end using a load-balancing auxiliary loss to prevent routing collapse.",
    },
    {
      t: "00:36",
      at: 36,
      dur: 12,
      title: "Results",
      text: "Tested on four public benchmarks including GLUE, SuperGLUE, and two generation tasks, the proposed model matches dense baseline accuracy while consuming 38% less total training compute and showing 2.1x faster inference throughput.",
    },
    {
      t: "00:48",
      at: 48,
      dur: 10,
      title: "Key Limitations",
      text: "The routing mechanism becomes unstable on very small batch sizes below 8. The authors acknowledge this and propose a stabilization trick in the appendix. Generalisation to non-transformer architectures remains untested.",
    },
    {
      t: "00:58",
      at: 58,
      dur: 8,
      title: "Conclusion",
      text: "This work demonstrates that sparse routing is a viable path toward cost-efficient scaling. The approach is open-sourced and the authors encourage evaluation on domain-specific datasets as future work.",
    },
  ],
};

const DURATION = 66;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function lineAt(time: number, lang: string = "en") {
  let idx = 0;
  const narration = NARRATION_CONTENT[lang] || NARRATION_CONTENT.en;
  narration.forEach((l, i) => {
    if (time >= l.at) idx = i;
  });
  return idx;
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, title: string, lang: string = "en") {
  const idx = lineAt(time, lang);
  const narration = NARRATION_CONTENT[lang] || NARRATION_CONTENT.en;
  const line = narration[idx]!;
  const local = Math.min(1, (time - line.at) / 0.6);

  // Pure Bright Lavender & Baby Pink Canvas background (no dark black)
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#f5e8ff");
  bg.addColorStop(0.5, "#faf0ff");
  bg.addColorStop(1, "#ebd5ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft Baby Pink decorative radial orb
  const orb = ctx.createRadialGradient(w * 0.85, h * 0.2, 0, w * 0.85, h * 0.2, w * 0.45);
  orb.addColorStop(0, "rgba(244, 114, 182, 0.35)");
  orb.addColorStop(1, "rgba(244, 114, 182, 0)");
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = local;
  ctx.fillStyle = "#9333ea";
  ctx.font = `600 ${Math.round(w * 0.022)}px "DM Sans", sans-serif`;
  ctx.fillText(title.slice(0, 60), w * 0.08, h * 0.2);

  ctx.fillStyle = "#3b0764";
  ctx.font = `700 ${Math.round(w * 0.055)}px "Space Grotesk", sans-serif`;
  ctx.fillText(line.title, w * 0.08, h * 0.34);

  ctx.fillStyle = "#581c87";
  ctx.font = `500 ${Math.round(w * 0.032)}px "DM Sans", sans-serif`;
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
}

export function Results({
  fileName,
  userName = "",
  figures = DEFAULT_FIGURES,
  onReset,
}: {
  fileName: string;
  userName?: string;
  figures?: FigureItem[];
  onReset: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRafRef = useRef<number | null>(null);
  const videoStartRef = useRef(0);
  
  const [activeMediaTab, setActiveMediaTab] = useState<"all" | "audio" | "video">("all");
  
  const lastSpokenIdx = useRef(-1);
  const isMerged = fileName === "Merged Research Papers";

  // Language selection
  const [selectedLang, setSelectedLang] = useState<"en">("en");

  const LANGUAGES = [
    { code: "en" as const, label: "English", flag: "🇬🇧", voiceLang: "en" },
  ];

  // Separate Audio state
  const [audioTime, setAudioTime] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Separate Video state
  const [videoTime, setVideoTime] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const paintVideo = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawFrame(ctx, canvas.width, canvas.height, t, fileName, selectedLang);
    },
    [fileName, selectedLang],
  );

  useEffect(() => {
    paintVideo(0);
  }, [paintVideo]);

  // Speech helper
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakLine = useCallback((idx: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    const narration = NARRATION_CONTENT[selectedLang] || NARRATION_CONTENT.en;
    const l = narration[idx];
    if (!l) return;

    // Determine gender based on simple name heuristics (ends with vowels/soft sounds typically female)
    const firstWord = userName.split(" ")[0].toLowerCase();
    const isFemale = firstWord ? /^[a-z]*[aieyhu]$/i.test(firstWord) : true;

    const voices = window.speechSynthesis.getVoices();
    const langMap: Record<string, string> = { en: "en-US", hi: "hi-IN", te: "te-IN" };
    const langCode = langMap[selectedLang] || "en-US";
    
    // Look for voices matching the language code (e.g. "hi", "te")
    const shortLang = selectedLang;
    const voiceRanking = voices.filter(v => v.lang.toLowerCase().includes(shortLang));
    let match = null;

    if (selectedLang === "en") {
      if (isFemale) {
        match = voiceRanking.find(v => v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Google UK English Female") || v.name.includes("Samantha")) || voiceRanking[0];
      } else {
        match = voiceRanking.find(v => v.name.includes("Male") || v.name.includes("David") || v.name.includes("Google UK English Male") || v.name.includes("Daniel")) || voiceRanking[0];
      }
    } else {
      // For Hindi/Telugu, prioritize Google or native voices, but don't fallback to English!
      match = voiceRanking.find(v => v.name.includes("Google") || v.name.includes("Microsoft")) || voiceRanking[0] || null;
    }

    const utterance = new SpeechSynthesisUtterance(l.text);
    utterance.rate = 0.92; // Slightly slower for better clarity
    utterance.pitch = isFemale ? 1.05 : 0.95;
    utterance.volume = 1.0; // Maximize volume
    utterance.lang = langCode;
    
    // Only set voice if we found a matching one for this language
    if (match) {
      utterance.voice = match;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [selectedLang, userName]);

  // Audio Control Methods
  const stopAudio = useCallback(() => {
    stopSpeech();
    if (audioTimerRef.current) {
      clearInterval(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    setAudioPlaying(false);
  }, [stopSpeech]);

  const playAudio = (startFrom?: number) => {
    setNote(null);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setNote("Voice playback isn't supported in this browser.");
      return;
    }

    stopAudio();
    const currentAudTime = startFrom !== undefined ? startFrom : audioTime;
    const from = currentAudTime >= DURATION ? 0 : currentAudTime;
    setAudioTime(from);
    
    lastSpokenIdx.current = lineAt(from, selectedLang) - 1;

    setAudioPlaying(true);
    const startTime = Date.now() - from * 1000;
    audioTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      const currentIdx = lineAt(elapsed, selectedLang);
      if (currentIdx > lastSpokenIdx.current) {
        lastSpokenIdx.current = currentIdx;
        speakLine(currentIdx);
      }

      if (elapsed >= DURATION) {
        setAudioTime(DURATION);
        stopAudio();
      } else {
        setAudioTime(elapsed);
      }
    }, 200);
  };

  const pauseAudio = () => {
    stopAudio();
  };

  const toggleAudio = () => {
    if (audioPlaying) pauseAudio();
    else playAudio();
  };

  // Video Loop Methods (with synced voice narration audio!)
  const stopVideoLoop = useCallback(() => {
    if (videoRafRef.current !== null) cancelAnimationFrame(videoRafRef.current);
    videoRafRef.current = null;
    stopSpeech();
    setVideoPlaying(false);
  }, [stopSpeech]);

  const playVideo = (startFrom?: number) => {
    setNote(null);
    stopAudio();
    const currentVidTime = startFrom !== undefined ? startFrom : videoTime;
    const from = currentVidTime >= DURATION ? 0 : currentVidTime;
    videoStartRef.current = performance.now() - from * 1000;
    setVideoPlaying(true);
    
    lastSpokenIdx.current = lineAt(from, selectedLang) - 1;

    const loop = () => {
      const t = (performance.now() - videoStartRef.current) / 1000;
      
      const currentIdx = lineAt(t, selectedLang);
      if (currentIdx > lastSpokenIdx.current) {
        lastSpokenIdx.current = currentIdx;
        speakLine(currentIdx);
      }

      if (t >= DURATION) {
        setVideoTime(DURATION);
        paintVideo(DURATION);
        stopVideoLoop();
        return;
      }
      setVideoTime(t);
      paintVideo(t);
      videoRafRef.current = requestAnimationFrame(loop);
    };
    videoRafRef.current = requestAnimationFrame(loop);
  };

  const pauseVideo = () => {
    stopVideoLoop();
  };

  const toggleVideo = () => {
    if (videoPlaying) pauseVideo();
    else playVideo();
  };

  useEffect(() => {
    return () => {
      stopAudio();
      stopVideoLoop();
    };
  }, [stopAudio, stopVideoLoop]);

  const downloadVideo = async () => {
    setNote(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canRecord =
      typeof window !== "undefined" &&
      typeof MediaRecorder !== "undefined" &&
      typeof canvas.captureStream === "function";

    if (!canRecord) {
      // Define NARRATION if needed, or map directly from NARRATION_CONTENT.en if appropriate
      const blob = new Blob(
        [
          `Paper Explained AI — Narration Script\n${fileName}\n\n` +
            NARRATION_CONTENT.en.map((l) => `[${l.t}] ${l.title}\n${l.text}\n`).join("\n"),
        ],
        { type: "text/plain" },
      );
      triggerDownload(blob, `${fileName.replace(/\.pdf$/i, "")}-narration.txt`);
      setNote("Video recording isn't supported here — downloaded the narration script instead.");
      return;
    }

    pauseVideo();
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

    const renderStart = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const t = ((performance.now() - renderStart) / 1000) * 4;
        paintVideo(Math.min(t, DURATION));
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
    setVideoTime(0);
    paintVideo(0);
  };

  const activeAudioLine = lineAt(audioTime, selectedLang);

  // Deterministic rating derived from filename length (mock — replace with real AI score)
  const paperRating = Math.min(99, 72 + (fileName.length % 24));
  const ratingCircumference = 2 * Math.PI * 42;
  const ratingOffset = ratingCircumference * (1 - paperRating / 100);

  return (
    <div className="space-y-8">
      {/* Paper Header & Overview */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider border border-accent/30">
              <Sparkles className="size-3.5" /> Paper Summary
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold break-words">{fileName}</h2>
          </div>

          {/* AI Paper Rating Ring */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative size-24">
              <svg className="size-full -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                <circle
                  cx="48" cy="48" r="42" fill="none"
                  stroke="url(#ratingGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ratingCircumference}
                  strokeDashoffset={ratingOffset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-foreground">{paperRating}%</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">AI Rating</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-muted hover:border-accent/40 w-full sm:w-auto"
          >
            Explain another paper
          </button>
        </div>

        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          The paper introduces a sparsely-routed transformer variant designed to eliminate computational overhead during scaling.
          Instead of dense execution across all layers, a learned router conditionally directs input queries to specialized expert pathways.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { k: "Core Innovation", v: "Learned sparse expert routing" },
            { k: "Headline Result", v: "38% less compute, matched accuracy" },
            { k: "Key Limitation", v: "Unstable on tiny batch sizes" },
          ].map((item) => (
            <div key={item.k} className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/30">
              <p className="text-xs tracking-wider text-muted-foreground uppercase">{item.k}</p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">{item.v}</p>
            </div>
          ))}
        </div>

        {isMerged && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => {
                const blob = new Blob(
                  [
                    `${fileName} — Summary\n\n` +
                    NARRATION_CONTENT[selectedLang]?.map((l) => `## ${l.title}\n${l.text}\n`).join("\n"),
                  ],
                  { type: "text/plain" },
                );
                triggerDownload(blob, `Merged-Research-Papers-Summary.txt`);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent/10 px-6 py-3.5 font-display font-semibold text-accent transition-all hover:bg-accent hover:text-white shadow-md"
            >
              <FileText className="size-5" /> Download Merged Summary (.txt)
            </button>
          </div>
        )}
      </section>

      {!isMerged && (
        <>
          {/* AI Presenter Card */}
          <section className="glass-card p-6 sm:p-8 border border-accent/30 bg-gradient-to-r from-surface via-surface to-accent/10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="size-20 sm:size-24 rounded-full bg-gradient-brand p-1 shadow-lg glow-ring">
              <div className="size-full rounded-full bg-surface flex items-center justify-center overflow-hidden border border-border">
                {/* Placeholder Avatar */}
                <div className="flex flex-col items-center justify-center text-accent">
                  <UserCheck className="size-10 sm:size-12" />
                </div>
              </div>
            </div>
            <span className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background">
              <span className="size-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent border border-accent/30">
                <Bot className="size-3.5" /> AI Presenter
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-0.5 text-xs font-medium text-primary border border-primary/20">
                Voice & Canvas Active
              </span>
            </div>
            <h3 className="font-display text-xl font-bold">Dr. PaperPal AI</h3>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              "Welcome! I've broken down this research paper into digestible sections. You can listen to my audio narration below or watch the animated video explainer with full audio narration."
            </p>
          </div>
        </div>
      </section>

      {/* Media Selector Tabs: Watch Video & Listen Audio */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold">Explainer Presentation</h3>
          <span className="text-xs text-muted-foreground">Select view mode:</span>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveMediaTab("all")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeMediaTab === "all"
                ? "bg-gradient-brand text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Show All
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab("audio")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeMediaTab === "audio"
                ? "bg-gradient-brand text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Headphones className="size-3.5" /> Listen Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab("video")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeMediaTab === "video"
                ? "bg-gradient-brand text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="size-3.5" /> Watch Video
          </button>
        </div>
      </div>

      {/* Media Grid: Listen Audio & Watch Video */}
      <div className={`grid gap-8 ${activeMediaTab === "all" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* LISTEN AUDIO SECTION */}
        {(activeMediaTab === "all" || activeMediaTab === "audio") && (
          <section className="glass-card p-6 sm:p-8 border-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="size-5 text-accent" />
                <h2 className="font-display text-xl font-semibold">Listen Audio</h2>
              </div>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent border border-accent/20">
                Voice Narration
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <button
                type="button"
                onClick={toggleAudio}
                aria-label={audioPlaying ? "Pause audio narration" : "Play audio narration"}
                className="bg-gradient-brand flex size-12 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 shadow-md glow-ring"
              >
                {audioPlaying ? (
                  <Pause className="size-5 text-primary-foreground" />
                ) : (
                  <Play className="size-5 text-primary-foreground ml-0.5" />
                )}
              </button>
              
              <div className="flex h-10 flex-1 items-end gap-1 px-1">
                {Array.from({ length: 44 }).map((_, i) => {
                  const played = i / 44 <= audioTime / DURATION;
                  const wobble = audioPlaying && played ? Math.abs(Math.sin(i * 0.7 + audioTime * 6)) : Math.abs(Math.sin(i * 0.7));
                  return (
                    <span
                      key={i}
                      className={`flex-1 rounded-full transition-[height] duration-100 ${
                        played ? "bg-accent" : "bg-accent/25"
                      }`}
                      style={{ height: `${20 + wobble * 80}%` }}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {fmt(audioTime)} / {fmt(DURATION)}
              </span>
            </div>

            <ul className="mt-6 space-y-4">
              {(NARRATION_CONTENT[selectedLang] || NARRATION_CONTENT.en).map((line, i) => (
                <li key={line.t} className="flex gap-4 text-sm rounded-lg p-2.5 transition-colors hover:bg-surface/60">
                  <span className="font-mono text-xs font-semibold text-accent">{line.t}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-xs text-foreground/80 mb-0.5">{line.title}</p>
                    <p className={i === activeAudioLine && audioPlaying ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {line.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* WATCH VIDEO SECTION */}
        {(activeMediaTab === "all" || activeMediaTab === "video") && (
          <section className="glass-card p-6 sm:p-8 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Watch Video</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                Canvas Video + Audio
              </span>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-xl border border-primary/30 bg-purple-100/60 shadow-lg">
              <canvas ref={canvasRef} width={960} height={540} className="block w-full" />
              <button
                type="button"
                onClick={toggleVideo}
                aria-label={videoPlaying ? "Pause explainer video" : "Play explainer video"}
                className="absolute inset-0 flex items-center justify-center transition-opacity hover:bg-purple-900/10 group"
              >
                {!videoPlaying && (
                  <span className="flex size-16 items-center justify-center rounded-full bg-surface/90 backdrop-blur border border-accent/40 shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="size-7 text-accent ml-1" />
                  </span>
                )}
              </button>
            </div>

            {/* Video Controls & Progress */}
            <div className="mt-4 flex flex-col gap-3">
              {/* Progress Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface border border-border shadow-inner cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const newTime = p * DURATION;
                  setVideoTime(newTime);
                  if (videoPlaying) {
                    stopVideoLoop();
                    setTimeout(() => playVideo(newTime), 50);
                  } else {
                    paintVideo(newTime);
                  }
                }}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-primary transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  style={{ width: `${(videoTime / DURATION) * 100}%` }}
                />
              </div>

              {/* Status & Restart */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono tabular-nums">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground/80">{fmt(videoTime)} / {fmt(DURATION)}</span>
                  <button
                    onClick={() => {
                      stopVideoLoop();
                      setVideoTime(0);
                      paintVideo(0);
                      setTimeout(() => playVideo(0), 50);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface hover:text-foreground transition-colors border border-transparent hover:border-border"
                  >
                    <RotateCcw className="size-3.5" /> Restart Video
                  </button>
                </div>
                <span>960p HD · Narrated Explainer</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={downloadVideo}
                disabled={rendering}
                className="bg-gradient-brand flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md glow-ring"
              >
                {rendering ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Rendering…
                  </>
                ) : (
                  <>
                    <Download className="size-5" /> Download Video (.webm)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `${fileName} — Summary\n\n` +
                      NARRATION_CONTENT[selectedLang]?.map((l) => `## ${l.title}\n${l.text}\n`).join("\n"),
                    ],
                    { type: "text/plain" },
                  );
                  triggerDownload(blob, `${fileName.replace(/\.pdf$/i, "")}-Summary.txt`);
                }}
                disabled={rendering}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-accent bg-accent/10 px-6 py-3.5 font-display font-semibold text-accent transition-all hover:bg-accent hover:text-white shadow-md disabled:opacity-60"
              >
                <FileText className="size-5" /> Download Summary (.txt)
              </button>
            </div>
            {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
          </section>
        )}
      </div>
      </>
      )}

      {/* EXTRACTED FIGURES SECTION */}
      <section className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5 text-accent" />
            <h2 className="font-display text-xl font-semibold">Extracted Figures & Tables</h2>
          </div>
          <span className="text-xs text-muted-foreground">{figures.length} items parsed</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((f, idx) => (
            <figure
              key={f.label || idx}
              className="overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/50 hover:shadow-lg"
            >
              <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-muted/30">
                {f.filename ? (
                  <img
                    src={`/uploads/images/${f.filename}`}
                    alt={f.caption}
                    className="size-full object-contain p-2"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = parent.querySelector(".figure-fallback");
                        if (fallback) fallback.classList.remove("hidden");
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`figure-fallback flex flex-col items-center justify-center gap-2 p-4 text-center size-full bg-gradient-to-br ${
                    f.tone || "from-primary/40 to-accent/30"
                  } ${f.filename ? "hidden" : ""}`}
                >
                  <BarChart3 className="size-9 text-accent opacity-90" />
                  <span className="text-xs font-mono text-muted-foreground">Page {f.page || 1}</span>
                </div>
              </div>
              <figcaption className="p-3 bg-surface/90 border-t border-border">
                <p className="text-xs font-semibold text-accent">{f.label || `Figure ${idx + 1}`}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{f.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        {/* Chat Widget */}
        <ChatWidget />
      </section>
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


