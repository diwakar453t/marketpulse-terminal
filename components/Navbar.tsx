'use client';

import React from 'react';
import {
  RefreshCw,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Key,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  nextUpdateSeconds: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notificationsEnabled: boolean;
  onRequestNotifications: () => void;
  onOpenSettings: () => void;
  hasCustomApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  isRefreshing,
  nextUpdateSeconds,
  soundEnabled,
  onToggleSound,
  notificationsEnabled,
  onRequestNotifications,
  onOpenSettings,
  hasCustomApiKey,
}) => {
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-emerald-400 bg-clip-text text-transparent">
                MarketPulse
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                LIVE TERMINAL
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Share Market Intelligence • 2-Day Rolling Window
            </p>
          </div>
        </div>

        {/* Status & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync Timer */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Next auto-sync:</span>
            <span className="font-mono text-gray-200 font-medium">
              {formatTime(nextUpdateSeconds)}
            </span>
          </div>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh news feeds now"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-xs font-medium text-gray-200 border border-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Syncing...' : 'Sync Now'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Push Notifications Toggle */}
          <button
            onClick={onRequestNotifications}
            title={
              notificationsEnabled
                ? 'Push notifications enabled'
                : 'Enable browser notifications for high financial alerts'
            }
            className={`p-2 rounded-lg border transition-all ${
              notificationsEnabled
                ? 'bg-blue-950/40 border-blue-800 text-blue-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          {/* Gemini API Key Settings */}
          <button
            onClick={onOpenSettings}
            title="Configure Gemini AI Summarizer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
              hasCustomApiKey
                ? 'bg-purple-950/50 border-purple-700 text-purple-300 hover:bg-purple-900/50'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Gemini AI</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

