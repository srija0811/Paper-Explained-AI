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
  Home,
  Layers,
  LogOut,
  Map,
  Plus,
  Search,
  Settings,
  Smartphone,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  Zap,
  Bell,
  ChevronDown,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import avatarImg from "@/assets/avatar.jpg";
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
  {
    id: "p4",
    title: "RLHF: Training Language Models from Human Feedback",
    filename: "rlhf_instruct_gpt.pdf",
    date: "2 weeks ago",
    figuresCount: 5,
    duration: "00:58",
    category: "Alignment",
    status: "ready",
  },
];

const STATS = [
  { label: "Papers Analyzed", value: "12", icon: BookOpen, sub: "+3 this week", color: "#BC0202" },
  { label: "Figures Extracted", value: "48", icon: BarChart3, sub: "Diagrams & tables", color: "#e00303" },
  { label: "Video Explainers", value: "15", icon: Video, sub: "WebM & Voice", color: "#BC0202" },
  { label: "Hours Saved", value: "38.5", icon: Zap, sub: "Fast 90s summaries", color: "#e00303" },
];

const MONTHLY_DATA = [
  { month: "May", papers: 2, videos: 1 },
  { month: "Jun", papers: 4, videos: 3 },
  { month: "Jul", papers: 3, videos: 3 },
  { month: "Aug", papers: 6, videos: 5 },
  { month: "Sep", papers: 5, videos: 4 },
  { month: "Oct", papers: 8, videos: 7 },
];

const CATEGORIES = [
  { name: "Deep Learning", count: 247, color: "#BC0202" },
  { name: "NLP", count: 164, color: "#e00303" },
  { name: "Computer Vision", count: 98, color: "#ff2020" },
];

const NAV_ITEMS = [
  { icon: Home, label: "Overview", view: "library" },
  { icon: FileText, label: "My Papers", view: "library" },
  { icon: Layers, label: "Merge Papers", view: "upload" },
  { icon: Users, label: "Collaborators", view: null },
  { icon: BarChart3, label: "Analytics", view: null },
  { icon: Clock, label: "History", view: null },
];

