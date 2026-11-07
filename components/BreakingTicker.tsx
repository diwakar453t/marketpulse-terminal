'use client';

import React, { useEffect, useRef } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { NewsItem } from '@/lib/types';

interface BreakingTickerProps {
  alerts: NewsItem[];
  soundEnabled: boolean;
  onSelectArticle: (item: NewsItem) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  alerts,
  soundEnabled,
  onSelectArticle,
}) => {
  const alertedIdsRef = useRef<Set<string>>(new Set());

  const playAlertChime = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext could be blocked if user has not interacted
    }
  };

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;

    let hasNewAlert = false;
    alerts.forEach((alert) => {
      if (!alertedIdsRef.current.has(alert.id)) {
        alertedIdsRef.current.add(alert.id);
        hasNewAlert = true;

        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification('Market Event', {
              body: `${alert.title} • ${alert.source}`,
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
    <div className="w-full bg-zinc-900/60 border-b border-zinc-800/80 py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-semibold text-rose-400 uppercase tracking-wider text-[10px]">
            Alert
          </span>
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onSelectArticle(alert)}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors truncate max-w-xl group text-left"
            >
              <span className="truncate">{alert.title}</span>
              <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                {alert.source}
              </span>
              <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
