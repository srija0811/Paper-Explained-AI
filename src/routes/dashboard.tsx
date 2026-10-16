import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Clock,
  FileText,
  Layers,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Smartphone,
  TrendingUp,
  Users,
  Video,
  Zap,
  Bell,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import avatarImg from "@/assets/avatar.jpg";
import { Results } from "@/components/paper/Results";
import { Uploader } from "@/components/paper/Uploader";
import { ProgressPanel } from "@/components/paper/ProgressPanel";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Paper Explained AI" },
      { name: "description", content: "Manage your research papers and AI video explainers." },
    ],
  }),
  component: DashboardPage,
});

// ── Color tokens ──────────────────────────────────────────────
const C = {
  bg:        "#FFF4DE",
  card:      "#ffffff",
  sidebar:   "#fff8f4",
  border:    "#FFD6E0",
  pink:      "#E8638A",
  pinkLight: "#FFB6C8",
  pinkPale:  "#FFD6E0",
  cream:     "#FFF4DE",
  text:      "#2D1515",
  muted:     "#9a6b72",
  tag:       "#FFE8EE",
};

// ── Types ─────────────────────────────────────────────────────
type PaperRecord = {
  id: string; title: string; filename: string; date: string;
  figuresCount: number; duration: string; category: string;
};

type ChatMsg = { role: "user" | "ai"; text: string };

// ── Sample data ───────────────────────────────────────────────
const SAMPLE_PAPERS: PaperRecord[] = [
  { id: "p1", title: "Sparse Routing Transformers for Fast Inference", filename: "sparse_routing_transformers_2024.pdf", date: "Just now", figuresCount: 4, duration: "00:28", category: "Deep Learning" },
  { id: "p2", title: "Attention Is All You Need — Architecture Analysis", filename: "transformer_attention_all_you_need.pdf", date: "2 days ago", figuresCount: 6, duration: "01:15", category: "NLP" },
  { id: "p3", title: "Diffusion Models for High Resolution Synthesis", filename: "latent_diffusion_paper_v2.pdf", date: "1 week ago", figuresCount: 8, duration: "00:45", category: "Computer Vision" },
  { id: "p4", title: "RLHF: Training Language Models from Human Feedback", filename: "rlhf_instruct_gpt.pdf", date: "2 weeks ago", figuresCount: 5, duration: "00:58", category: "Alignment" },
];

const STATS = [
  { label: "Papers Analyzed", value: "12", icon: BookOpen, sub: "+3 this week" },
  { label: "Figures Extracted", value: "48", icon: BarChart3, sub: "Diagrams & tables" },
  { label: "Video Explainers", value: "15", icon: Video, sub: "WebM & Voice" },
  { label: "Hours Saved", value: "38.5", icon: Zap, sub: "Fast summaries" },
];

const MONTHLY = [
  { m: "May", p: 2, v: 1 }, { m: "Jun", p: 4, v: 3 }, { m: "Jul", p: 3, v: 3 },
  { m: "Aug", p: 6, v: 5 }, { m: "Sep", p: 5, v: 4 }, { m: "Oct", p: 8, v: 7 },
];

const CATS = [
  { name: "Deep Learning", count: 247, pct: 48 },
  { name: "NLP", count: 164, pct: 32 },
  { name: "Computer Vision", count: 98, pct: 20 },
];

const NAV = [
  { icon: FileText, label: "My Papers",      view: "library" },
  { icon: Layers,   label: "Merge Papers",   view: "upload"  },
  { icon: Users,    label: "Collaborators",  view: null      },
  { icon: Clock,    label: "History",        view: null      },
];

