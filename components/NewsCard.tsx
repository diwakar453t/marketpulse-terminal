'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NewsItem, MarketImpact, MarketSentiment } from '@/lib/types';

interface NewsCardProps {
  item: NewsItem;
  onOpenSummary: (item: NewsItem) => void;
  onQuickSummarize: (item: NewsItem) => Promise<void>;
  isSummarizing: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  onOpenSummary,
  onQuickSummarize,
  isSummarizing,
}) => {
  const [expandedSummary, setExpandedSummary] = useState(false);

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(diffMs / (60 * 60 * 1000));

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderSentiment = (sentiment: MarketSentiment) => {
    switch (sentiment) {
      case 'BULLISH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            BULLISH
          </span>
        );
      case 'BEARISH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/60">
            <TrendingDown className="w-3 h-3 text-red-400" />
            BEARISH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-300 border border-gray-700">
            <Minus className="w-3 h-3 text-gray-400" />
            NEUTRAL
          </span>
        );
    }
  };

  const renderImpact = (impact: MarketImpact) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-600/50">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            HIGH IMPACT
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/20 text-amber-300 border border-amber-600/40">
            MODERATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-900 text-gray-400 border border-gray-800">
            STANDARD
          </span>
        );
    }
  };

  return (
    <article className="group relative rounded-2xl bg-[#111624] border border-gray-800/90 hover:border-gray-700 p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40">
      <div>
        {/* Top Meta: Source + Time + Impact + Sentiment */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-800 text-gray-200 border border-gray-700">
              {item.source}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 font-mono">
              <Clock className="w-3 h-3 text-gray-500" />
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {renderImpact(item.impactLevel)}
            {renderSentiment(item.sentiment)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug mb-2.5">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {item.title}
          </a>
        </h3>

        {/* Snippet */}
        <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4">
          {item.snippet}
        </p>

        {/* Sectors affected */}
        {item.affectedSectors && item.affectedSectors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              Sectors:
            </span>
            {item.affectedSectors.map((sector, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-900 text-gray-300 border border-gray-800"
              >
                {sector}
              </span>
            ))}
          </div>
        )}

        {/* AI Summary Accordion (if generated) */}
        {item.aiSummary && (
          <div className="mt-2 mb-4 p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs">
            <div className="flex items-center justify-between font-semibold text-purple-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Gemini Market Impact Takeaway
              </span>
              <button
                onClick={() => setExpandedSummary(!expandedSummary)}
                className="text-purple-400 hover:text-purple-200"
              >
                {expandedSummary ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-gray-300 font-medium leading-relaxed">
              {item.aiSummary.overview}
            </p>
            {expandedSummary && (
              <div className="mt-2.5 pt-2.5 border-t border-purple-900/40 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    Share Market Impact:
                  </span>
                  <p className="text-gray-300 text-xs">
                    {item.aiSummary.marketImpact}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions: AI Summarize + Verify Source Link */}
      <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2 mt-2">
        {/* Gemini AI Summarize Button */}
        <button
          onClick={() => {
            if (item.aiSummary) {
              onOpenSummary(item);
            } else {
              onQuickSummarize(item);
            }
          }}
          disabled={isSummarizing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 transition-all active:scale-95 disabled:opacity-60"
        >
          <Sparkles
            className={`w-3.5 h-3.5 text-purple-400 ${
              isSummarizing ? 'animate-spin' : ''
            }`}
          />
          <span>
            {item.aiSummary
              ? 'View AI Breakdown'
              : isSummarizing
              ? 'Summarizing...'
              : 'AI Summary'}
          </span>
        </button>

        {/* VERIFICATION SOURCE LINK (Critical User Requirement) */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`Verify authentic report directly on ${item.source}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 border border-emerald-800/60 transition-all active:scale-95 group/link"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verify Source</span>
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </article>
  );
};
