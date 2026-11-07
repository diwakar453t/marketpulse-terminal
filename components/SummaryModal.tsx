'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Share2,
} from 'lucide-react';
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
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(item.link);
      alert('Source URL copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#0D121F] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#111827]/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-900/50 text-purple-400 border border-purple-700/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-200">
                Gemini AI Financial Intelligence Breakdown
              </h2>
              <p className="text-[11px] text-gray-400">
                No noise • Market impact extracted • Direct source verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Article Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                {item.source}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white leading-snug">
              {item.title}
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-900/80 border border-gray-800">
            <div>
              <span className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Market Sentiment
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {item.sentiment === 'BULLISH' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Bullish 🟢
                  </span>
                )}
                {item.sentiment === 'BEARISH' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Bearish 🔴
                  </span>
                )}
                {item.sentiment === 'NEUTRAL' && (
                  <span className="text-gray-300 flex items-center gap-1">
                    <Minus className="w-3.5 h-3.5" /> Neutral ⚪
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Impact Level
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {item.impactLevel === 'HIGH' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Impact 🚨
                  </span>
                )}
                {item.impactLevel === 'MEDIUM' && (
                  <span className="text-amber-300">Moderate ⚡</span>
                )}
                {item.impactLevel === 'LOW' && (
                  <span className="text-gray-400">Standard ℹ️</span>
                )}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Sector Exposure
              </span>
              <span className="text-xs font-semibold text-gray-300">
                {item.affectedSectors.join(', ') || 'Broad Equities'}
              </span>
            </div>
          </div>

          {/* Core Fact Summary */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Executive Key Takeaway (Zero Fluff)
            </h4>
            <p className="text-gray-200 leading-relaxed font-normal">
              {summary?.overview || item.snippet}
            </p>
          </div>

          {/* Share Market Impact */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/50">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Specific Share Market & Stock Impact
            </h4>
            <p className="text-gray-200 leading-relaxed font-normal">
              {summary?.marketImpact ||
                'Traders should monitor index volatility, sector rotation, and foreign institutional investor (FII/DII) flows.'}
            </p>
          </div>
        </div>

        {/* Modal Footer with Verification Link */}
        <div className="px-6 py-4 border-t border-gray-800 bg-[#111827]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify this story directly at source:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Share or copy URL"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Direct Verification Link button */}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all"
            >
              <span>Verify on {item.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

