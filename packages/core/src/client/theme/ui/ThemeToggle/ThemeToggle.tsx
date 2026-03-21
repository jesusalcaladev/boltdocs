import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
