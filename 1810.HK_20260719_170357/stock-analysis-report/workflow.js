export const meta = {
  name: 'stock-analysis-report',
  description: 'Multi-agent adversarial deep analysis report for any stock ticker',
  phases: [
    { title: 'I. Analyst Reports', detail: 'Market, Sentiment, News, Fundamentals (parallel)' },
    { title: 'II. Research Debate', detail: 'Bull vs Bear multi-round + Manager verdict' },
    { title: 'III. Trading Plan', detail: 'Trader entry/exit/stop-loss plan' },
    { title: 'IV. Risk Management', detail: 'Aggressive/Conservative/Neutral debate' },
    { title: 'V. Portfolio Manager', detail: 'Final rating, target, synthesis' },
    { title: 'Assembly', detail: 'Compile complete_report.md' },
  ],
}

const TICKER = args.ticker || 'AAPL'
const COMPANY = args.company || TICKER
const DATE = args.date || '2026-07-19'

// =============================================================================
// MODULE I: ANALYST TEAM (Parallel)
// =============================================================================
phase('I. Analyst Reports')
log(`Starting 4 parallel analyst reports for ${TICKER}...`)

const MARKET_PROMPT = `You are a senior Market Analyst specializing in technical analysis. Analyze ${TICKER} (${COMPANY}) using the latest price data.

## Required Sections:
1. **Market Overview & Key Data**: Latest close price, 10/50/200-day MAs, RSI(14), MACD, Bollinger Bands (20), ATR, VWMA. Present as a table.
2. **Multi-Timeframe Trend Analysis**: Long-term (1 year, 200SMA perspective), Medium-term (2-3 months, 50SMA), Short-term (2-4 weeks, 10EMA). Each with clear signal (bullish/bearish/neutral).
3. **Core Indicator Deep Dive**: RSI trend (from oversold/overbought history), MACD (crossover signals, histogram), Bollinger Band position, VWMA relationship, ATR (volatility context).
4. **Key Price Levels**: Resistance levels (ranked with rationale) and Support levels (ranked with rationale).
5. **Scenario Analysis**: Bull case (probability %), base case (probability %), bear case (probability %). Each with price targets.
6. **Comprehensive Summary Table**: Trend, momentum, overbought/oversold, volatility, volume for each timeframe.
7. **Final Qualitative Assessment**: One paragraph synthesis.

End with: FINAL TRANSACTION PROPOSAL: **HOLD** (or BUY/SELL)

Write in Chinese (中文). Be thorough and data-driven.`

const SENTIMENT_PROMPT = `You are a senior Sentiment Analyst. Analyze ${TICKER} (${COMPANY}) market sentiment for the past week.

## Data Sources to Search and Analyze:
1. **News Headlines**: Search Yahoo Finance, Bloomberg, Reuters for recent ${COMPANY} news. Categorize each as bullish/bearish/neutral.
2. **Social Media**: Search Reddit (r/wallstreetbets, r/stocks, r/investing) and StockTwits for ${TICKER} mentions. Note if data is unavailable.
3. **Analyst Ratings**: Search for recent analyst upgrades/downgrades and price target changes.

## Required Sections:
1. **Data Source Analysis**: Per-source breakdown with bull/bear/neutral signal classification in a table.
2. **Cross-Source Consistency**: Are different sources aligned or diverging? What does divergence mean?
3. **Dominant Narrative Themes**: The 3-5 key stories driving sentiment.
4. **Catalysts & Risk Factors**: Upcoming events that could shift sentiment.
5. **Data Limitations**: What sources were unavailable or incomplete? How does this affect confidence?

## Scoring:
- **Overall Sentiment**: Bullish / Mixed / Bearish
- **Sentiment Score**: 1-10 (1=extreme fear, 10=extreme greed)
- **Confidence**: High / Medium / Low

Write in Chinese (中文). Be honest about data availability.`

const NEWS_PROMPT = `You are a senior News & Macro Analyst. Analyze ${TICKER} (${COMPANY}) from a macro and industry perspective.

## Research Areas:
1. **Company News** (past week): Major announcements, product launches, partnerships, regulatory events, management changes.
2. **Industry Trends**: Sector dynamics, competitive landscape shifts, market share changes, supply chain developments.
3. **Macro Context**: Relevant economic indicators, interest rate environment, trade policy, geopolitical factors affecting the company.
4. **Prediction Markets**: If available, what do prediction markets imply about company-specific events?

## Required Sections:
1. **Company Recent Developments**: Key news items with impact assessment.
2. **Industry Competitive Landscape**: Major competitor moves, market structure changes.
3. **Macro & Policy Background**: Economic/policy factors affecting the business.
4. **Geopolitical & Supply Chain Risks**: International exposure and vulnerabilities.
5. **Key Information Summary Table**: Dimension, finding, impact on company, source.
6. **Core Trading Implications**: Short-term (1-3 months), medium-term catalysts, key risks, watchpoints.

Write in Chinese (中文). Note any unavailable data sources.`

