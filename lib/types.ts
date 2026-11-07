export type NewsCategory = 'all' | 'global' | 'economic' | 'market' | 'business';

export type MarketImpact = 'HIGH' | 'MEDIUM' | 'LOW';

export type MarketSentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string; // ISO string
  timestamp: number; // Unix ms
  category: 'global' | 'economic' | 'market' | 'business';
  snippet: string;
  aiSummary?: {
    overview: string;
    marketImpact: string;
    affectedSectors: string[];
    sentiment: MarketSentiment;
    impactLevel: MarketImpact;
  };
  sentiment: MarketSentiment;
  impactLevel: MarketImpact;
  affectedSectors: string[];
  isBreakingAlert?: boolean;
}

export interface NewsResponse {
  success: boolean;
  count: number;
  lastUpdated: string;
  nextUpdateInSeconds: number;
  items: NewsItem[];
  highImpactAlerts: NewsItem[];
}
