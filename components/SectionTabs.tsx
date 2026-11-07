'use client';

import React from 'react';
import { Globe, BarChart3, TrendingUp, Briefcase, Layers } from 'lucide-react';
import { NewsCategory } from '@/lib/types';

interface SectionTabsProps {
  activeTab: NewsCategory;
  onTabChange: (tab: NewsCategory) => void;
  counts: {
    all: number;
    global: number;
    economic: number;
    market: number;
    business: number;
  };
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    {
      id: 'all' as NewsCategory,
      label: 'All News',
      icon: Layers,
      count: counts.all,
      color: 'text-gray-400',
    },
    {
      id: 'global' as NewsCategory,
      label: 'Global News',
      icon: Globe,
      count: counts.global,
      color: 'text-blue-400',
    },
    {
      id: 'economic' as NewsCategory,
      label: 'Economic News',
      icon: BarChart3,
      count: counts.economic,
      color: 'text-amber-400',
    },
    {
      id: 'market' as NewsCategory,
      label: 'Market News',
      icon: TrendingUp,
      count: counts.market,
      color: 'text-emerald-400',
    },
    {
      id: 'business' as NewsCategory,
      label: 'Business News',
      icon: Briefcase,
      count: counts.business,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="w-full border-b border-gray-800 bg-[#0B0F19]/60 backdrop-blur-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-white border border-emerald-500/50 shadow-md shadow-emerald-950/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-emerald-400' : tab.color}`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
