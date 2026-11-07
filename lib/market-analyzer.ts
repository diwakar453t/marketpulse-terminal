import { MarketImpact, MarketSentiment } from './types';

const HIGH_IMPACT_KEYWORDS = [
  'crash', 'plunge', 'plunges', 'surge', 'surges', 'rally', 'rallies',
  'rate cut', 'rate hike', 'fed decision', 'rbi policy', 'interest rate',
  'inflation jump', 'all-time high', 'record high', 'tariff', 'tariffs',
  'sanctions', 'war', 'ceasefire', 'recession', 'default', 'bailout',
  'emergency meeting', 'crypto crash', 'black swan', 'quarterly results beat',
  'guidance cut', 'margin call', 'bear market', 'bull run'
];

const MEDIUM_IMPACT_KEYWORDS = [
  'earnings', 'revenue', 'profit', 'dividend', 'deal', 'merger',
  'acquisition', 'stake sale', 'ipo', 'listing', 'guidance', 'downgrade',
  'upgrade', 'target price', 'crude oil', 'gold price', 'rupee', 'dollar index',
  'fii selling', 'dii buying', 'sebi', 'sec investigation'
];

const BULLISH_KEYWORDS = [
  'surge', 'surges', 'rally', 'rallies', 'jump', 'jumps', 'gain', 'gains',
  'record high', 'profit surges', 'beat estimates', 'growth', 'upward',
  'dividend hike', 'outperform', 'upgrade', 'bullish', 'expansion',
  'recovery', 'strong earnings', 'buyback', 'rate cut expected'
];

const BEARISH_KEYWORDS = [
  'plunge', 'plunges', 'crash', 'slump', 'drop', 'drops', 'fall', 'falls',
  'slide', 'slides', 'loss', 'losses', 'miss estimates', 'downgrade',
  'warning', 'inflation spike', 'rate hike', 'sell-off', 'deficit',
  'layoffs', 'default', 'recession', 'bearish', 'weak forecast', 'fined'
];

const SECTOR_MAPPINGS: { sector: string; keywords: string[] }[] = [
  {
    sector: 'Banking & NBFCs',
    keywords: ['bank', 'banking', 'rbi', 'fed', 'interest rate', 'loan', 'credit', 'hdfc', 'sbi', 'icici', 'axis', 'nbfc', 'repo rate', 'npa']
  },
  {
    sector: 'IT & Technology',
    keywords: ['it', 'tech', 'software', 'ai', 'artificial intelligence', 'cloud', 'chip', 'semiconductor', 'tcs', 'infosys', 'wipro', 'nvidia', 'apple', 'google', 'microsoft']
  },
  {
    sector: 'Energy & Oil',
    keywords: ['crude', 'oil', 'petroleum', 'brent', 'opec', 'refinery', 'reliance', 'ongc', 'gas', 'natural gas', 'green energy', 'renewable']
  },
  {
    sector: 'Automotive & EVs',
    keywords: ['auto', 'automobile', 'car', 'ev', 'electric vehicle', 'maruti', 'tata motors', 'mahindra', 'tesla', 'sales numbers']
  },
  {
    sector: 'Pharma & Healthcare',
    keywords: ['pharma', 'drug', 'fda', 'medicine', 'healthcare', 'hospital', 'sun pharma', 'dr reddy', 'cipla']
  },
  {
    sector: 'Metals & Mining',
    keywords: ['metal', 'steel', 'iron', 'copper', 'aluminium', 'gold', 'silver', 'mining', 'tata steel', 'vedanta', 'hindalco']
  },
  {
    sector: 'FMCG & Retail',
    keywords: ['fmcg', 'consumer', 'retail', 'hindustan unilever', 'itc', 'nestle', 'food inflation', 'demand']
  },
  {
    sector: 'Forex & Currencies',
    keywords: ['forex', 'rupee', 'dollar', 'inr', 'usd', 'eur', 'fx', 'currency', 'yield', 'treasury']
  }
];

export function analyzeMarketRelevance(title: string, content: string): {
  impactLevel: MarketImpact;
  sentiment: MarketSentiment;
  affectedSectors: string[];
  isBreakingAlert: boolean;
} {
  const text = `${title} ${content}`.toLowerCase();

  // 1. Determine Market Impact
  let isHigh = HIGH_IMPACT_KEYWORDS.some(kw => text.includes(kw));
  let isMedium = MEDIUM_IMPACT_KEYWORDS.some(kw => text.includes(kw));

  let impactLevel: MarketImpact = 'LOW';
  if (isHigh) {
    impactLevel = 'HIGH';
  } else if (isMedium) {
    impactLevel = 'MEDIUM';
  }

  // 2. Determine Sentiment
  let bullishScore = 0;
  let bearishScore = 0;

  for (const kw of BULLISH_KEYWORDS) {
    if (text.includes(kw)) bullishScore += 1;
  }
  for (const kw of BEARISH_KEYWORDS) {
    if (text.includes(kw)) bearishScore += 1;
  }

  let sentiment: MarketSentiment = 'NEUTRAL';
  if (bullishScore > bearishScore) {
    sentiment = 'BULLISH';
  } else if (bearishScore > bullishScore) {
    sentiment = 'BEARISH';
  }

  // 3. Detect Affected Sectors
  const sectors: string[] = [];
  for (const mapping of SECTOR_MAPPINGS) {
    if (mapping.keywords.some(kw => text.includes(kw))) {
      sectors.push(mapping.sector);
    }
  }

  if (sectors.length === 0) {
    sectors.push('Broad Market');
  }

  // 4. Breaking Alert: High impact + urgent trigger
  const isBreakingAlert = impactLevel === 'HIGH' && (
    text.includes('breaking') ||
    text.includes('alert') ||
    text.includes('urgent') ||
    text.includes('crash') ||
    text.includes('surges') ||
    text.includes('record high') ||
    text.includes('rate cut') ||
    text.includes('rate hike') ||
    text.includes('war') ||
    text.includes('tariffs')
  );

  return {
    impactLevel,
    sentiment,
    affectedSectors: sectors.slice(0, 3),
    isBreakingAlert
  };
}

export function cleanText(htmlOrText: string): string {
  if (!htmlOrText) return '';
  return htmlOrText
    .replace(/<!\[CDATA\[(.*?)\]\]>/gis, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