const FUNDAMENTALS_PROMPT = `You are a senior Fundamentals Analyst. Perform a deep financial analysis of ${TICKER} (${COMPANY}).

## Data to Retrieve and Analyze:
1. **Balance Sheet** (5 years annual): Total assets, total liabilities, shareholders' equity, cash & equivalents, short-term investments, inventory, accounts receivable, total debt, tangible book value, working capital.
2. **Income Statement** (5 years annual + latest quarter): Revenue, gross profit, gross margin %, R&D expenses, SG&A, operating income, net income, diluted EPS, EBITDA, effective tax rate.
3. **Cash Flow Statement** (5 years annual): Operating cash flow, capex, free cash flow, depreciation & amortization, stock-based compensation.
4. **Key Ratios**: Current ratio, quick ratio, interest coverage, ROE, ROA, debt-to-equity, revenue CAGR, net income CAGR.

## Required Sections:
1. **Company Overview**: Business segments, strategy, market position.
2. **Balance Sheet Analysis**: Table + key insights (asset growth, cash position, inventory trends, debt structure, equity growth).
3. **Income Statement Analysis**: Table + key insights (revenue growth, margin trends, R&D intensity, profit quality, EPS trajectory).
4. **Cash Flow Analysis**: Table + key insights (OCF strength, capex trends, FCF quality, working capital changes).
5. **Comprehensive Financial Health Assessment**: Solvency, profitability, growth, valuation reference.
6. **Risk Factors**: Competitive, operational, geopolitical, financial risks.
7. **Key Takeaways Summary Table**: Dimension, metric, value, assessment.
8. **Overall Conclusion**: Bullet points with ✅ strengths and ⚠️ concerns.

Write in Chinese (中文). Use real financial data.`

const [marketReport, sentimentReport, newsReport, fundamentalsReport] = await parallel([
  () => agent(MARKET_PROMPT, { label: `market:${TICKER}`, schema: null }),
  () => agent(SENTIMENT_PROMPT, { label: `sentiment:${TICKER}`, schema: null }),
  () => agent(NEWS_PROMPT, { label: `news:${TICKER}`, schema: null }),
  () => agent(FUNDAMENTALS_PROMPT, { label: `fundamentals:${TICKER}`, schema: null }),
])

log('All 4 analyst reports complete.')

// =============================================================================
// MODULE II: RESEARCH TEAM DEBATE (Bull vs Bear, multi-round)
// =============================================================================
phase('II. Research Debate')

// Round 1: Opening statements
log('Debate Round 1: Opening statements...')
const MARKET_SUMMARY = marketReport?.substring(0, 3000) || ''
const SENTIMENT_SUMMARY = sentimentReport?.substring(0, 2000) || ''
const NEWS_SUMMARY = newsReport?.substring(0, 2000) || ''
const FUNDAMENTALS_SUMMARY = fundamentalsReport?.substring(0, 3000) || ''

const CONTEXT = `
## Market Analyst Key Findings:
${MARKET_SUMMARY}

## Sentiment Analyst Key Findings:
${SENTIMENT_SUMMARY}

## News Analyst Key Findings:
${NEWS_SUMMARY}

## Fundamentals Analyst Key Findings:
${FUNDAMENTALS_SUMMARY}
`

const BULL_ROUND1 = await agent(
`You are the Bull Researcher for ${TICKER} (${COMPANY}). You MUST defend a strongly bullish thesis.

## Analyst Research Summary:
${CONTEXT}

## Your Task:
Present a compelling bull case. You must:
1. Cite specific data from the analyst reports to support your arguments
2. Address potential bearish concerns preemptively
3. Build your case around 3-5 core pillars (e.g., financial health, second growth curve, technical reversal, ecosystem moat, valuation)
4. End with a clear bullish price target and catalyst timeline
5. Use rhetorical power — you are advocating for shareholders

Write in Chinese (中文). Be passionate but data-driven. This is Round 1 of a multi-round debate.`,
  { label: 'bull:round1' }
)

