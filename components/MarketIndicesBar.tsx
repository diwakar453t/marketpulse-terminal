'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Coins,
  DollarSign,
  Fuel,
} from 'lucide-react';

interface IndexTickerItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const MARKET_BENCHMARKS: IndexTickerItem[] = [
  { symbol: 'NIFTY 50', name: 'NSE India', value: '24,360.50', change: '+0.45%', isPositive: true },
  { symbol: 'SENSEX', name: 'BSE India', value: '80,120.25', change: '+0.38%', isPositive: true },
  { symbol: 'DOW JONES', name: 'US', value: '43,729.93', change: '+0.59%', isPositive: true },
  { symbol: 'NASDAQ', name: 'US Tech', value: '19,269.46', change: '+0.09%', isPositive: true },
  { symbol: 'BRENT CRUDE', name: 'Commodities', value: '$74.15', change: '-1.25%', isPositive: false },
  { symbol: 'GOLD', name: 'Precious Metals', value: '$2,710.80', change: '-0.32%', isPositive: false },
  { symbol: 'USD/INR', name: 'Forex', value: '84.37', change: '+0.05%', isPositive: true },
  { symbol: '10Y TREASURY', name: 'US Yield', value: '4.44%', change: '+0.02%', isPositive: true },
];

export const MarketIndicesBar: React.FC = () => {
  return (
    <div className="w-full bg-[#070B12] border-b border-gray-800/80 py-1.5 px-4 overflow-x-auto no-scrollbar text-[11px]">
      <div className="max-w-7xl mx-auto flex items-center gap-6 justify-between min-w-max">
        <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          BENCHMARKS:
        </div>

        <div className="flex items-center gap-6">
          {MARKET_BENCHMARKS.map((idx) => (
            <div key={idx.symbol} className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">{idx.symbol}</span>
              <span className="text-gray-200 font-mono font-semibold">{idx.value}</span>
              <span
                className={`flex items-center gap-0.5 font-mono font-semibold ${
                  idx.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {idx.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {idx.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

