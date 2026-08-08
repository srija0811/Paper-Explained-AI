import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Clock,
  Download,
  FileText,
  Headphones,
  LogOut,
  Plus,
  Search,
  UserCheck,
  Video,
  Zap,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Results } from "@/components/paper/Results";
import { Uploader } from "@/components/paper/Uploader";
import { PIPELINE_STEPS, ProgressPanel } from "@/components/paper/ProgressPanel";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Paper Explained AI" },
      { name: "description", content: "Manage your research papers, extracted figures, and AI video explainers." },
    ],
  }),
  component: DashboardPage,
});

type PaperRecord = {
  id: string;
  title: string;
  filename: string;
  date: string;
  figuresCount: number;
  duration: string;
  category: string;
  status: "ready" | "processing";
};

const SAMPLE_PAPERS: PaperRecord[] = [
  {
    id: "p1",
    title: "Sparse Routing Transformers for Fast Inference",
    filename: "sparse_routing_transformers_2024.pdf",
    date: "Just now",
    figuresCount: 4,
    duration: "00:28",
    category: "Deep Learning",
    status: "ready",
  },
  {
    id: "p2",
    title: "Attention Is All You Need — Architecture Analysis",
    filename: "transformer_attention_all_you_need.pdf",
    date: "2 days ago",
    figuresCount: 6,
    duration: "01:15",
    category: "NLP",
    status: "ready",
  },
  {
    id: "p3",
    title: "Diffusion Models for High Resolution Synthesis",
    filename: "latent_diffusion_paper_v2.pdf",
    date: "1 week ago",
    figuresCount: 8,
    duration: "00:45",
    category: "Computer Vision",
    status: "ready",
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Researcher");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Active view: "library" | "results" | "upload"
  const [view, setView] = useState<"library" | "results" | "upload">("library");
  const [selectedPaper, setSelectedPaper] = useState<PaperRecord>(SAMPLE_PAPERS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload flow state
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("paper_pal_auth");
      const name = localStorage.getItem("paper_pal_user");
      if (auth !== "true") {
        navigate({ to: "/auth" });
      } else if (name) {
        setUserName(name);
      }
    }
  }, [navigate]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("paper_pal_auth");
      localStorage.removeItem("paper_pal_user");
    }
    setIsLoggedIn(false);
    navigate({ to: "/auth" });
  };

  const handleStartUpload = () => {
    if (!file) return;
    setPhase("working");
    setProgress(0);
    const total = 40;
    for (let i = 1; i <= total; i++) {
      setTimeout(() => {
        setProgress((i / total) * 100);
        if (i === total) {
          setPhase("done");
        }
      }, i * 80);
    }
  };

  const filteredPapers = SAMPLE_PAPERS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dashboard Top Navigation Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={logoImg}
                alt="Paper Explained AI Logo"
                className="size-10 rounded-xl shadow-md glow-ring transition-transform group-hover:scale-105 object-cover"
              />
              <span className="font-display text-lg font-bold">Paper Explained AI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 border-l border-border pl-6">
              <button
                type="button"
                onClick={() => setView("library")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  view === "library"
                    ? "bg-gradient-brand text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard Library
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("upload");
                  setPhase("idle");
                  setFile(null);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  view === "upload"
                    ? "bg-gradient-brand text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                + New Upload
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <UserCheck className="size-3.5 text-accent" /> {userName}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground transition-all hover:bg-muted"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-6 py-8 flex-1 space-y-8">
        {/* Welcome Banner & Metrics */}
        <section className="glass-card p-6 sm:p-8 border-accent/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent border border-accent/30">
                  <Bot className="size-3.5" /> Research Dashboard
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold">
                Welcome back, <span className="text-gradient">{userName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your paper summaries, extracted figures, and AI narrated video explainers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setView("upload");
                setPhase("idle");
                setFile(null);
              }}
              className="bg-gradient-brand inline-flex items-center gap-2 rounded-xl px-5 py-3 font-display font-bold text-primary-foreground shadow-md glow-ring transition-opacity hover:opacity-90 shrink-0"
            >
              <Plus className="size-4" /> Explain New Paper
            </button>
          </div>

          {/* Metric Callouts */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Papers Analyzed", value: "12", icon: BookOpen, sub: "+3 this week" },
              { label: "Figures Extracted", value: "48", icon: BarChart3, sub: "Diagrams & tables" },
              { label: "Video Explainers", value: "15", icon: Video, sub: "WebM & Voice" },
              { label: "Research Time Saved", value: "38.5 hrs", icon: Zap, sub: "Fast 90s summaries" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{m.label}</span>
                    <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display">{m.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.sub}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dashboard Content Switcher */}
        {view === "library" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold">Your Research Library</h2>
                <p className="text-xs text-muted-foreground">Select a paper to review its summary and video explainer.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search papers or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="glass-card p-6 border-border flex flex-col justify-between transition-all hover:border-accent/50 hover:shadow-lg group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent/20">
                        {paper.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{paper.date}</span>
                    </div>
                    <h3 className="font-display text-base font-bold group-hover:text-accent transition-colors line-clamp-2">
                      {paper.title}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground truncate">{paper.filename}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="size-3.5 text-accent" /> {paper.figuresCount} figs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-accent" /> {paper.duration}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaper(paper);
                        setView("results");
                      }}
                      className="bg-gradient-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                    >
                      <Video className="size-3.5" /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* View Results Mode */}
        {view === "results" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setView("library")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline mb-2"
            >
              ← Back to Library
            </button>
            <Results fileName={selectedPaper.filename} onReset={() => setView("library")} />
          </div>
        )}

        {/* View Upload Mode */}
        {view === "upload" && (
          <section className="mx-auto max-w-4xl space-y-4">
            <button
              type="button"
              onClick={() => setView("library")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline mb-2"
            >
              ← Back to Library
            </button>

            {phase === "idle" && (
              <Uploader file={file} onFile={setFile} onGenerate={handleStartUpload} busy={false} />
            )}

            {phase === "working" && <ProgressPanel progress={progress} step={0} />}

            {phase === "done" && file && (
              <Results
                fileName={file.name}
                onReset={() => {
                  setPhase("idle");
                  setFile(null);
                }}
              />
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Paper Explained AI — Research Dashboard.
      </footer>
    </div>
  );
}
