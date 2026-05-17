import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "لائٹ موڈ آن کریں" : "ڈارک موڈ آن کریں"}
      title={theme === "dark" ? "لائٹ موڈ" : "ڈارک موڈ"}
      className="fixed top-3 left-3 z-50 inline-flex items-center justify-center min-h-10 min-w-10 px-3 rounded-full border border-border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors"
      style={{ fontFamily: "system-ui" }}
    >
      <span className="text-base leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}