export interface SourceConfig {
  name: string;
  url: string;
  category: 'global' | 'economic' | 'market' | 'business';
  reliabilityWeight: number; // 1-10
}

export const RSS_SOURCES: SourceConfig[] = [
  // 1. Economic Times
  {
    name: 'Economic Times (Markets)',
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    category: 'market',
    reliabilityWeight: 9,
  },
  {
    name: 'Economic Times (Economy)',
    url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/13762472.cms',
    category: 'economic',
    reliabilityWeight: 9,
  },

  // 2. Moneycontrol
  {
    name: 'Moneycontrol (Markets)',
    url: 'https://www.moneycontrol.com/rss/marketreports.xml',
    category: 'market',
    reliabilityWeight: 9,
  },
  {
    name: 'Moneycontrol (Business)',
    url: 'https://www.moneycontrol.com/rss/business.xml',
    category: 'business',
    reliabilityWeight: 9,
  },

  // 3. CNBC
  {
    name: 'CNBC (Global Markets)',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'market',
    reliabilityWeight: 10,
  },
  {
    name: 'CNBC (Economy & Finance)',
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    category: 'economic',
    reliabilityWeight: 10,
  },

  // 4. Yahoo Finance
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    category: 'market',
    reliabilityWeight: 8,
  },

  // 5. Bloomberg (via Google News verified Bloomberg feed to avoid paywall blocks)
  {
    name: 'Bloomberg Markets',
    url: 'https://news.google.com/rss/search?q=site:bloomberg.com+markets+when:2d&hl=en-US&gl=US&ceid=US:en',
    category: 'global',
    reliabilityWeight: 10,
  },

  // 6. BBC News
  {
    name: 'BBC News (Business)',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'business',
    reliabilityWeight: 9,
  },
  {
    name: 'BBC News (Global Economy)',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'global',
    reliabilityWeight: 9,
  },

  // 7. Hindustan Times
  {
    name: 'Hindustan Times (Business)',
    url: 'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml',
    category: 'business',
    reliabilityWeight: 8,
  },

  // 8. Zee News
  {
    name: 'Zee News (Business)',
    url: 'https://zeenews.india.com/rss/business-news.xml',
    category: 'business',
    reliabilityWeight: 8,
  },

  // 9. BlackRock News & Insights (via Google News)
  {
    name: 'BlackRock (Market Insights)',
    url: 'https://news.google.com/rss/search?q=BlackRock+market+insights+when:2d&hl=en-US&gl=US&ceid=US:en',
    category: 'economic',
    reliabilityWeight: 9,
  },

  // 10. Zerodha (Market Pulse & Bulletin)
  {
    name: 'Zerodha Pulse',
    url: 'https://news.google.com/rss/search?q=Zerodha+markets+OR+Nifty+when:2d&hl=en-IN&gl=IN&ceid=IN:en',
    category: 'market',
    reliabilityWeight: 9,
  },

  // 11. Forex Factory & Currencies
  {
    name: 'Forex Factory & Currencies',
    url: 'https://news.google.com/rss/search?q=%22forex+market%22+OR+%22Forex+Factory%22+USD+INR+Fed+rates+when:2d&hl=en-US&gl=US&ceid=US:en',
    category: 'economic',
    reliabilityWeight: 9,
  },

  // 12. Google News Financial Impact
  {
    name: 'Google News (Share Market Top Stories)',
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVd3U0FtVnVHZ0pWVXlnQVAB?hl=en-IN&gl=IN&ceid=IN%3Aen',
    category: 'market',
    reliabilityWeight: 8,
  },
];

