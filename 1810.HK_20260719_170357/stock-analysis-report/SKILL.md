---
name: stock-analysis-report
description: Use when the user asks to analyze a stock, generate a trading/investment report, wants a comprehensive multi-perspective deep analysis of a stock ticker, asks "should I buy/sell [TICKER]", or requests a research report on any publicly traded company. Triggers on "analyze [TICKER]", "stock report", "trading analysis", "深度分析", "研究报告", "多空分析". Also use when the user provides a stock ticker and asks for a report, recommendation, or comprehensive evaluation.
---

# Stock Analysis Report

## Overview

Generate a **multi-agent adversarial deep analysis report** for any stock ticker. Five independent analyst teams produce research, then bull and bear researchers debate across multiple rounds. A risk management team (aggressive/conservative/neutral) challenges assumptions, and a portfolio manager synthesizes everything into a final rating, price target, and actionable trading plan.

**Core principle:** Adversarial debate produces better decisions than single-perspective analysis. Every bullish argument must survive bearish cross-examination. Every risk must be quantified.

## When to Use

- User provides a stock ticker and wants a comprehensive report
- User asks "should I buy/sell/hold [TICKER]?"
- User requests "stock analysis", "trading report", "深度分析", "研究报告"
- User wants price targets, entry/exit points, or position sizing recommendations
- User asks for bull vs bear debate on a stock

**When NOT to use:**
- Quick price check or single data point → use WebSearch/WebFetch directly
- Portfolio-level allocation questions → that's a different analysis
- Crypto, forex, or non-equity assets → different data sources needed

## Report Architecture (5 Modules)

```
Module I:   Analyst Team Reports (parallel)
            ├── Market Analyst (technical analysis)
            ├── Sentiment Analyst (news + social media)
            ├── News Analyst (macro + industry)
            └── Fundamentals Analyst (financial statements)

Module II:  Research Team Debate (adversarial)
            ├── Bull Researcher (multi-round defense)
            ├── Bear Researcher (multi-round attack)
            └── Research Manager (verdict + recommendation)

Module III: Trading Team Plan
            └── Trader (entry/exit/stop-loss/position sizing)

Module IV:  Risk Management Team (3-way debate)
            ├── Aggressive Analyst
            ├── Conservative Analyst
            └── Neutral Analyst

Module V:   Portfolio Manager Decision
            └── Final rating, price target, executive summary
```

## Agent Roles

### Market Analyst
Technical analysis expert. Produces: price action, moving averages (10/50/200), RSI, MACD, Bollinger Bands, ATR, VWMA, support/resistance levels, multi-timeframe trend assessment, scenario analysis with probabilities, and a HOLD/BUY/SELL transaction proposal.

### Sentiment Analyst
Scrapes news headlines, StockTwits, Reddit (r/wallstreetbets, r/stocks, r/investing). Produces: sentiment score (1-10), bull/bear signal breakdown table, cross-source consistency analysis, dominant narrative themes, catalysts and risk factors, confidence level.

### News Analyst
Gathers company news, industry trends, macro indicators (FRED), prediction markets (Polymarket). Produces: key developments summary, competitive landscape, macro context, geopolitical risks, key takeaways table with impact assessment.

### Fundamentals Analyst
Retrieves financial statements (balance sheet, income statement, cash flow) for 5+ years. Produces: asset/debt/equity trends, revenue/profit/margin analysis, cash flow quality assessment, ROE/ROA/solvency ratios, risk factors, comprehensive summary table.

### Bull Researcher
Defends a bullish thesis across multiple debate rounds. Must: directly rebut bear arguments with data, cite specific financial metrics, address profit quality concerns, defend valuation, and provide upside price targets with catalysts.

### Bear Researcher
Attacks the bullish thesis across multiple debate rounds. Must: identify profit quality issues, flag cash flow deterioration, challenge growth assumptions, provide downside price targets, and warn of value traps.

### Research Manager
Judges the debate. Decides which side provided more convincing arguments. Issues: BUY / OVERWEIGHT / HOLD / UNDERWEIGHT / SELL recommendation with detailed rationale.

### Trader
Translates the Research Manager's recommendation into an actionable trading plan: entry price, stop loss, position sizing, and a FINAL TRANSACTION PROPOSAL.

### Risk Management Analysts (Aggressive / Conservative / Neutral)
Three-way debate on the trading plan:
- **Aggressive**: challenges overly cautious assumptions, seeks asymmetric opportunities
- **Conservative**: challenges optimistic assumptions, demands margin of safety
- **Neutral**: finds the balanced middle path with quantified conditions

### Portfolio Manager
Makes the final call. Issues: rating, executive summary, investment thesis, price target, risk monitoring framework with specific trigger conditions for upgrade/downgrade.

## Workflow Orchestration

**REQUIRED:** Use the Workflow tool with the bundled workflow script. This is a complex multi-agent orchestration that requires deterministic control flow.

```bash
# In your skill invocation, run:
Workflow({scriptPath: "<path-to-skill>/workflow.js", args: {ticker: "1810.HK"}})
```

The workflow script handles:
1. Parallel dispatch of 4 analyst agents (Module I)
2. Sequential bull/bear debate with context threading (Module II)
3. Research Manager verdict (Module II)
4. Trader plan generation (Module III)
5. Parallel 3-way risk management debate (Module IV)
6. Portfolio Manager final synthesis (Module V)
7. Assembly of the complete report in markdown

**If the Workflow tool is unavailable**, manually orchestrate with Agent tool following the same 5-module sequence. Module I runs in parallel (4 agents). Module II runs sequentially (bull → bear → bull → bear → manager). Module IV runs in parallel (3 agents).

## Quick Reference

| Module | Agents | Execution | Output |
|--------|--------|-----------|--------|
| I. Analyst Team | 4 | Parallel | 4 research reports |
| II. Research Debate | 3 (bull/bear/manager) | Sequential (multi-round) | Recommendation |
| III. Trading Plan | 1 (trader) | Sequential | Entry/exit/stop plan |
| IV. Risk Management | 3 (agg/con/neu) | Parallel then sequential | 3-way debate |
| V. Portfolio Manager | 1 | Sequential (synthesis) | Final rating + target |

## Output Format

The final report is a single markdown file with all 5 modules, each agent's output clearly labeled, debate rounds numbered, and the Portfolio Manager's decision as the concluding section. Save as `complete_report.md` in the working directory.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Single agent does all analysis | Each module requires independent agents with distinct system prompts |
| No adversarial debate | Bull and bear MUST debate multiple rounds with direct rebuttals |
| Skipping risk management | 3 risk analysts must challenge the trading plan before final decision |
| Weak bear arguments | Bear researcher must attack profit quality, FCF, valuation — not just narrative |
| Unsubstantiated bull claims | Bull must cite specific financial data, not just "ecosystem" stories |
| No quantified triggers | Portfolio Manager must set explicit EPS/price levels for upgrade/downgrade |
