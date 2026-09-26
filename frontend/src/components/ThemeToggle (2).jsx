import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (isDark) {
    return (
      <label className="authkit-switch" aria-label="Switch to light mode" title="Switch to light mode">
        <input type="checkbox" checked={isDark} onChange={toggleTheme} />
        <span className="slider">
          <span className="slider-btn">
            {isDark ? <Moon size={13} /> : <Sun size={13} />}
          </span>
        </span>
      </label>
    );
  }

  return <button onClick={toggleTheme} className="rounded-full border border-stone-300 p-2.5 transition hover:border-forest hover:text-forest" aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
    {isDark ? <Sun size={17} /> : <Moon size={17} />}
  </button>;
}
