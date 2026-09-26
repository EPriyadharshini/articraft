import { Share2, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ShareButton({ title, url = window.location.href }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled or share failed, fall back to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (isDark) {
    return (
      <button type="button" onClick={handleShare} className="share-btn" aria-label="Share this product">
        <span className="share-label">Share</span>
        <span className="share-container">
          {copied ? <Check size={18} /> : <Link2 size={18} />}
          <Share2 size={18} />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 font-medium text-slate-700 hover:border-forest hover:text-forest"
      aria-label="Share this product"
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