const BEAR_ROUND1 = await agent(
`You are the Bear Researcher for ${TICKER} (${COMPANY}). You MUST attack the bullish thesis and present a strongly bearish case.

## Analyst Research Summary:
${CONTEXT}

## Bull Researcher's Opening Statement:
${BULL_ROUND1?.substring(0, 5000) || 'Not yet available'}

## Your Task:
1. Directly rebut the Bull's key arguments with specific data
2. Identify profit quality issues, cash flow deterioration, or overvaluation
3. Challenge growth assumptions — question whether "second curves" will materialize
4. Present your bear case around 3-5 core pillars
5. End with a clear bearish price target and risk catalyst timeline

Write in Chinese (中文). Be rigorous and data-driven. This is Round 1.`,
  { label: 'bear:round1' }
)

// Round 2: Rebuttals
log('Debate Round 2: Rebuttals...')
const BULL_ROUND2 = await agent(
`You are the Bull Researcher for ${TICKER} (${COMPANY}). This is Round 2 — you must rebut the Bear's attacks.

## Analyst Research Summary:
${CONTEXT}

## Your Round 1 Arguments:
${BULL_ROUND1?.substring(0, 3000) || ''}

## Bear's Round 1 Attack:
${BEAR_ROUND1?.substring(0, 5000) || ''}

## Your Task:
1. Address EVERY major bear argument with counter-evidence
2. If the bear attacked profit quality — show why non-recurring items are legitimate
3. If the bear attacked cash flow — explain why capex is strategic investment
4. If the bear attacked valuation — justify the multiple with growth rate and moat
5. If the bear attacked competition — explain competitive advantages
6. End with: "Why the bear's [price target] is wrong"

Write in Chinese (中文). Be precise and confrontational.`,
  { label: 'bull:round2' }
)

const BEAR_ROUND2 = await agent(
`You are the Bear Researcher for ${TICKER} (${COMPANY}). This is Round 2 — deliver your final rebuttal.

## Your Round 1 Attack:
${BEAR_ROUND1?.substring(0, 3000) || ''}

## Bull's Round 2 Rebuttal:
${BULL_ROUND2?.substring(0, 5000) || ''}

## Your Task:
1. Identify logical fallacies or data cherry-picking in the Bull's rebuttal
2. Perform a "stress test" — what if the Bull's key assumption is wrong?
3. Show why the current valuation provides NO margin of safety
4. Address the Bull's "strategic investment" narrative — when does investment become waste?
5. Close with a final warning: the specific scenario that could cause maximum downside

Write in Chinese (中文). This is your final word. Make it count.`,
  { label: 'bear:round2' }
)

// Research Manager verdict
log('Research Manager: issuing verdict...')
const RESEARCH_MANAGER = await agent(
`You are the Research Manager. After hearing the full Bull vs Bear debate for ${TICKER} (${COMPANY}), you must issue a final recommendation.

## Analyst Reports:
${CONTEXT}

## Bull Researcher (Round 1):
${BULL_ROUND1?.substring(0, 2000) || ''}

## Bear Researcher (Round 1):
${BEAR_ROUND1?.substring(0, 2000) || ''}

## Bull Rebuttal (Round 2):
${BULL_ROUND2?.substring(0, 2000) || ''}

## Bear Rebuttal (Round 2):
${BEAR_ROUND2?.substring(0, 2000) || ''}

## Your Task:
1. **Judge the debate**: Which side made more convincing arguments? On which specific points?
2. **Identify the critical unresolved questions**: What would you need to see to change your view?
3. **Issue your recommendation**: BUY / OVERWEIGHT / HOLD / UNDERWEIGHT / SELL
4. **Provide detailed rationale**: Why this rating?
5. **Strategic Actions**: Specific steps the trader should take.

Write in Chinese (中文). Be decisive — no fence-sitting. Your recommendation drives the entire trading plan.`,
  { label: 'research-manager' }
)

// =============================================================================
// MODULE III: TRADING PLAN
// =============================================================================
phase('III. Trading Plan')
log('Trader: formulating execution plan...')

