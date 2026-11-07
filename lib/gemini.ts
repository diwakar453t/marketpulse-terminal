import { GoogleGenerativeAI } from '@google/generative-ai';
import { MarketImpact, MarketSentiment } from './types';

export interface AISummaryResult {
  overview: string;
  marketImpact: string;
  affectedSectors: string[];
  sentiment: MarketSentiment;
  impactLevel: MarketImpact;
}

export async function summarizeWithGemini(
  title: string,
  content: string,
  source: string,
  customApiKey?: string
): Promise<AISummaryResult> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return intelligent heuristic fallback when no Gemini API key is configured yet
    return generateFallbackSummary(title, content);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert Senior Financial Analyst & Stock Market Strategist.
Analyze the following financial/economic news item strictly from the perspective of how it impacts the share market, businesses, and investors.
Strip out all irrelevant fluff, ads, clickbait, and unrelated background.
Be extremely concise, punchy, and direct.

Article Title: "${title}"
Source: "${source}"
Content/Snippet: "${content}"

Respond ONLY with a valid JSON object matching this exact schema:
{
  "overview": "2 crisp bullet points or max 2 sentences summarizing core facts without filler",
  "marketImpact": "Direct, concrete impact on stock market / Nifty / Sensex / US indices / investor sentiment",
  "affectedSectors": ["List 1 to 3 affected sectors or stock categories"],
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "impactLevel": "HIGH" | "MEDIUM" | "LOW"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean JSON markdown fences if present
    const cleanJson = responseText
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    return {
      overview: parsed.overview || title,
      marketImpact: parsed.marketImpact || 'Monitoring general market sentiment.',
      affectedSectors: Array.isArray(parsed.affectedSectors) && parsed.affectedSectors.length > 0 ? parsed.affectedSectors : ['General Equities'],
      sentiment: ['BULLISH', 'BEARISH', 'NEUTRAL'].includes(parsed.sentiment) ? parsed.sentiment : 'NEUTRAL',
      impactLevel: ['HIGH', 'MEDIUM', 'LOW'].includes(parsed.impactLevel) ? parsed.impactLevel : 'MEDIUM',
    };
  } catch (error) {
    console.error('Gemini API summarization error:', error);
    return generateFallbackSummary(title, content);
  }
}

function generateFallbackSummary(title: string, content: string): AISummaryResult {
  const cleanSnippet = content.slice(0, 180).trim();
  
  return {
    overview: `Key event: ${title}. ${cleanSnippet ? cleanSnippet + '...' : ''}`,
    marketImpact: 'Market participants are watching price action, volume indicators, and sector correlation.',
    affectedSectors: ['Financials', 'Equities'],
    sentiment: title.toLowerCase().includes('rally') || title.toLowerCase().includes('jump') ? 'BULLISH' :
               title.toLowerCase().includes('fall') || title.toLowerCase().includes('plunge') ? 'BEARISH' : 'NEUTRAL',
    impactLevel: title.toLowerCase().includes('rate') || title.toLowerCase().includes('crash') ? 'HIGH' : 'MEDIUM',
  };
}
