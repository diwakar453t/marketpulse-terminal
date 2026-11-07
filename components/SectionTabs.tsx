'use client';

import React from 'react';
import { NewsCategory } from '@/lib/types';

export type ExtendedCategory = NewsCategory | 'saved';

interface SectionTabsProps {
  activeTab: ExtendedCategory;
  onTabChange: (tab: ExtendedCategory) => void;
  counts: {
    all: number;
    global: number;
    economic: number;
    market: number;
    business: number;
    saved: number;
  };
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    { id: 'all' as ExtendedCategory, label: 'All', count: counts.all },
    { id: 'global' as ExtendedCategory, label: 'Global', count: counts.global },
    { id: 'economic' as ExtendedCategory, label: 'Economic', count: counts.economic },
    { id: 'market' as ExtendedCategory, label: 'Market', count: counts.market },
    { id: 'business' as ExtendedCategory, label: 'Business', count: counts.business },
    { id: 'saved' as ExtendedCategory, label: 'Saved', count: counts.saved },
  ];

  return (
    <div className="w-full border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-sm sticky top-14 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center space-x-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {tab.count}
                </span>

                {/* Subtle active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-200 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
