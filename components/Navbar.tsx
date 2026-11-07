'use client';

import React from 'react';
import {
  RefreshCw,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Minimal Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-zinc-100">
              MARKETPULSE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-subtle-pulse" />
              LIVE
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-zinc-500">/</span>
          <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
            48h rolling window
          </span>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          {/* Next Sync Countdown */}
          <span className="hidden md:inline text-[11px] font-mono text-zinc-500 mr-1">
            sync in {formatTime(nextUpdateSeconds)}
          </span>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh news"
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors disabled:opacity-40"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-200' : ''}`}
            />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Alert sounds active' : 'Alert sounds muted'}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-zinc-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Push Notification Toggle */}
          <button
            onClick={onRequestNotifications}
            title={
              notificationsEnabled
                ? 'Desktop notifications enabled'
                : 'Enable notifications for market alerts'
            }
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4 text-emerald-400" />
            ) : (
              <BellOff className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Gemini AI Settings */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              hasCustomApiKey
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>AI Key</span>
            {hasCustomApiKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
