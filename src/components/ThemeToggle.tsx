import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("paper_pal_theme") as "light" | "dark" | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolved = stored ?? preferred;
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      localStorage.setItem("paper_pal_theme", next);
    }
  };

  return { theme, toggle };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark/light theme"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="inline-flex items-center justify-center size-9 rounded-xl border border-border bg-surface text-foreground transition-all hover:bg-muted hover:border-accent hover:text-accent hover:scale-105 active:scale-95 shadow-sm"
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
