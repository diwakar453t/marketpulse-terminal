'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NewsCategory, NewsItem, MarketImpact, MarketSentiment } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { BreakingTicker } from '@/components/BreakingTicker';
import { SectionTabs, ExtendedCategory } from '@/components/SectionTabs';
import { NewsCard } from '@/components/NewsCard';
import { SummaryModal } from '@/components/SummaryModal';
import { SettingsModal } from '@/components/SettingsModal';

const SYNC_INTERVAL_SECONDS = 5 * 60 * 60; // 5 hours

export default function Home() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [highAlerts, setHighAlerts] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<ExtendedCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImpact, setSelectedImpact] = useState<MarketImpact | 'ALL'>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<MarketSentiment | 'ALL'>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  // Bookmarks (saved articles)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Sync Timer
  const [nextUpdateSeconds, setNextUpdateSeconds] = useState(SYNC_INTERVAL_SECONDS);

  // Audio & Notification
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Modals & Summarizer
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('market_pulse_gemini_key') || '';
      setGeminiApiKey(storedKey);

      try {
        const storedBookmarks = localStorage.getItem('market_pulse_bookmarks');
        if (storedBookmarks) {
          setBookmarkedIds(new Set(JSON.parse(storedBookmarks)));
        }
      } catch {
        // ignore parse error
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  // Toggle bookmark
  const handleToggleBookmark = (item: NewsItem) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('market_pulse_bookmarks', JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Fetch news data
  const fetchNews = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const url = `/api/news${isManualRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch financial news');
      }

      setItems(data.items || []);
      setHighAlerts(data.highImpactAlerts || []);
      if (data.nextUpdateInSeconds) {
        setNextUpdateSeconds(data.nextUpdateInSeconds);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to market feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 5-hour countdown & auto-sync
  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdateSeconds((prev) => {
        if (prev <= 1) {
          fetchNews(true);
          return SYNC_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchNews]);

  // Push notifications
  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      alert('Alert notifications are active.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification('MarketPulse', {
        body: 'Alerts enabled for high-impact financial events.',
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('market_pulse_gemini_key', key);
      } else {
        localStorage.removeItem('market_pulse_gemini_key');
      }
    }
  };

  // Summarize with Gemini
  const handleQuickSummarize = async (item: NewsItem) => {
    try {
      setSummarizingId(item.id);
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          snippet: item.snippet,
          source: item.source,
          apiKey: geminiApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        const updatedItem = {
          ...item,
          aiSummary: data.summary,
          sentiment: data.summary.sentiment,
          impactLevel: data.summary.impactLevel,
          affectedSectors: data.summary.affectedSectors || item.affectedSectors,
        };

        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? updatedItem : i))
        );

        setSelectedArticle(updatedItem);
      }
    } catch (err) {
      console.error('Failed to summarize item', err);
    } finally {
      setSummarizingId(null);
    }
  };

  // Category counts
  const sectionCounts = useMemo(() => {
    const counts = {
      all: items.length,
      global: 0,
      economic: 0,
      market: 0,
      business: 0,
      saved: 0,
    };

    items.forEach((item) => {
      if (item.category in counts) {
        counts[item.category as keyof typeof counts]++;
      }
      if (bookmarkedIds.has(item.id)) {
        counts.saved++;
      }
    });

    return counts;
  }, [items, bookmarkedIds]);

  // Distinct sources
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    items.forEach((item) => sources.add(item.source));
    return Array.from(sources).sort();
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Saved tab
      if (activeTab === 'saved') {
        if (!bookmarkedIds.has(item.id)) return false;
      } else if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }

      if (selectedImpact !== 'ALL' && item.impactLevel !== selectedImpact) {
        return false;
      }

      if (selectedSentiment !== 'ALL' && item.sentiment !== selectedSentiment) {
        return false;
      }

      if (selectedSource !== 'ALL' && item.source !== selectedSource) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSnippet = item.snippet.toLowerCase().includes(q);
        const matchesSource = item.source.toLowerCase().includes(q);
        const matchesSector = item.affectedSectors.some((s) =>
          s.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesSnippet && !matchesSource && !matchesSector) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, selectedImpact, selectedSentiment, selectedSource, searchQuery, bookmarkedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-zinc-800">
      {/* Top Navbar */}
      <Navbar
        onRefresh={() => fetchNews(true)}
        isRefreshing={isRefreshing}
        nextUpdateSeconds={nextUpdateSeconds}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        notificationsEnabled={notificationsEnabled}
        onRequestNotifications={handleRequestNotifications}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasCustomApiKey={!!geminiApiKey}
      />

      {/* Subtle Breaking Alerts */}
      <BreakingTicker
        alerts={highAlerts}
        soundEnabled={soundEnabled}
        onSelectArticle={(item) => setSelectedArticle(item)}
      />

      {/* Minimal Section Tabs */}
      <SectionTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        counts={sectionCounts}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Minimal Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter headlines, companies, tickers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-900/70 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Minimal Filter Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setSelectedImpact(selectedImpact === 'HIGH' ? 'ALL' : 'HIGH')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                selectedImpact === 'HIGH'
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              High Impact
            </button>

            <button
              onClick={() => setSelectedSentiment(selectedSentiment === 'BULLISH' ? 'ALL' : 'BULLISH')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                selectedSentiment === 'BULLISH'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bullish
            </button>

            <button
              onClick={() => setSelectedSentiment(selectedSentiment === 'BEARISH' ? 'ALL' : 'BEARISH')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                selectedSentiment === 'BEARISH'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bearish
            </button>

            {/* Source select */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-xs focus:outline-none focus:border-zinc-700"
            >
              <option value="ALL">All Sources</option>
              {availableSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-zinc-900 border border-rose-900/40 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchNews(true)} className="underline hover:text-white">
              Retry
            </button>
          </div>
        )}

        {/* Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse p-4 space-y-3"
              >
                <div className="h-3 bg-zinc-800/80 rounded w-1/3" />
                <div className="h-5 bg-zinc-800/80 rounded w-5/6" />
                <div className="h-3 bg-zinc-800/60 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Minimal News Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onOpenSummary={(it) => setSelectedArticle(it)}
                onQuickSummarize={handleQuickSummarize}
                isSummarizing={summarizingId === item.id}
                isBookmarked={bookmarkedIds.has(item.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20 px-4">
            <p className="text-xs text-zinc-500">
              No matching news in this category.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedImpact('ALL');
                setSelectedSentiment('ALL');
                setSelectedSource('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-zinc-400 hover:text-zinc-200 underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="mt-16 border-t border-zinc-800/60 py-6 text-[11px] text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MarketPulse • 48h rolling financial intelligence</span>
          <span>Economic Times, Moneycontrol, Bloomberg, CNBC, Yahoo, Zerodha & more</span>
        </div>
      </footer>

      {/* Modals */}
      <SummaryModal
        item={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={geminiApiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
