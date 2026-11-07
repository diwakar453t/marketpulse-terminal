import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedNews } from '@/lib/news-fetcher';
import { NewsCategory, MarketImpact, MarketSentiment } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = (searchParams.get('category') || 'all') as NewsCategory;
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const impact = searchParams.get('impact') as MarketImpact | null;
    const sentiment = searchParams.get('sentiment') as MarketSentiment | null;
    const forceRefresh = searchParams.get('refresh') === 'true';

    const aggregated = await getAggregatedNews(forceRefresh);

    let filtered = aggregated.items;

    // Filter by category (4 sections)
    if (category && category !== 'all') {
      filtered = filtered.filter((item) => item.category === category);
    }

    // Filter by impact level
    if (impact) {
      filtered = filtered.filter((item) => item.impactLevel === impact);
    }

    // Filter by sentiment
    if (sentiment) {
      filtered = filtered.filter((item) => item.sentiment === sentiment);
    }

    // Filter by search keyword
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.snippet.toLowerCase().includes(search) ||
          item.source.toLowerCase().includes(search) ||
          item.affectedSectors.some((sec) => sec.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      totalAvailable: aggregated.count,
      lastUpdated: aggregated.lastUpdated,
      nextUpdateInSeconds: aggregated.nextUpdateInSeconds,
      highImpactAlerts: aggregated.highImpactAlerts,
      items: filtered,
    });
  } catch (error: any) {
    console.error('Error serving /api/news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch financial news feed',
      },
      { status: 500 }
    );
  }
}

