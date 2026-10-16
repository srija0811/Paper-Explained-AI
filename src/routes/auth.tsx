import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Sparkles,
  BookOpen,
  FileVideo,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In / Sign Up — Paper Explained AI" },
      { name: "description", content: "Access your saved paper explainers and custom AI summaries." },
    ],
  }),
  component: AuthPage,
});

const FEATURES = [
  { icon: BookOpen, text: "Upload any research PDF instantly" },
  { icon: BrainCircuit, text: "AI-powered summaries in seconds" },
  { icon: FileVideo, text: "Auto-generated explainer videos" },
  { icon: CheckCircle2, text: "Download & share with anyone" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && password !== confirm) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("paper_pal_auth", "true");
          localStorage.setItem("paper_pal_user", name || email.split("@")[0] || "Researcher");
        }
        navigate({ to: "/" });
      }, 600);
    }, 1200);
  };

  const handleSocialAuth = (provider: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("paper_pal_auth", "true");
      localStorage.setItem("paper_pal_user", `${provider} User`);
    }
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── LEFT PANEL: Branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] shrink-0 relative overflow-hidden p-10 xl:p-14"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)/0.95) 0%, hsl(var(--accent)/0.85) 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={logoImg}
            alt="Paper Explained AI"
            className="size-11 rounded-2xl shadow-xl object-cover border-2 border-white/30"
          />
          <span className="font-display text-xl font-bold text-white tracking-tight">Paper Explained AI</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-bold text-white/90 border border-white/20">
              <Sparkles className="size-3.5" />
              AI-Powered Research Tool
            </div>
            <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight">
              Turn dense papers
              <br />
              <span className="text-white/70">into clear stories.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-xs">
              Upload a PDF and get an AI summary, extracted figures, narration and a shareable explainer video — in minutes.
            </p>
          </div>

          {/* Feature List */}
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80 text-sm font-medium">
                <span className="flex items-center justify-center size-7 rounded-lg bg-white/15 border border-white/20 shrink-0">
                  <Icon className="size-3.5 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="text-white/50 text-xs italic leading-relaxed border-l-2 border-white/20 pl-4">
            "Paper Explained AI helped me understand transformer architectures in 10 minutes instead of 10 hours."
          </blockquote>
          <p className="mt-2 text-white/40 text-xs pl-4">— PhD Researcher, IIT Hyderabad</p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="flex-1 flex flex-col relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border lg:border-none">
          <Link to="/" className="lg:hidden flex items-center gap-2 group">
            <img src={logoImg} alt="Logo" className="size-8 rounded-xl object-cover" />
            <span className="font-display text-sm font-bold">Paper Explained AI</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-accent/40"
            >
              <ArrowLeft className="size-3.5" /> Back to Home
            </Link>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* Mode Tabs */}
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                {mode === "signin" ? "Welcome back 👋" : "Join for free ✨"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to access your paper dashboard."
                  : "Create your account and start exploring."}
              </p>
            </div>

            {/* Toggle */}
            <div className="flex rounded-2xl border border-border bg-muted p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode("signin"); setSuccess(false); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setSuccess(false); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleSocialAuth("Google")}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-accent/40 hover:shadow-sm"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth("GitHub")}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-accent/40 hover:shadow-sm"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or with email</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="alex@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="••••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`w-full rounded-xl border bg-surface pl-10 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                        confirm && confirm !== password
                          ? "border-red-400 focus:ring-red-400/20"
                          : "border-border focus:border-accent focus:ring-accent/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">Passwords do not match.</p>
                  )}
                </div>
              )}

              {/* Extra options */}
              {mode === "signin" ? (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    <input type="checkbox" className="rounded border-border accent-[hsl(var(--accent))]" />
                    Remember me
                  </label>
                  <a href="#" className="font-semibold text-accent hover:underline">
                    Forgot password?
                  </a>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" required className="mt-0.5 accent-[hsl(var(--accent))]" />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="text-accent underline font-medium">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-accent underline font-medium">Privacy Policy</a>.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success || (mode === "signup" && confirm !== "" && confirm !== password)}
                className="w-full mt-2 relative overflow-hidden rounded-xl bg-gradient-brand px-6 py-3.5 font-display font-bold text-primary-foreground shadow-lg glow-ring transition-all hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {success ? (
                  <span className="inline-flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="size-5" />
                    Success! Redirecting...
                  </span>
                ) : loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : mode === "signin" ? (
                  "Sign In →"
                ) : (
                  "Create Free Account →"
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setSuccess(false); }}
                className="font-bold text-accent hover:underline"
              >
                {mode === "signin" ? "Create one →" : "Sign in →"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center text-xs text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} Paper Explained AI — Research, made watchable.
        </div>
      </div>
    </div>
  );
}
