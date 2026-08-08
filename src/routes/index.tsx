import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  FileText,
  FileVideo,
  LayoutDashboard,
  Lock,
  LogOut,
  ScanText,
  Sparkles,
  Upload,
  UserCircle2,
  X,
  Play,
  CheckCircle2,
  ChevronRight,
  Layers,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import logoImg from "@/assets/logo.jpg";
import avatarImg from "@/assets/avatar.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Uploader } from "@/components/paper/Uploader";
import { PIPELINE_STEPS, ProgressPanel } from "@/components/paper/ProgressPanel";
import { Results } from "@/components/paper/Results";
import { CreatePaper } from "@/components/paper/CreatePaper";

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
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<"idle" | "working" | "done" | "create">("idle");
  const [mode, setMode] = useState<"single" | "merge">("single");
  const [uploadIntent, setUploadIntent] = useState<"single" | "merge">("single");
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("paper_pal_auth");
      const name = localStorage.getItem("paper_pal_user");
      if (auth === "true") {
        setIsLoggedIn(true);
        setUserName(name || "Researcher");
        setUserEmail((name || "researcher").toLowerCase().replace(/\s+/g, ".") + "@paperpal.ai");
      }
    }
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("paper_pal_auth");
      localStorage.removeItem("paper_pal_user");
    }
    setIsLoggedIn(false);
    setUserName("");
    setPhase("idle");
    setFiles([]);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = (selectedMode: "single" | "merge" = "single") => {
    if (files.length === 0) return;
    setMode(selectedMode);
    
    // Check if any file is not a PDF
    const hasInvalidFile = files.some(f => !(f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) || f.size === 0);
    
    if (hasInvalidFile) {
      navigate({ to: "/unreadable", search: { name: files[0].name } });
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
    setFiles([]);
    setProgress(0);
    setPhase("idle");
    setMode("single");
  };

  const step = Math.min(
    PIPELINE_STEPS.length - 1,
    Math.floor((progress / 100) * PIPELINE_STEPS.length),
  );

  // ─── AUTHENTICATED LAYOUT: Sidebar + Upload ─────────────────────
  if (isLoggedIn) {

    return (
      <div className="h-screen w-screen overflow-hidden flex bg-background">

        {/* ── LEFT SIDEBAR (App-like fixed sidebar) ─────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border bg-surface/50 p-4 gap-4 overflow-y-auto">
          
          {/* Top: Logo & App Name */}
          <div className="flex items-center justify-between px-2 pt-2 pb-4">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <img
                src={logoImg}
                alt="Paper Explained AI Logo"
                className="size-8 rounded-xl shadow-md glow-ring transition-transform group-hover:scale-105 object-cover"
              />
              <span className="font-display text-base font-bold tracking-tight">Paper Explained AI</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="glass-card p-4 flex flex-col items-center text-center gap-3 relative">
            <div className="absolute top-3 right-3">
              <ThemeToggle />
            </div>
            <div className="relative size-20 mt-2">
              <img
                src={avatarImg}
                alt="Profile Avatar"
                className="size-20 rounded-full object-cover shadow-md glow-ring border-2 border-accent/40 bg-white"
              />
              <span className="absolute bottom-1 right-1 size-4 rounded-full bg-green-400 border-2 border-card" />
            </div>
            <div>
              <p className="font-display font-bold text-base">{userName}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{userEmail}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 text-xs font-semibold text-accent">
              ● Active
            </span>
          </div>

          {/* Navigation */}
          <nav className="glass-card p-3 flex flex-col gap-1 flex-1">
            <p className="px-3 pt-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation
            </p>

            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:text-accent group"
            >
              <LayoutDashboard className="size-4 text-accent" />
              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => { reset(); setUploadIntent("single"); }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left mt-2 ${phase !== 'create' && uploadIntent === 'single' ? 'bg-gradient-brand text-primary-foreground glow-ring shadow-md hover:opacity-90' : 'text-foreground hover:bg-muted hover:text-accent'}`}
            >
              <Upload className={`size-4 ${phase !== 'create' && uploadIntent === 'single' ? '' : 'text-muted-foreground'}`} />
              Upload Paper
            </button>

            <button
              type="button"
              onClick={() => { reset(); setUploadIntent("merge"); }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left mt-2 ${phase !== 'create' && uploadIntent === 'merge' ? 'bg-gradient-brand text-primary-foreground glow-ring shadow-md hover:opacity-90' : 'text-foreground hover:bg-muted hover:text-accent'}`}
            >
              <Layers className={`size-4 ${phase !== 'create' && uploadIntent === 'merge' ? '' : 'text-muted-foreground'}`} />
              Merge Papers
            </button>

            <a
              href="#how"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:text-accent mt-2"
            >
              <FileText className="size-4 text-muted-foreground" />
              How it Works
            </a>
          </nav>

          {/* Account Controls */}
          <div className="glass-card p-3 flex flex-col gap-1 mt-auto">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-50 hover:text-red-600 w-full text-left"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN UPLOAD AREA (Scrollable) ─────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto relative bg-background">
          <div className="max-w-4xl mx-auto px-6 py-10 min-h-full flex flex-col">
            
            {/* Mobile profile strip */}
            <div className="lg:hidden mb-6 glass-card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={avatarImg}
                  alt="Profile Avatar"
                  className="size-10 rounded-full object-cover shadow border-2 border-accent/30 bg-white"
                />
                <div>
                  <p className="font-semibold text-sm">{userName}</p>
                  <p className="text-xs text-muted-foreground">Researcher</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="bg-gradient-brand rounded-lg px-3 py-1.5 text-xs font-bold text-white">
                  <LayoutDashboard className="size-3.5 inline mr-1" />Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  <LogOut className="size-3.5 inline mr-1" />Sign Out
                </button>
              </div>
            </div>

            {/* Upload / Progress / Results */}
            <div className="space-y-6">
              {phase !== "create" && (
                <div>
                  <h1 className="font-display text-2xl font-bold">
                    {uploadIntent === "merge" ? "Merge Research Papers" : "Upload Research Paper"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {uploadIntent === "merge" 
                      ? "Drop multiple PDFs below to combine them into a single comprehensive AI summary." 
                      : "Drop a PDF below to get an AI summary, extracted figures, narration and a video explainer."}
                  </p>
                </div>
              )}

              {phase === "idle" && (
                <Uploader files={files} onFiles={setFiles} onGenerate={start} busy={false} />
              )}
              {phase === "working" && <ProgressPanel progress={progress} step={step} />}
              {phase === "done" && files.length > 0 && <Results fileName={mode === "merge" ? "Merged Research Papers" : files[0].name} userName={userName} onReset={reset} />}
              {phase === "create" && <CreatePaper onBack={reset} />}
            </div>

            {/* How it works cards below */}
            {phase === "idle" && (
              <section id="how" className="mt-10 grid gap-4 sm:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="glass-card p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-accent/40 transition-all group">
                    <Icon className="size-5 text-accent group-hover:scale-110 transition-transform" />
                    <h2 className="mt-3 font-display text-base font-semibold group-hover:text-accent transition-colors">{title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Footer inside main scroll area */}
            <footer className="mt-auto pt-10 pb-6 border-t border-border/50 text-sm text-muted-foreground">
              © {new Date().getFullYear()} Paper Explained AI — research, made watchable.
            </footer>
          </div>
        </main>
      </div>
    );
  }

  // ─── UNAUTHENTICATED LANDING PAGE ───────────────────────────────
  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col relative bg-background">

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-accent/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Theme toggle top-right */}
      <div className="absolute top-5 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Full-screen centered layout */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-8 gap-8">
        {/* Logo */}
        <button
          onClick={() => window.location.reload()}
          className="group flex flex-col items-center gap-6 cursor-pointer focus:outline-none"
        >
          <img
            src={logoImg}
            alt="Paper Explained AI Logo"
            className="size-32 sm:size-48 rounded-3xl shadow-2xl glow-ring transition-transform group-hover:scale-105 group-hover:-translate-y-2 object-cover"
          />
          <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-center">
            Paper Explained AI
          </span>
        </button>

        <p className="text-muted-foreground text-base sm:text-lg text-center max-w-md leading-relaxed">
          Upload a research PDF. Get an AI summary, extracted figures, narration and a ready-to-share explainer video.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mt-4">
          <Link
            to="/auth"
            className="flex-1 rounded-2xl border border-border bg-surface px-6 py-4 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:border-accent/40 shadow-sm text-center"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="flex-1 bg-gradient-brand rounded-2xl px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg glow-ring transition-opacity hover:opacity-90 text-center"
          >
            Sign Up Free
          </Link>
        </div>
      </div>


      {/* Interactive Feature Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass-card relative w-full max-w-2xl p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 bg-surface">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
            
            {activeModal === "Reads the whole paper" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent mb-6">
                  <ScanText className="size-8" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Smart Parsing</h3>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border space-y-3 font-mono text-sm text-left">
                  <div className="flex items-center gap-2 text-primary"><ChevronRight className="size-4"/> 1. Abstract extracted</div>
                  <div className="flex items-center gap-2 text-primary"><ChevronRight className="size-4"/> 2. Introduction & Background (Found 12 citations)</div>
                  <div className="flex items-center gap-2 text-primary"><ChevronRight className="size-4"/> 3. Methodology (Detected 3 complex equations)</div>
                  <div className="flex items-center gap-2 text-muted-foreground pl-6 border-l-2 border-border ml-2">Equation 1: E = mc² successfully parsed</div>
                  <div className="flex items-center gap-2 text-primary"><ChevronRight className="size-4"/> 4. Results (Extracted 2 tables, 1 figure)</div>
                </div>
                <p className="text-muted-foreground text-sm text-left">We don't just read text; we parse the structural hierarchy, equations, and tables to truly understand the paper's flow.</p>
              </div>
            )}

            {activeModal === "Explains like a human" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-accent mb-6">
                  <BrainCircuit className="size-8" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Strict & Accurate</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
                    <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Academic Text</p>
                    <p className="text-sm text-muted-foreground line-clamp-4">"The proposed bidirectional transformer architecture demonstrates anomalous convergence characteristics when exposed to out-of-distribution adversarial perturbations..."</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl relative">
                    <CheckCircle2 className="absolute -top-3 -right-3 size-6 text-green-500 bg-background rounded-full shadow-sm" />
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Our Explanation</p>
                    <p className="text-sm font-medium">"The AI model struggles and breaks down when fed tricky, unfamiliar data."</p>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border mt-4 flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold">We strict-prompt our AI to <span className="text-primary">only explain what is actually written in the research paper</span>. It retains nuance and highlights limitations without making things up or hallucinating outside information.</p>
                </div>
              </div>
            )}

            {activeModal === "Ships a video" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent mb-6">
                  <FileVideo className="size-8" />
                  <h3 className="font-display text-2xl font-bold text-foreground">Studio-Quality Audio</h3>
                </div>
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center group cursor-pointer border border-border">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-accent/20 mix-blend-overlay z-10" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors z-20">
                    <Play className="size-16 text-white opacity-90 drop-shadow-lg group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl border border-border mt-4 flex items-start gap-3 text-left">
                  <Sparkles className="size-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">Hear the difference. We use state-of-the-art Text-to-Speech models ensuring <span className="font-bold text-foreground">crystal clear pronunciation</span> of complex scientific terms, author names, and methodologies.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
/ /   T r i g g e r   L o v a b l e   S y n c  
 