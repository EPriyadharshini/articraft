import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`group relative flex h-8 w-8 shrink-0 items-center justify-center
        overflow-hidden rounded-full border transition-all duration-300
        hover:scale-110 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
        ${
          isDark
            ? "border-blue-400/30 bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-950 text-blue-300 shadow-lg shadow-blue-500/20 hover:border-blue-300/60 hover:shadow-blue-500/40"
            : "border-forest-300/70 bg-gradient-to-br text-green-700 shadow-lg shadow-green-400/20 hover:border-green-400 hover:shadow-green-400/40"
        }`}
    >
      {/* Soft glowing orb */}
      <span
        className={`absolute inset-2 rounded-full blur-md transition-colors duration-300 ${
          isDark ? "bg-blue-500/30" : "bg-green-400/50"
        }`}
      />

      {/* Main icon */}
      <span className="relative z-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
        {isDark ? (
          <Moon size={20} strokeWidth={1.8} />
        ) : (
          <Sun size={21} strokeWidth={1.8} />
        )}
      </span>

      
    </button>
  );
}