const TRADER = await agent(
`You are the Trader. Based on the Research Manager's recommendation, create a specific, actionable trading plan for ${TICKER} (${COMPANY}).

## Research Manager's Recommendation:
${RESEARCH_MANAGER?.substring(0, 5000) || 'Not available'}

## Technical Levels (from Market Analyst):
${MARKET_SUMMARY}

## Your Task:
1. **Action**: BUY / SELL / HOLD — align with Research Manager
2. **Entry Price**: Specific price level for execution
3. **Stop Loss**: Hard stop-loss level with rationale
4. **Position Sizing**: Recommended allocation % and scaling approach
5. **Reasoning**: Why this plan is optimal given the research

End with: FINAL TRANSACTION PROPOSAL: **[BUY/SELL/HOLD]**

Write in Chinese (中文) for reasoning. Be precise with price levels.`,
  { label: 'trader' }
)

// =============================================================================
// MODULE IV: RISK MANAGEMENT TEAM (3-way parallel then debate)
// =============================================================================
phase('IV. Risk Management')
log('Risk team: 3 parallel analyses...')

const RISK_CONTEXT = `
## Trader's Plan:
${TRADER?.substring(0, 3000) || ''}

## Research Manager Verdict:
${RESEARCH_MANAGER?.substring(0, 2000) || ''}
`

const [aggressiveReport, conservativeReport, neutralReport] = await parallel([
  () => agent(
`You are the Aggressive Risk Analyst. Challenge overly cautious views on ${TICKER} (${COMPANY}).

${RISK_CONTEXT}

## Your Role:
You believe the market over-penalizes uncertainty. Growth companies deserve premium valuations during transformation. Challenge the Conservative Analyst's risk aversion:
1. If the Trader is selling — argue why this is panic, not prudence
2. Show where asymmetric upside exists (high reward relative to risk)
3. Argue that "waiting for confirmation" means buying higher later
4. Cite historical examples where fear created buying opportunities
5. Provide an alternative aggressive stance with quantified upside

Write in Chinese (中文). Be bold but data-backed.`,
    { label: 'risk:aggressive' }
  ),
  () => agent(
`You are the Conservative Risk Analyst. Protect capital at all costs for ${TICKER} (${COMPANY}).

${RISK_CONTEXT}

## Your Role:
Capital preservation is the ONLY goal. Challenge optimistic assumptions ruthlessly:
1. If the Trader is buying — stress-test every assumption
2. Show where margin of safety is absent
3. Argue that "strategic investment" is often value destruction in disguise
4. Demand proof of turnaround before committing capital
5. Provide worst-case scenario analysis with quantified downside

Write in Chinese (中文). Be skeptical and rigorous.`,
    { label: 'risk:conservative' }
  ),
  () => agent(
`You are the Neutral Risk Analyst. Find the balanced middle path for ${TICKER} (${COMPANY}).

${RISK_CONTEXT}

## Your Role:
Synthesize both aggressive and conservative views into an actionable, balanced strategy:
1. Acknowledge valid points from both extremes
2. Set quantified conditions for both entry and exit
3. Design a phased approach: reduce/trim now, re-enter on specific triggers
4. Correct any faulty math (e.g., misstated odds ratios, wrong PE calculations)
5. Provide a dynamic rebalancing framework with explicit triggers

Write in Chinese (中文). Be fair-minded and precise. Your "third way" should be the most executable.`,
    { label: 'risk:neutral' }
  ),
])

// Risk debate round
log('Risk team: debate round...')
const AGGRESSIVE_FINAL = await agent(
`You are the Aggressive Risk Analyst. You've heard the Conservative and Neutral views on ${TICKER} (${COMPANY}). Deliver your final rebuttal.

## Conservative View:
${conservativeReport?.substring(0, 3000) || ''}

## Neutral View:
${neutralReport?.substring(0, 3000) || ''}

## Your Task:
Final aggressive argument. Defend your position. Address the Conservative's worst-case scenarios. Show why the Neutral's "wait and see" approach will miss the move.

Write in Chinese (中文).`,
  { label: 'risk:aggressive-final' }
)

const CONSERVATIVE_FINAL = await agent(
`You are the Conservative Risk Analyst. Deliver your final warning on ${TICKER} (${COMPANY}).

## Aggressive Final:
${AGGRESSIVE_FINAL?.substring(0, 3000) || ''}

## Neutral View:
${neutralReport?.substring(0, 3000) || ''}

## Your Task:
Final conservative warning. Defend capital preservation. Show why the Aggressive's "asymmetric opportunity" is actually a trap. Provide the one scenario that keeps you awake at night.

Write in Chinese (中文).`,
  { label: 'risk:conservative-final' }
)