// ── AI Bot replies ────────────────────────────────────────────
const BOT_REPLIES: Record<string, string> = {
  default: "I can help you understand your research papers! Ask me about any paper in your library, or ask me to explain a concept.",
  hello: "Hi there! 👋 I'm your Paper AI assistant. Ask me to summarize a paper, explain a concept, or help you understand complex research topics!",
  summary: "Based on your uploaded papers, here's a quick summary: Your library covers Deep Learning, NLP, Computer Vision and AI Alignment. The most recent paper focuses on sparse routing in transformer models for faster inference.",
  transformer: "A Transformer is a neural network architecture based entirely on self-attention mechanisms. The key insight from 'Attention is All You Need' is that RNNs aren't needed — attention alone can capture long-range dependencies much more efficiently.",
  diffusion: "Diffusion models work by gradually adding noise to data (forward process), then learning to reverse this process (reverse diffusion). They've become state-of-the-art for image synthesis, beating GANs on quality and diversity metrics.",
  rlhf: "RLHF (Reinforcement Learning from Human Feedback) is a technique to align language models with human preferences. It involves: 1) supervised fine-tuning, 2) training a reward model from human comparisons, and 3) optimizing with PPO.",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.match(/hi|hello|hey/)) return BOT_REPLIES.hello;
  if (lower.match(/summary|summarize|overview/)) return BOT_REPLIES.summary;
  if (lower.match(/transformer|attention/)) return BOT_REPLIES.transformer;
  if (lower.match(/diffusion/)) return BOT_REPLIES.diffusion;
  if (lower.match(/rlhf|reinforcement|feedback/)) return BOT_REPLIES.rlhf;
  return BOT_REPLIES.default;
}

