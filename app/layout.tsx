import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketPulse | Real-Time Share Market & Financial Intelligence',
  description:
    'Curated, AI-summarized global, economic, market, and business news impacting share markets. Auto-purged every 2 days, synced every 5-6 hours with real-time high-impact alerts.',
  keywords: [
    'share market news',
    'stock market intelligence',
    'economic times',
    'moneycontrol',
    'bloomberg',
    'cnbc',
    'gemini ai financial summaries',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📈</text></svg>" />
      </head>
      <body className="min-h-screen bg-[#090D16] text-gray-100 selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
