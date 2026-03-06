import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mount, read from localStorage or matchMedia
    const stored = localStorage.getItem("boltdocs-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Listen to system changes if no localStorage is set
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("boltdocs-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
      root.dataset.theme = "light";
    } else {
      root.classList.remove("theme-light");
      root.dataset.theme = "dark";
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("boltdocs-theme", newTheme);
  };

  // Prevent hydration mismatch by rendering a placeholder with same layout
  if (!mounted) {
    return (
      <button className="navbar-icon-btn" aria-label="Toggle theme" disabled>
        <span style={{ width: 20, height: 20, display: "inline-block" }}></span>
      </button>
    );
  }

  return (
    <button
      className="navbar-icon-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
