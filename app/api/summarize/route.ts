import { NextRequest, NextResponse } from 'next/server';
import { summarizeWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, snippet, source, apiKey } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required for summarization' },
        { status: 400 }
      );
    }

    const summary = await summarizeWithGemini(
      title,
      snippet || '',
      source || 'Financial News',
      apiKey
    );

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Summarization failed' },
      { status: 500 }
    );
  }
}

