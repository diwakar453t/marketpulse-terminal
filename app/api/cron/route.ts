import { NextResponse } from 'next/server';
import { getAggregatedNews } from '@/lib/news-fetcher';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[CRON] Running scheduled 6-hour financial news aggregator & cleanup...');
    const result = await getAggregatedNews(true); // force refresh

    const highAlerts = result.highImpactAlerts.map((a) => ({
      title: a.title,
      source: a.source,
      impact: a.impactLevel,
      link: a.link,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      articlesProcessed: result.count,
      highImpactAlertsCount: highAlerts.length,
      highImpactAlerts: highAlerts,
      message: 'Automated 6-hour news sync and 2-day old data cleanup completed successfully.',
    });
  } catch (err: any) {
    console.error('[CRON ERROR]', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
