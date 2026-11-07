'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ExternalLink, Zap, X } from 'lucide-react';
import { NewsItem } from '@/lib/types';

interface BreakingTickerProps {
  alerts: NewsItem[];
  soundEnabled: boolean;
  onSelectArticle: (item: NewsItem) => void;
  onDismissAlert?: (id: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  alerts,
  soundEnabled,
  onSelectArticle,
  onDismissAlert,
}) => {
  const alertedIdsRef = useRef<Set<string>>(new Set());

  // Web Audio API chime generator (works in any browser without assets)
  const playAlertChime = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext could be blocked if user has not interacted with page yet
    }
  };

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;

    let hasNewAlert = false;
    alerts.forEach((alert) => {
      if (!alertedIdsRef.current.has(alert.id)) {
        alertedIdsRef.current.add(alert.id);
        hasNewAlert = true;

        // If browser notifications are permitted, send one!
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification('🚨 Market Alert: Major Financial Event', {
              body: `${alert.title} (${alert.source})`,
              icon: '/favicon.ico',
            });
          } catch (e) {
            console.error('Notification error', e);
          }
        }
      }
    });

    if (hasNewAlert && soundEnabled) {
      playAlertChime();
    }
  }, [alerts, soundEnabled]);

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-950/80 via-rose-950/70 to-red-950/80 border-b border-red-800/80 py-2.5 px-4 shadow-lg shadow-red-950/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-black tracking-wide uppercase animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            MARKET ALERT
          </span>
          <span className="text-xs text-red-300 hidden md:inline">
            High Impact Event:
          </span>
        </div>

        {/* Carousel / Ticker items */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectArticle(alert)}
              className="flex items-center gap-2 cursor-pointer group bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-lg border border-red-900/40 transition-all flex-shrink-0 max-w-lg"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-red-100 group-hover:text-white font-medium truncate">
                {alert.title}
              </span>
              <span className="text-[10px] text-red-400 font-mono flex-shrink-0">
                • {alert.source}
              </span>
              <ExternalLink className="w-3 h-3 text-red-400 opacity-60 group-hover:opacity-100 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
