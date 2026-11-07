'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  AlertCircle,
  TrendingUp,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Trash2,
  Calendar,
} from 'lucide-react';
import { NewsCategory, NewsItem, MarketImpact, MarketSentiment } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { BreakingTicker } from '@/components/BreakingTicker';
import { SectionTabs } from '@/components/SectionTabs';
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

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImpact, setSelectedImpact] = useState<MarketImpact | 'ALL'>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<MarketSentiment | 'ALL'>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  // Sync Timer
  const [nextUpdateSeconds, setNextUpdateSeconds] = useState(SYNC_INTERVAL_SECONDS);

  // Audio & Notification
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Modals & Summarizer state
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Load custom Gemini API key & notification preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('market_pulse_gemini_key') || '';
      setGeminiApiKey(storedKey);

      if ('Notification' in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

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
        throw new Error(data.error || 'Failed to fetch financial intelligence');
      }

      setItems(data.items || []);
      setHighAlerts(data.highImpactAlerts || []);
      if (data.nextUpdateInSeconds) {
        setNextUpdateSeconds(data.nextUpdateInSeconds);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to market news feed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 5-hour countdown & periodic auto-sync
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

  // Request browser notifications
  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      alert('High-impact breaking market notifications are already enabled!');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification('MarketPulse Alerts Active', {
        body: 'You will receive instant alerts for major financial events.',
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Save Gemini Key
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

  // Summarize with Gemini on card click
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
        // Update local item
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

  // Compute category counts
  const sectionCounts = useMemo(() => {
    const counts = {
      all: items.length,
      global: 0,
      economic: 0,
      market: 0,
      business: 0,
    };

    items.forEach((item) => {
      if (item.category in counts) {
        counts[item.category as keyof typeof counts]++;
      }
    });

    return counts;
  }, [items]);

  // Extract distinct sources
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    items.forEach((item) => sources.add(item.source));
    return Array.from(sources).sort();
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Category Tab
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }

      // 2. Impact Filter
      if (selectedImpact !== 'ALL' && item.impactLevel !== selectedImpact) {
        return false;
      }

      // 3. Sentiment Filter
      if (selectedSentiment !== 'ALL' && item.sentiment !== selectedSentiment) {
        return false;
      }

      // 4. Source Filter
      if (selectedSource !== 'ALL' && item.source !== selectedSource) {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSnippet = item.snippet.toLowerCase().includes(query);
        const matchesSource = item.source.toLowerCase().includes(query);
        const matchesSector = item.affectedSectors.some((s) =>
          s.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSnippet && !matchesSource && !matchesSector) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, selectedImpact, selectedSentiment, selectedSource, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16]">
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

      {/* Breaking Ticker with alerts */}
      <BreakingTicker
        alerts={highAlerts}
        soundEnabled={soundEnabled}
        onSelectArticle={(item) => setSelectedArticle(item)}
      />

      {/* 4 Section Navigation Tabs */}
      <SectionTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        counts={sectionCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Retention & Update Notice Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-[#101726] border border-gray-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-200">
                48-Hour Live Market Intelligence Pipeline
              </h2>
              <p className="text-xs text-gray-400">
                Aggregated from Economic Times, Moneycontrol, Bloomberg, CNBC, Yahoo Finance, BlackRock, Zerodha, Forex Factory & more. News older than 2 days is automatically pruned.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-gray-800 text-[11px] text-gray-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Auto-refreshes every 5 hours</span>
            </div>
          </div>
        </div>

        {/* Search & Quick Filters Bar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks, indices, RBI, Fed, earnings, tariffs, deals (e.g. NIFTY, Crude, Reliance, Tech)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-emerald-500 text-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Source Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Media Sources ({availableSources.length})</option>
                {availableSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Chips (Impact & Sentiment) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>

            {/* Impact Filter Chips */}
            <button
              onClick={() => setSelectedImpact('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedImpact === 'ALL'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
            >
              All Impacts
            </button>
            <button
              onClick={() => setSelectedImpact('HIGH')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedImpact === 'HIGH'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900/40'
              }`}
            >
              🚨 High Impact Only
            </button>
            <button
              onClick={() => setSelectedImpact('MEDIUM')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedImpact === 'MEDIUM'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-900/60 hover:bg-amber-900/40'
              }`}
            >
              ⚡ Moderate Impact
            </button>

            <span className="text-gray-700">|</span>

            {/* Sentiment Filter Chips */}
            <button
              onClick={() => setSelectedSentiment('BULLISH')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedSentiment === 'BULLISH'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/40'
              }`}
            >
              🟢 Bullish
            </button>
            <button
              onClick={() => setSelectedSentiment('BEARISH')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedSentiment === 'BEARISH'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-900/60 hover:bg-rose-900/40'
              }`}
            >
              🔴 Bearish
            </button>

            {/* Reset All Filters */}
            {(selectedImpact !== 'ALL' ||
              selectedSentiment !== 'ALL' ||
              selectedSource !== 'ALL' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedImpact('ALL');
                  setSelectedSentiment('ALL');
                  setSelectedSource('ALL');
                  setSearchQuery('');
                }}
                className="ml-auto text-xs text-gray-400 hover:text-white underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchNews(true)}
              className="underline hover:text-white ml-2 flex-shrink-0"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-6 bg-gray-800 rounded w-5/6" />
                  <div className="h-4 bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-800 rounded w-4/6" />
                </div>
                <div className="h-8 bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* News Cards Grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onOpenSummary={(it) => setSelectedArticle(it)}
                onQuickSummarize={handleQuickSummarize}
                isSummarizing={summarizingId === item.id}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl bg-gray-900/30 border border-gray-800/60">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-300">
              No matching financial stories found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, impact filters, or switch to another section tab.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedImpact('ALL');
                setSelectedSentiment('ALL');
                setSelectedSource('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-800 bg-[#070B12] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-400">MarketPulse Terminal</span>
            <span>• Verified Share Market Aggregator</span>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>
              Auto-purges news &gt; 48 hours old • Updates every 5-6 hours • High-Impact Alerts
            </p>
            <p className="text-[11px] text-gray-600">
              Sources: Economic Times, Moneycontrol, Hindustan Times, BBC, Zee News, Bloomberg, CNBC, Yahoo Finance, BlackRock, Zerodha, Forex Factory & Google News.
            </p>
          </div>
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
