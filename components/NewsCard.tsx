'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { NewsItem, MarketImpact, MarketSentiment } from '@/lib/types';

interface NewsCardProps {
  item: NewsItem;
  onOpenSummary: (item: NewsItem) => void;
  onQuickSummarize: (item: NewsItem) => Promise<void>;
  isSummarizing: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  onOpenSummary,
  onQuickSummarize,
  isSummarizing,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [expandedSummary, setExpandedSummary] = useState(false);

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(diffMs / (60 * 60 * 1000));

    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getSentimentTag = (sentiment: MarketSentiment) => {
    switch (sentiment) {
      case 'BULLISH':
        return <span className="text-emerald-400 font-mono text-[11px] font-medium">• Bullish</span>;
      case 'BEARISH':
        return <span className="text-rose-400 font-mono text-[11px] font-medium">• Bearish</span>;
      default:
        return null;
    }
  };

  return (
    <article className="group rounded-xl bg-[#111115] border border-zinc-800/80 hover:border-zinc-700/80 p-5 flex flex-col justify-between transition-colors">
      <div>
        {/* Minimal Meta Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-zinc-400 truncate">
              {item.source}
            </span>
            <span>•</span>
            <span className="font-mono text-[11px]">
              {formatRelativeTime(item.timestamp)}
            </span>
            {getSentimentTag(item.sentiment)}
            {item.impactLevel === 'HIGH' && (
              <span className="text-amber-400 font-mono text-[11px] font-semibold">
                • High Impact
              </span>
            )}
          </div>

          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(item)}
              title={isBookmarked ? 'Remove saved' : 'Save article'}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-zinc-200" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Clean Headline */}
        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-zinc-200 leading-snug mb-2">
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
        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
          {item.snippet}
        </p>

        {/* Minimal AI Summary Accordion */}
        {item.aiSummary && (
          <div className="mb-4 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between text-zinc-300 font-medium mb-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                <Sparkles className="w-3 h-3 text-zinc-400" />
                AI Market Summary
              </span>
              <button
                onClick={() => setExpandedSummary(!expandedSummary)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {expandedSummary ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {item.aiSummary.overview}
            </p>
            {expandedSummary && (
              <div className="mt-2 pt-2 border-t border-zinc-800/80 text-xs space-y-1 text-zinc-400">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                  Impact on Equities:
                </span>
                <p className="text-zinc-300">{item.aiSummary.marketImpact}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Minimal Footer Actions */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
        <button
          onClick={() => {
            if (item.aiSummary) {
              onOpenSummary(item);
            } else {
              onQuickSummarize(item);
            }
          }}
          disabled={isSummarizing}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40 font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {item.aiSummary
              ? 'View Summary'
              : isSummarizing
              ? 'Summarizing...'
              : 'Summarize'}
          </span>
        </button>

        {/* VERIFICATION SOURCE LINK */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors font-medium group/link"
        >
          <span>Verify Source</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100" />
        </a>
      </div>
    </article>
  );
};