// ── Mini bar chart ────────────────────────────────────────────
function MiniBarChart() {
  const max = Math.max(...MONTHLY.map(d => Math.max(d.p, d.v)));
  return (
    <div className="flex items-end gap-2 h-28">
      {MONTHLY.map(d => (
        <div key={d.m} className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 90 }}>
            <div className="w-3.5 rounded-t-md transition-all" style={{ height: `${(d.p / max) * 90}px`, background: "linear-gradient(to top, #E8638A, #FFB6C8)" }} />
            <div className="w-3.5 rounded-t-md transition-all" style={{ height: `${(d.v / max) * 90}px`, background: "#FFD6E0" }} />
          </div>
          <span className="text-[10px]" style={{ color: C.muted }}>{d.m}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────
function DonutChart() {
  const colors = ["#E8638A", "#FFB6C8", "#FFD6E0"];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          {CATS.map((c, i) => {
            const offset = CATS.slice(0, i).reduce((s, x) => s + x.pct, 0);
            const circ = 2 * Math.PI * 38;
            return (
              <circle key={i} cx="55" cy="55" r="38" fill="none"
                stroke={colors[i]} strokeWidth="16"
                strokeDasharray={`${(c.pct / 100) * circ} ${circ}`}
                strokeDashoffset={-((offset / 100) * circ) + circ * 0.25}
                style={{ transition: "all 0.5s" }}
              />
            );
          })}
          <text x="55" y="51" textAnchor="middle" fontSize="13" fontWeight="bold" fill={C.text}>48%</text>
          <text x="55" y="65" textAnchor="middle" fontSize="8" fill={C.muted}>DL</text>
        </svg>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {CATS.map((c, i) => (
          <div key={c.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
              <span style={{ color: C.muted }}>{c.name}</span>
            </div>
            <span className="font-bold" style={{ color: C.text }}>{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat Widget ───────────────────────────────────────────────
function ChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai", text: "Hi! I'm your Paper AI assistant 🎀 Ask me anything about your research papers!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: getBotReply(userMsg) }]);
    }, 900 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#fff" }}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "linear-gradient(135deg, #FFB6C8, #E8638A)", borderRadius: "20px 20px 0 0" }}>
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.25)" }}>
            <Bot className="size-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Paper AI Assistant</p>
            <p className="text-[10px] text-white/70">Ask about your research</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
          <X className="size-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: "#FFF8F4" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="size-6 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0" style={{ background: "#FFB6C8" }}>
                <Sparkles className="size-3" style={{ color: "#E8638A" }} />
              </div>
            )}
            <div
              className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
              style={{
                background: m.role === "user" ? "linear-gradient(135deg, #E8638A, #c94475)" : "#fff",
                color: m.role === "user" ? "#fff" : C.text,
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                boxShadow: "0 2px 8px rgba(232,99,138,0.1)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="size-6 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0" style={{ background: "#FFB6C8" }}>
              <Sparkles className="size-3" style={{ color: "#E8638A" }} />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 8px rgba(232,99,138,0.1)" }}>
              <div className="flex gap-1 items-center">
                <span className="size-1.5 rounded-full animate-bounce" style={{ background: "#FFB6C8", animationDelay: "0ms" }} />
                <span className="size-1.5 rounded-full animate-bounce" style={{ background: "#E8638A", animationDelay: "150ms" }} />
                <span className="size-1.5 rounded-full animate-bounce" style={{ background: "#c94475", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0" style={{ background: "#FFF8F4", borderTop: `1px solid ${C.border}` }}>
        {["Summarize papers", "Explain Transformer", "What is RLHF?"].map(s => (
          <button key={s} type="button" onClick={() => { setInput(s); }}
            className="text-[10px] font-semibold rounded-full px-3 py-1 whitespace-nowrap transition-all hover:opacity-80 shrink-0"
            style={{ background: "#FFE8EE", color: "#E8638A", border: `1px solid ${C.pinkLight}` }}
          >{s}</button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 flex gap-2 shrink-0" style={{ background: "#fff", borderTop: `1px solid ${C.border}` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about your papers..."
          className="flex-1 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
          style={{ background: "#FFF8F4", border: `1px solid ${C.border}`, color: C.text }}
        />
        <button type="button" onClick={send}
          className="size-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #E8638A, #c94475)" }}
        >
          <Send className="size-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
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
  const [activeNav, setActiveNav] = useState("My Papers");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("paper_pal_auth");
      const name = localStorage.getItem("paper_pal_user");
      if (auth !== "true") navigate({ to: "/auth" });
      else if (name) {
        setUserName(name);
        setUserEmail(name.toLowerCase().replace(/\s+/g, ".") + "@paperpal.ai");
      }
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("paper_pal_auth");
    localStorage.removeItem("paper_pal_user");
    navigate({ to: "/auth" });
  };

  const handleStartUpload = () => {
    if (!files.length) return;
    setPhase("working"); setProgress(0);
    for (let i = 1; i <= 40; i++) {
      setTimeout(() => {
        setProgress((i / 40) * 100);
        if (i === 40) setPhase("done");
      }, i * 80);
    }
  };

  const filtered = SAMPLE_PAPERS.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex" style={{ background: C.bg }}>

      {/* ── SIDEBAR ──────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-full" style={{ background: C.sidebar, borderRight: `1px solid ${C.border}` }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <img src={logoImg} alt="Logo" className="size-9 rounded-xl object-cover" style={{ boxShadow: `0 0 12px rgba(232,99,138,0.3)` }} />
          <div>
            <span className="font-display text-sm font-bold block leading-tight" style={{ color: C.text }}>Paper Explained</span>
            <span className="text-[10px] font-bold" style={{ color: C.pink }}>AI Research Tool</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ccc" }}>Menu</p>

          {NAV.map(({ icon: Icon, label, view: v }) => {
            const isActive = activeNav === label;
            return (
              <button key={label} type="button"
                onClick={() => { setActiveNav(label); if (v) setView(v as any); }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left"
                style={{
                  background: isActive ? "linear-gradient(135deg, #FFB6C8, #E8638A)" : "transparent",
                  color: isActive ? "#fff" : C.muted,
                  boxShadow: isActive ? "0 4px 14px rgba(232,99,138,0.3)" : "none",
                }}
              >
                <Icon className="size-4 shrink-0" style={{ color: isActive ? "#fff" : C.pinkLight }} />
                {label}
              </button>
            );
          })}

          {/* Chat button in sidebar */}
          <button type="button" onClick={() => setChatOpen(true)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left mt-1"
            style={{ background: chatOpen ? "linear-gradient(135deg, #FFB6C8, #E8638A)" : "transparent", color: chatOpen ? "#fff" : C.muted }}
          >
            <MessageCircle className="size-4 shrink-0" style={{ color: chatOpen ? "#fff" : C.pinkLight }} />
            AI Chat
          </button>

          <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ccc" }}>General</p>
            <button type="button" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all w-full text-left" style={{ color: C.muted }}>
              <Settings className="size-4" style={{ color: C.pinkLight }} />
              Settings
            </button>
          </div>
        </nav>

        {/* Mobile app promo */}
        <div className="mx-3 mb-4 p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #FFE8EE, #FFD6E0)", border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Smartphone className="size-4" style={{ color: C.pink }} />
            <span className="text-xs font-bold" style={{ color: C.text }}>Get mobile app</span>
          </div>
          <p className="text-[10px] mb-3" style={{ color: C.muted }}>Explain papers on the go</p>
          <div className="flex gap-2">
            <span className="text-[10px] rounded-lg px-2.5 py-1 font-bold text-white" style={{ background: C.pink }}>App Store</span>
            <span className="text-[10px] rounded-lg px-2.5 py-1 font-bold" style={{ background: "#fff", color: C.muted, border: `1px solid ${C.border}` }}>Google Play</span>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-3 pb-4 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <button type="button" onClick={handleSignOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold w-full text-left transition-all hover:bg-red-50"
            style={{ color: "#e85555" }}
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────── */}
      <div className="flex-1 flex h-full overflow-hidden">

        {/* Content column */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-3.5 shrink-0" style={{ background: "#fff", borderBottom: `1px solid ${C.border}` }}>
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: C.pinkLight }} />
              <input type="text" placeholder="Search papers..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setView("upload"); setPhase("idle"); setFiles([]); setActiveNav("Merge Papers"); }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FFB6C8, #E8638A)", boxShadow: "0 4px 14px rgba(232,99,138,0.35)" }}
              >
                <Plus className="size-3.5" /> Explain Paper
              </button>

              {/* Chat toggle */}
              <button type="button" onClick={() => setChatOpen(o => !o)}
                className="relative p-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: chatOpen ? "linear-gradient(135deg, #FFB6C8, #E8638A)" : C.bg, border: `1px solid ${C.border}` }}
              >
                <MessageCircle className="size-4" style={{ color: chatOpen ? "#fff" : C.pink }} />
                <span className="absolute top-1 right-1 size-2 rounded-full" style={{ background: C.pink }} />
              </button>

              <button type="button" className="relative p-2.5 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <Bell className="size-4" style={{ color: C.muted }} />
              </button>

              <div className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                <img src={avatarImg} alt="Avatar" className="size-7 rounded-full object-cover" style={{ border: `2px solid ${C.pink}` }} />
                <div className="hidden sm:block">
                  <p className="text-xs font-bold leading-tight" style={{ color: C.text }}>{userName}</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>Researcher</p>
                </div>
                <ChevronDown className="size-3.5 ml-1" style={{ color: C.muted }} />
              </div>
            </div>
          </header>

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* ── LIBRARY VIEW ── */}
            {view === "library" && (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {STATS.map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="rounded-2xl p-5 transition-all hover:scale-[1.02]" style={{ background: "#fff", border: `1px solid ${C.border}`, boxShadow: "0 4px 16px rgba(232,99,138,0.08)" }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "#FFE8EE" }}>
                            <Icon className="size-5" style={{ color: C.pink }} />
                          </div>
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "#FFE8EE", color: C.pink }}>▲ +12%</span>
                        </div>
                        <p className="text-2xl font-bold font-display" style={{ color: C.text }}>{s.value}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: C.muted }}>{s.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "#ccc" }}>{s.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-bold" style={{ color: C.text }}>Papers vs Videos Trend</h2>
                        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>Monthly activity</p>
                      </div>
                      <div className="flex gap-3 text-[10px]">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: C.pink }} />Papers</span>
                        <span className="flex items-center gap-1.5" style={{ color: C.muted }}><span className="size-2 rounded-full" style={{ background: C.pinkPale }} />Videos</span>
                      </div>
                    </div>
                    <MiniBarChart />
                  </div>

                  <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
                    <h2 className="text-sm font-bold mb-1" style={{ color: C.text }}>Papers by Category</h2>
                    <p className="text-[11px] mb-4" style={{ color: C.muted }}>Research distribution</p>
                    <DonutChart />
                  </div>
                </div>

                {/* Papers Table */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <h2 className="text-sm font-bold" style={{ color: C.text }}>Research Library</h2>
                    <button type="button" onClick={() => { setView("upload"); setPhase("idle"); setFiles([]); }}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #FFB6C8, #E8638A)" }}
                    >
                      <Plus className="size-3.5" /> Add Paper
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FFF8F4" }}>
                          {["Paper Title", "Category", "Figures", "Duration", "Date", "Action"].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((p, i) => (
                          <tr key={p.id} className="group transition-all hover:bg-pink-50/40"
                            style={{ borderBottom: i < filtered.length - 1 ? `1px solid #FFF0F5` : "none" }}
                          >
                            <td className="px-5 py-3.5 max-w-[200px]">
                              <p className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-pink-500 transition-colors" style={{ color: C.text }}>{p.title}</p>
                              <p className="text-[10px] mt-0.5 truncate" style={{ color: "#ccc" }}>{p.filename}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] font-bold rounded-full px-2.5 py-1" style={{ background: "#FFE8EE", color: C.pink }}>{p.category}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: C.muted }}>{p.figuresCount}</td>
                            <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: C.muted }}>{p.duration}</td>
                            <td className="px-5 py-3.5 text-xs" style={{ color: "#ccc" }}>{p.date}</td>
                            <td className="px-5 py-3.5">
                              <button type="button" onClick={() => { setSelectedPaper(p); setView("results"); }}
                                className="text-[10px] font-bold rounded-lg px-3 py-1.5 text-white transition-all hover:opacity-80"
                                style={{ background: "linear-gradient(135deg, #FFB6C8, #E8638A)" }}
                              >View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary banner */}
                <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #FFB6C8 0%, #E8638A 50%, #c94475 100%)", boxShadow: "0 8px 28px rgba(232,99,138,0.35)" }}>
                  <div>
                    <p className="text-white/70 text-xs font-semibold">This Month's Impact</p>
                    <p className="text-white text-3xl font-bold font-display mt-1">12 <span className="text-lg font-semibold text-white/70">Papers</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Total research time saved</p>
                    <p className="text-white text-2xl font-bold mt-1">38.5 hrs</p>
                  </div>
                  <TrendingUp className="size-14 text-white/20" />
                </div>
              </>
            )}

            {/* ── RESULTS VIEW ── */}
            {view === "results" && (
              <div className="space-y-4">
                <button type="button" onClick={() => setView("library")}
                  className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                  style={{ color: C.pink }}
                >← Back to Library</button>
                <Results fileName={selectedPaper.filename} onReset={() => setView("library")} />
              </div>
            )}

            {/* ── UPLOAD VIEW ── */}
            {view === "upload" && (
              <section className="max-w-4xl mx-auto space-y-4">
                <button type="button" onClick={() => setView("library")}
                  className="inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                  style={{ color: C.pink }}
                >← Back to Library</button>
                {phase === "idle" && <Uploader files={files} onFiles={setFiles} onGenerate={handleStartUpload} busy={false} />}
                {phase === "working" && <ProgressPanel progress={progress} step={0} />}
                {phase === "done" && files.length > 0 && (
                  <Results fileName={files[0].name} onReset={() => { setPhase("idle"); setFiles([]); }} />
                )}
              </section>
            )}
          </main>
        </div>

        {/* ── CHAT PANEL ──────────────────────── */}
        <div
          className="shrink-0 transition-all duration-300 overflow-hidden"
          style={{
            width: chatOpen ? 320 : 0,
            borderLeft: chatOpen ? `1px solid ${C.border}` : "none",
          }}
        >
          {chatOpen && (
            <div className="h-full w-80">
              <ChatWidget onClose={() => setChatOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