function MiniBarChart() {
  const max = Math.max(...MONTHLY_DATA.map((d) => Math.max(d.papers, d.videos)));
  return (
    <div className="flex items-end gap-1.5 h-28">
      {MONTHLY_DATA.map((d) => (
        <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: "88px" }}>
            <div
              className="w-3 rounded-t-sm transition-all"
              style={{
                height: `${(d.papers / max) * 88}px`,
                background: "linear-gradient(to top, #BC0202, #ff2020)",
              }}
            />
            <div
              className="w-3 rounded-t-sm transition-all"
              style={{
                height: `${(d.videos / max) * 88}px`,
                background: "rgba(255,255,255,0.15)",
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart() {
  const total = CATEGORIES.reduce((s, c) => s + c.count, 0);
  let angle = -90;
  const segments = CATEGORIES.map((c) => {
    const pct = c.count / total;
    const start = angle;
    angle += pct * 360;
    return { ...c, pct, start, end: angle };
  });

  const toPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="42" fill="transparent" stroke="#1c1c1c" strokeWidth="16" />
        {segments.map((s, i) => {
          const r = 42;
          const cx = 55, cy = 55;
          const toRad = (d: number) => (d * Math.PI) / 180;
          const x1 = cx + r * Math.cos(toRad(s.start));
          const y1 = cy + r * Math.sin(toRad(s.start));
          const x2 = cx + r * Math.cos(toRad(s.end - 0.5));
          const y2 = cy + r * Math.sin(toRad(s.end - 0.5));
          const large = s.end - s.start > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${cx + r * Math.cos(toRad(s.start))} ${cy + r * Math.sin(toRad(s.start))} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeLinecap="round"
            />
          );
        })}
        <text x="55" y="50" textAnchor="middle" fill="#f5f5f5" fontSize="14" fontWeight="bold">{Math.round((CATEGORIES[0].count / total) * 100)}%</text>
        <text x="55" y="65" textAnchor="middle" fill="#888" fontSize="8">Deep Learning</text>
      </svg>
      <div className="flex flex-col gap-1.5 w-full">
        {CATEGORIES.map((c) => (
          <div key={c.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="text-muted-foreground">{c.name}</span>
            </div>
            <span className="font-bold text-foreground">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Researcher");
  const [userEmail, setUserEmail] = useState("researcher@paperpal.ai");
  const [view, setView] = useState<"library" | "results" | "upload">("library");
  const [selectedPaper, setSelectedPaper] = useState<PaperRecord>(SAMPLE_PAPERS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [activeNav, setActiveNav] = useState("Overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("paper_pal_auth");
      const name = localStorage.getItem("paper_pal_user");
      if (auth !== "true") {
        navigate({ to: "/auth" });
      } else if (name) {
        setUserName(name);
        setUserEmail(name.toLowerCase().replace(/\s+/g, ".") + "@paperpal.ai");
      }
    }
  }, [navigate]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("paper_pal_auth");
      localStorage.removeItem("paper_pal_user");
    }
    navigate({ to: "/auth" });
  };

  const handleStartUpload = (mode: "single" | "merge" = "single") => {
    if (files.length === 0) return;
    setPhase("working");
    setProgress(0);
    const total = 40;
    for (let i = 1; i <= total; i++) {
      setTimeout(() => {
        setProgress((i / total) * 100);
        if (i === total) setPhase("done");
      }, i * 80);
    }
  };

  const filteredPapers = SAMPLE_PAPERS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex" style={{ background: "#080808" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full" style={{ background: "#0d0d0d", borderRight: "1px solid #1e1e1e" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "#1e1e1e" }}>
          <img src={logoImg} alt="Logo" className="size-9 rounded-xl object-cover shadow-lg" style={{ boxShadow: "0 0 12px rgba(188,2,2,0.4)" }} />
          <div>
            <span className="font-display text-sm font-bold text-white block leading-tight">Paper Explained</span>
            <span className="text-[10px] font-bold" style={{ color: "#BC0202" }}>AI Research Tool</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#444" }}>Main Menu</p>

          {NAV_ITEMS.map(({ icon: Icon, label, view: v }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActiveNav(label);
                  if (v) setView(v as any);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left group"
                style={{
                  background: isActive ? "linear-gradient(135deg, #BC0202, #e00303)" : "transparent",
                  color: isActive ? "#fff" : "#888",
                  boxShadow: isActive ? "0 4px 15px rgba(188,2,2,0.3)" : "none",
                }}
              >
                <Icon className="size-4 shrink-0" style={{ color: isActive ? "#fff" : "#555" }} />
                {label}
              </button>
            );
          })}

          <div className="mt-2 border-t pt-2" style={{ borderColor: "#1e1e1e" }}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#444" }}>Settings</p>
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left"
              style={{ color: "#666" }}
            >
              <Settings className="size-4" style={{ color: "#555" }} />
              Settings
            </button>
          </div>
        </nav>

        {/* Mobile app promo */}
        <div className="mx-3 mb-4 p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #1a0000, #2a0000)", border: "1px solid #3a0000" }}>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="size-5" style={{ color: "#BC0202" }} />
            <span className="text-xs font-bold text-white">Get mobile app</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: "#888" }}>Explain papers on the go</p>
          <div className="flex gap-2">
            <span className="text-[9px] rounded-lg px-2 py-1 font-bold" style={{ background: "#BC0202", color: "#fff" }}>App Store</span>
            <span className="text-[9px] rounded-lg px-2 py-1 font-bold" style={{ background: "#222", color: "#888", border: "1px solid #333" }}>Google Play</span>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "#1e1e1e" }}>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold w-full text-left transition-all hover:bg-red-950/30"
            style={{ color: "#ff4444" }}
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 shrink-0" style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e" }}>
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: "#555" }} />
            <input
              type="text"
              placeholder="Search papers, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
              style={{ background: "#141414", border: "1px solid #222", color: "#f5f5f5" }}
            />
          </div>

          {/* Right: Upload btn + bell + avatar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setView("upload"); setPhase("idle"); setFiles([]); setActiveNav("Merge Papers"); }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #BC0202, #e00303)", boxShadow: "0 4px 15px rgba(188,2,2,0.3)" }}
            >
              <Plus className="size-3.5" />
              Explain Paper
            </button>

            <button type="button" className="relative p-2.5 rounded-xl transition-all hover:bg-white/5" style={{ border: "1px solid #222" }}>
              <Bell className="size-4" style={{ color: "#666" }} />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full" style={{ background: "#BC0202" }} />
            </button>

            <div className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 transition-all hover:bg-white/5" style={{ border: "1px solid #222" }}>
              <img src={avatarImg} alt="Avatar" className="size-7 rounded-full object-cover" style={{ border: "2px solid #BC0202" }} />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{userName}</p>
                <p className="text-[10px]" style={{ color: "#555" }}>Researcher</p>
              </div>
              <ChevronDown className="size-3.5 ml-1" style={{ color: "#555" }} />
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── OVERVIEW / LIBRARY ── */}
          {view === "library" && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {STATS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-2xl p-5 transition-all hover:scale-[1.02]" style={{ background: "#111", border: "1px solid #1e1e1e", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(188,2,2,0.15)" }}>
                          <Icon className="size-5" style={{ color: "#BC0202" }} />
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1a0000", color: "#BC0202" }}>
                          ▲ +12%
                        </span>
                      </div>
                      <p className="text-2xl font-bold font-display text-white">{s.value}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "#888" }}>{s.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#555" }}>{s.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Bar Chart */}
                <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-white">Papers vs Videos Trend</h2>
                      <p className="text-[11px] mt-0.5" style={{ color: "#555" }}>Monthly activity overview</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full inline-block" style={{ background: "#BC0202" }} />Papers</span>
                      <span className="flex items-center gap-1.5" style={{ color: "#666" }}><span className="size-2 rounded-full inline-block" style={{ background: "#333" }} />Videos</span>
                    </div>
                  </div>
                  <MiniBarChart />
                </div>

                {/* Donut Chart */}
                <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                  <h2 className="text-sm font-bold text-white mb-1">Papers by Category</h2>
                  <p className="text-[11px] mb-4" style={{ color: "#555" }}>Distribution by research area</p>
                  <DonutChart />
                </div>
              </div>

              {/* Papers Table */}
              <div className="rounded-2xl" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1e1e1e" }}>
                  <h2 className="text-sm font-bold text-white">Your Research Library</h2>
                  <button
                    type="button"
                    onClick={() => { setView("upload"); setPhase("idle"); setFiles([]); }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(135deg, #BC0202, #e00303)" }}
                  >
                    <Plus className="size-3.5" /> Add Paper
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                        {["Paper Title", "Category", "Figures", "Duration", "Date", "Action"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#444" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPapers.map((p, i) => (
                        <tr
                          key={p.id}
                          className="transition-all hover:bg-white/[0.02] group"
                          style={{ borderBottom: i < filteredPapers.length - 1 ? "1px solid #161616" : "none" }}
                        >
                          <td className="px-5 py-3.5 max-w-[200px]">
                            <p className="font-semibold text-white text-xs leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">{p.title}</p>
                            <p className="text-[10px] mt-0.5 truncate" style={{ color: "#444" }}>{p.filename}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: "#1a0000", color: "#e00303" }}>{p.category}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: "#888" }}>{p.figuresCount}</td>
                          <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: "#888" }}>{p.duration}</td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: "#666" }}>{p.date}</td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => { setSelectedPaper(p); setView("results"); }}
                              className="text-[10px] font-bold rounded-lg px-3 py-1.5 transition-all hover:opacity-80"
                              style={{ background: "linear-gradient(135deg, #BC0202, #e00303)", color: "#fff" }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom: Stats summary card */}
              <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #BC0202 0%, #7a0101 100%)", boxShadow: "0 8px 30px rgba(188,2,2,0.4)" }}>
                <div>
                  <p className="text-white/60 text-xs font-semibold">This Month's Impact</p>
                  <p className="text-white text-3xl font-bold font-display mt-1">12 <span className="text-lg font-semibold text-white/70">Papers</span></p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Total research time saved</p>
                  <p className="text-white text-2xl font-bold mt-1">38.5 hrs</p>
                </div>
                <TrendingUp className="size-16 text-white/20" />
              </div>
            </>
          )}

          {/* ── RESULTS VIEW ── */}
          {view === "results" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setView("library")}
                className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                style={{ color: "#BC0202" }}
              >
                ← Back to Library
              </button>
              <Results fileName={selectedPaper.filename} onReset={() => setView("library")} />
            </div>
          )}

          {/* ── UPLOAD VIEW ── */}
          {view === "upload" && (
            <section className="max-w-4xl mx-auto space-y-4">
              <button
                type="button"
                onClick={() => setView("library")}
                className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                style={{ color: "#BC0202" }}
              >
                ← Back to Library
              </button>

              {phase === "idle" && (
                <Uploader files={files} onFiles={setFiles} onGenerate={handleStartUpload} busy={false} />
              )}
              {phase === "working" && <ProgressPanel progress={progress} step={0} />}
              {phase === "done" && files.length > 0 && (
                <Results
                  fileName={files[0].name}
                  onReset={() => { setPhase("idle"); setFiles([]); }}
                />
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
