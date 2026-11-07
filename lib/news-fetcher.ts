import { XMLParser } from 'fast-xml-parser';
import { RSS_SOURCES, SourceConfig } from './rss-sources';
import { NewsItem, NewsResponse } from './types';
import { analyzeMarketRelevance, cleanText } from './market-analyzer';

const TWO_DAYS_MS = 48 * 60 * 60 * 1000; // 2 days strict retention (48 hours)
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes memory cache

interface CacheState {
  lastUpdated: number;
  items: NewsItem[];
}

let memoryCache: CacheState | null = null;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
});

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 MarketPulse/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml, text/html, */*',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parsePubDate(pubDateStr?: string): number {
  if (!pubDateStr) return Date.now();
  const parsed = Date.parse(pubDateStr);
  return isNaN(parsed) ? Date.now() : parsed;
}

async function fetchSourceItems(source: SourceConfig): Promise<NewsItem[]> {
  try {
    const xml = await fetchWithTimeout(source.url);
    const parsed = parser.parse(xml);

    let rawItems: any[] = [];
    if (parsed.rss?.channel?.item) {
      rawItems = Array.isArray(parsed.rss.channel.item)
        ? parsed.rss.channel.item
        : [parsed.rss.channel.item];
    } else if (parsed.feed?.entry) {
      rawItems = Array.isArray(parsed.feed.entry)
        ? parsed.feed.entry
        : [parsed.feed.entry];
    }

    const now = Date.now();
    const items: NewsItem[] = [];

    for (const raw of rawItems) {
      const rawTitle = raw.title?.['#text'] || raw.title || '';
      const rawLink =
        raw.link?.['@_href'] ||
        raw.link?.['#text'] ||
        (typeof raw.link === 'string' ? raw.link : '') ||
        '';
      const rawDesc =
        raw.description?.['#text'] ||
        raw.description ||
        raw.summary?.['#text'] ||
        raw.summary ||
        raw['content:encoded'] ||
        '';
      const rawDate = raw.pubDate || raw.published || raw.updated || '';

      const title = cleanText(String(rawTitle));
      const snippet = cleanText(String(rawDesc));
      const link = String(rawLink).trim();
      const timestamp = parsePubDate(String(rawDate));

      if (!title || !link) continue;

      // RULE: Automatically delete / exclude data older than 2 days (48 hours)
      // Allow current and slight future skew, but drop anything published > 48h ago
      if (timestamp < now - TWO_DAYS_MS) {
        continue;
      }

      // Check financial / share market impact
      const analysis = analyzeMarketRelevance(title, snippet);

      const item: NewsItem = {
        id: `${source.name}-${timestamp}-${Math.abs(hashString(link))}`,
        title,
        link,
        source: source.name,
        pubDate: new Date(timestamp).toISOString(),
        timestamp,
        category: source.category,
        snippet: snippet.slice(0, 320),
        sentiment: analysis.sentiment,
        impactLevel: analysis.impactLevel,
        affectedSectors: analysis.affectedSectors,
        isBreakingAlert: analysis.isBreakingAlert,
      };

      items.push(item);
    }

    return items;
  } catch (err) {
    console.warn(`[MarketPulse] Failed to fetch source: ${source.name}`, err);
    return [];
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export async function getAggregatedNews(forceRefresh = false): Promise<NewsResponse> {
  const now = Date.now();

  if (!forceRefresh && memoryCache && now - memoryCache.lastUpdated < CACHE_TTL_MS) {
    const freshItems = memoryCache.items.filter(
      (item) => item.timestamp >= now - TWO_DAYS_MS
    );
    const alerts = freshItems.filter((i) => i.isBreakingAlert || i.impactLevel === 'HIGH');

    return {
      success: true,
      count: freshItems.length,
      lastUpdated: new Date(memoryCache.lastUpdated).toISOString(),
      nextUpdateInSeconds: Math.max(0, Math.floor((memoryCache.lastUpdated + 5 * 3600 * 1000 - now) / 1000)),
      items: freshItems,
      highImpactAlerts: alerts.slice(0, 5),
    };
  }

  // Fetch from all RSS sources concurrently
  const fetchPromises = RSS_SOURCES.map((source) => fetchSourceItems(source));
  const results = await Promise.allSettled(fetchPromises);

  const allItems: NewsItem[] = [];
  const seenTitles = new Set<string>();
  const seenLinks = new Set<string>();

  for (const res of results) {
    if (res.status === 'fulfilled') {
      for (const item of res.value) {
        const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seenTitles.has(normalizedTitle) || seenLinks.has(item.link)) {
          continue; // Deduplicate
        }
        seenTitles.add(normalizedTitle);
        seenLinks.add(item.link);
        allItems.push(item);
      }
    }
  }

  // Sort descending by timestamp (newest first)
  allItems.sort((a, b) => b.timestamp - a.timestamp);

  // Strict 2-day cutoff enforcement
  const validItems = allItems.filter((item) => item.timestamp >= now - TWO_DAYS_MS);

  // Update memory cache
  memoryCache = {
    lastUpdated: now,
    items: validItems,
  };

  const highImpactAlerts = validItems
    .filter((i) => i.isBreakingAlert || i.impactLevel === 'HIGH')
    .slice(0, 5);

  return {
    success: true,
    count: validItems.length,
    lastUpdated: new Date(now).toISOString(),
    nextUpdateInSeconds: 5 * 3600, // 5 hours in seconds
    items: validItems,
    highImpactAlerts,
  };
}