const NEUTRAL_FINAL = await agent(
`You are the Neutral Risk Analyst. Deliver your final balanced synthesis for ${TICKER} (${COMPANY}).

## Aggressive Final:
${AGGRESSIVE_FINAL?.substring(0, 2000) || ''}

## Conservative Final:
${CONSERVATIVE_FINAL?.substring(0, 2000) || ''}

## Your Task:
Final neutral verdict. Accept the Trader's core decision but add dynamic conditions for re-entry or further reduction. Set explicit quantified triggers. Your plan should be the most actionable.

Write in Chinese (中文).`,
  { label: 'risk:neutral-final' }
)

// =============================================================================
// MODULE V: PORTFOLIO MANAGER DECISION
// =============================================================================
phase('V. Portfolio Manager')
log('Portfolio Manager: final synthesis...')

const PORTFOLIO_MANAGER = await agent(
`You are the Portfolio Manager. Synthesize ALL research and debate into the FINAL decision for ${TICKER} (${COMPANY}).

## All Inputs:
- Market Analysis: ${MARKET_SUMMARY}
- Research Manager: ${RESEARCH_MANAGER?.substring(0, 3000) || ''}
- Trader Plan: ${TRADER?.substring(0, 2000) || ''}
- Aggressive Risk: ${AGGRESSIVE_FINAL?.substring(0, 2000) || ''}
- Conservative Risk: ${CONSERVATIVE_FINAL?.substring(0, 2000) || ''}
- Neutral Risk: ${NEUTRAL_FINAL?.substring(0, 2000) || ''}

## Required Output:
1. **Rating**: BUY / OVERWEIGHT / HOLD / UNDERWEIGHT / SELL
2. **Executive Summary**: 3-5 sentence summary of the entire analysis
3. **Investment Thesis**: What is the core logic? Which side won the debate and why?
4. **Price Target**: Specific price target
5. **Risk Monitoring Framework**:
   - Upside triggers (what would cause an upgrade)
   - Downside triggers (what would cause a downgrade)
   - Key dates and events to watch

Write in Chinese (中文). This is the FINAL word — the conclusion that goes to the client. Be authoritative and clear.`,
  { label: 'portfolio-manager' }
)

// =============================================================================
// ASSEMBLY: Compile the complete report
// =============================================================================
phase('Assembly')
log('Assembling complete report...')

const report = `# Trading Analysis Report: ${TICKER}

Generated: ${DATE}

## I. Analyst Team Reports

### Market Analyst
${marketReport || '(Data unavailable)'}

### Sentiment Analyst
${sentimentReport || '(Data unavailable)'}

### News Analyst
${newsReport || '(Data unavailable)'}

### Fundamentals Analyst
${fundamentalsReport || '(Data unavailable)'}

## II. Research Team Decision

### Bull Researcher

**Round 1 — Opening Statement:**
${BULL_ROUND1 || ''}

**Round 2 — Rebuttal:**
${BULL_ROUND2 || ''}

### Bear Researcher

**Round 1 — Opening Attack:**
${BEAR_ROUND1 || ''}

**Round 2 — Final Rebuttal:**
${BEAR_ROUND2 || ''}

### Research Manager
${RESEARCH_MANAGER || ''}

## III. Trading Team Plan

### Trader
${TRADER || ''}

## IV. Risk Management Team Decision

### Aggressive Analyst
${aggressiveReport || ''}

**Final Rebuttal:**
${AGGRESSIVE_FINAL || ''}

### Conservative Analyst
${conservativeReport || ''}

**Final Rebuttal:**
${CONSERVATIVE_FINAL || ''}

### Neutral Analyst
${neutralReport || ''}

**Final Rebuttal:**
${NEUTRAL_FINAL || ''}

## V. Portfolio Manager Decision

### Portfolio Manager
${PORTFOLIO_MANAGER || ''}
`

// Write the report
await agent(
`Write the following complete report to a file named "complete_report.md" in the current working directory.
Use the Write tool to save this exact content:

${report.substring(0, 100000)}

If the content is too long, split it into multiple Write calls. The file MUST be saved as complete_report.md.`,
  { label: 'save-report' }
)

log(`Report generation complete for ${TICKER}. Saved to complete_report.md`)

return {
  ticker: TICKER,
  date: DATE,
  outputFile: 'complete_report.md',
  summary: PORTFOLIO_MANAGER?.substring(0, 500) || 'Report generated',
}
