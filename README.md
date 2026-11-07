# MarketPulse | Real-Time Financial & Share Market Intelligence Web App

A modern, responsive, high-performance financial intelligence terminal that aggregates, filters, and analyzes market-impacting news across **4 key sections**, powered by Google's **Gemini AI** for zero-fluff bullet-point summaries and direct **Source Verification**.

---

## 🌟 Key Features

### 1. 4 Dedicated Financial Sections
- 🌐 **Global News**: Major macro-economic & geo-political shifts affecting global markets.
- 📊 **Economic News**: Central bank policies (RBI, Fed, ECB), interest rates, inflation figures, GDP forecasts, and fiscal moves.
- 📈 **Market News**: Equities, indices (Nifty, Sensex, Dow Jones, Nasdaq), commodities, currency pairs, and stock earnings.
- 🏢 **Business News**: Corporate mergers, acquisitions, leadership changes, regulatory filings, and quarterly reports.

### 2. High-Credibility Sources Tracked
Real-time feeds from top financial and economic media:
1. **Economic Times** (Markets & Economy)
2. **Moneycontrol** (Market Reports & Business)
3. **Hindustan Times** (Business)
4. **BBC News** (Business & World Economy)
5. **Zee News** (Business)
6. **Bloomberg News** (via Google News topic index)
7. **CNBC** (Markets & Finance)
8. **Yahoo Finance** (Global Market Wire)
9. **BlackRock** (Asset Management & Insights)
10. **Zerodha Pulse** (Indian Capital Markets)
11. **Forex Factory** (Global Currencies & Central Bank Calendars)
12. **Google News** (Curated Share Market Top Stories)

### 3. Strict 48-Hour (2-Day) Rolling Window
- **Automatic Old Data Purge**: Any news item older than 48 hours is automatically discarded so the dashboard stays fresh, relevant, and free of outdated noise.

### 4. 5 to 6-Hour Scheduled Auto-Sync + Vercel Cron
- Automatically polls and syncs feeds every 5 hours with a visible countdown timer.
- Manual **"Sync Now"** 1-click button for on-demand instant refresh.
- Configured with `vercel.json` for automated cron triggers (`0 */6 * * *`).

### 5. High-Impact Financial Event Alerts
- Real-time scanner flags market-moving events (rate decisions, crashes, surges, emergency regulatory shifts).
- **Web Audio Alert Chime**: Plays an alert tone when major breaking market news arrives.
- **Browser Push Notifications**: Supports native desktop/mobile push alerts for high-priority financial events.
- **Breaking News Ticker**: Prominent alert banner at the top of the terminal.

### 6. Gemini AI Market Impact Engine
- Distills long news articles into concise, actionable takeaways:
  - **Zero-Fluff Fact Summary**
  - **Specific Share Market & Stock Price Impact**
  - **Affected Sectors & Stocks** (e.g., Banking, IT, Energy, Auto, Pharma, Forex)
  - **Market Sentiment Classification** (🟢 Bullish, 🔴 Bearish, ⚪ Neutral)
  - **Impact Level** (🚨 High, ⚡ Moderate, ℹ️ Low)
- Easily configure your Gemini API Key directly in the UI settings or via environment variable.

### 7. Authentic Source Verification Link
- Every single article card includes a **"Verify Source ↗"** button that opens the original publisher's article in a new tab so you can immediately verify relevance and authenticity.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set your Gemini API Key in .env.local
cp .env.example .env.local
# Add your GEMINI_API_KEY=AIzaSy...

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploy to Vercel

### Option 1: Vercel CLI (Fastest)

```bash
# Run inside the project directory:
vercel
```

Follow the prompts:
- Set up and deploy: **Yes**
- Which scope: Select your personal or team account
- Link to existing project: **No**
- Project name: `marketpulse-terminal`
- In which directory: `./`
- Want to modify settings: **No**

To deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy with GitHub & Vercel Dashboard

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MarketPulse financial intelligence app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/marketpulse.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API Key)*
4. Click **Deploy**.
5. Vercel will build and deploy the app and activate the cron job defined in `vercel.json` (`0 */6 * * *`).

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Serverless Edge-ready)
- **Styling**: Tailwind CSS (Financial Terminal Dark Theme)
- **Icons**: Lucide React
- **RSS Parser**: Fast-XML-Parser
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Hosting & Cron**: Vercel Serverless + Vercel Cron
