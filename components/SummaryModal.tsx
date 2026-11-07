'use client';

import React from 'react';
import { X, ExternalLink, Sparkles, Share2 } from 'lucide-react';
import { NewsItem } from '@/lib/types';

interface SummaryModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const summary = item.aiSummary;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: summary?.overview || item.snippet,
          url: item.link,
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(item.link);
      alert('Source URL copied to clipboard');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#111115] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>AI Executive Briefing</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <div className="text-[11px] font-mono text-zinc-500 mb-1">
              {item.source} • {new Date(item.timestamp).toLocaleDateString()}
            </div>
            <h2 className="text-base font-semibold text-zinc-100 leading-snug">
              {item.title}
            </h2>
          </div>

          {/* Core Fact Summary */}
          <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Core Summary
            </span>
            <p className="text-zinc-200 leading-relaxed text-xs">
              {summary?.overview || item.snippet}
            </p>
          </div>

          {/* Market Impact */}
          <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Share Market Impact
            </span>
            <p className="text-zinc-200 leading-relaxed text-xs">
              {summary?.marketImpact ||
                'Impact concentrated on index weights and trading sentiment.'}
            </p>
          </div>

          {/* Meta breakdown */}
          <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-400 font-mono">
            <div>
              <span className="text-zinc-500 block">Sentiment:</span>
              <span className="text-zinc-200 font-semibold">{item.sentiment}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Sectors:</span>
              <span className="text-zinc-200 font-semibold">
                {item.affectedSectors.join(', ') || 'General Equities'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between text-xs">
          <button
            onClick={handleShare}
            className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>

          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white font-medium transition-colors"
          >
            <span>Verify on {item.source}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
