# Sentinel

**Agentic spend guardian for AI-channel advertising.**

Sentinel monitors live ad spend across AI channels (ChatGPT, Thrad, Claude Apps), detects anomalies in real time, runs autonomous Claude-powered investigations, and escalates decisions to human operators — all in a single real-time dashboard built for ad operations teams.

> Built at a hackathon. Designed to show what a production-grade agentic ops tool looks like.

---

## Why Sentinel

Modern advertising is moving onto AI platforms where spend can spike fast, brand context is unpredictable, and conversion signals lag. Traditional rules-based dashboards can't keep up.

Sentinel combines three layers:

| Layer | What it does | When it fires |
|-------|-------------|---------------|
| **Guardrails** | Deterministic rules: budget caps, topic blocklists | Instantly, no LLM |
| **Agent** | Claude investigates anomalies: tools → evidence → verdict | On spend spikes or brand events |
| **Human gate** | Approval slide-over: Approve / Override / Dismiss | When agent is uncertain or stakes are high |

The key insight: **not every spike needs a human, and not every anomaly needs an LLM.** Sentinel routes each signal to the right layer automatically.

---

## Quick start

```bash
git clone https://github.com/dakshkumar96/Sentinel.git
cd Sentinel
npm install
npm run dev
```

Open **http://localhost:3000**. The live mock stream starts automatically.

### Optional: real Claude agent

```bash
cp .env.example .env.local
# Add ANTHROPIC_API_KEY to .env.local
```

Without an API key, a scenario-keyed mock agent runs identical demo flows. The dashboard shows **"Mock agent"** vs **"Claude Sonnet"** in the top bar.

---

## How it works

```
Mock stream (2.5s tick)
    │
    ▼
IngestHub.ingest(event)
    │
    ├─► evaluateGuardrails()   ◄── charter.yaml (budgets, blocklist)
    │       │ fires?
    │       └─► Alert + auto-pause broadcast
    │
    ├─► broadcast(spend)       ◄── sparklines + KPIs update live
    │
    └─► [if scenario] runAgentScenario()
            │
            ▼
        runInvestigation()
            │
            ├─► Claude API (if keyed)   or   mock (scenario metadata)
            │       │
            │       └─► 5 tools: conversion_trend · conversation_context
            │                     brand_guidelines · historical_baseline · client_context
            │
            ├─► applyScenarioPolicy()   ◄── ensures demo correctness
            │
            └─► resolveEscalation()     ◄── enterprise / low-confidence / high-exposure
                    │                        always escalate to human
                    ▼
            broadcast(investigation) + broadcast(alert)
                    │
                    ▼
            ApprovalGate opens (if requiresHuman)
```

All state lives in a singleton `IngestHub`. The client connects via SSE (`/api/events/stream`), receives a full snapshot on connect, then applies incremental messages through a single Zustand `applyMessage()` handler.

---

## 90-second walkthrough

Use the **Scenario Lab** panel in the right sidebar. Run in this order:

| Step | Action | What happens | Talking point |
|------|--------|--------------|---------------|
| 1 | Wait 5s | Live spend ticks, cards green | "Calm state — one operator watching many AI placements in real time." |
| 2 | **Bad spike** | Agent trace runs → **approval gate opens** | "4× spend, flat conversions, no launch on calendar — agent recommends pause." |
| 3 | **Approve** in gate | Gate closes, placement paused | "Human in the loop — the agency makes the final call with full evidence." |
| 4 | **Reset** | Clean slate | |
| 5 | **Healthy spike** | Trace runs, **no gate** | "Same visual spike — but conversions are up and a promo is live. No alert fatigue." |
| 6 | **Brand safety** | Escalate verdict + evidence | "Brand tone mismatch in conversation context — escalate, not auto-pause." |
| 7 | **Zero-conv burn** | Gate opens with burn evidence | "£340 spent in 6h, zero conversions. Agent recommends pause with high confidence." |
| 8 | **Guardrail cap** | Red banner, instant pause | "Hard budget cap — **rules, not LLM** — fires in milliseconds." |
| 9 | **Export audit log** | JSON download | "Full audit trail: every alert, tool call, decision, and action." |

### "Is this actually agentic?" (30 seconds)

Three tiers of intelligence:
1. **Rules** (`guardrail_cap`, charter): instant, deterministic, zero LLM cost
2. **Agent** (`healthy_spike` vs `bad_spike`): identical spike shape → different verdict after tool calls + reasoning
3. **Policy layer**: escalation engine tightens or loosens the human gate based on client tier, confidence, and exposure — configurable in `config/charter.yaml`

---

## The 5 scenarios

| ID | Spend injected | Agent runs | Verdict | Human gate? |
|----|----------------|------------|---------|-------------|
| `healthy_spike` | 4× £88, conversions up 38% | ✓ | healthy · 0.92 | No — logged only |
| `bad_spike` | 4× £88, conversions flat | ✓ | act · 0.88 | **Yes** |
| `brand_safety` | Layoffs context near upbeat creative | ✓ | escalate · 0.71 | **Yes** |
| `zero_conv_burn` | £340 spend, 0 conversions | ✓ | act · 0.91 | **Yes** |
| `guardrail_cap` | Client hits daily budget | ✗ (guardrail) | — | No — instant pause |

`healthy_spike` and `bad_spike` inject identical spend events. The difference is what the tool calls return.

---

## Dashboard

| Section | Description |
|---------|-------------|
| **Agent Watch Banner** | Live agent status — idle / investigating / verdict ready — with animated tool-call progress bar |
| **Day Summary** | Portfolio KPIs (budget %, active placements, open alerts, advertisers) + hourly spend area chart + per-advertiser health rows |
| **Guardrail Alerts** | Slide-in panel when a budget cap or blocklist rule fires; shows severity + reason |
| **Reasoning Trace** | Staggered tool-call reveal → evidence → verdict badge + confidence bar + human-gate indicator |
| **Client Placement Grid** | Per-client spend vs budget + placement cards with sparklines, health glow, and velocity |
| **Scenario Lab** | 5 color-coded scenario triggers + reset; progress bar on active run |
| **Alerts Inbox** | Open vs resolved, guardrail vs agent badges, approval gate CTA for pending-human alerts |
| **Audit Export** | One-click JSON download of all alerts, investigations, tool calls, and actions |
| **Approval Gate** | Right slide-over with investigation evidence, confidence score, recommended action, and three decision buttons |

---

## Configuration

Edit `config/charter.yaml` to tune guardrail policy:

```yaml
guardrails:
  absolute_daily_cap_gbp: 20000
  blocklisted_conversation_topics:
    - self_harm
    - minors
    - explicit_politics
  auto_pause:
    on_hard_cap: true

clients:
  acme_retail:
    tier: standard
    daily_budget_gbp: 2000
    brand_risk: low
  northwind_travel:
    tier: enterprise
    daily_budget_gbp: 8000
    brand_risk: medium
  contoso_fintech:
    tier: standard
    daily_budget_gbp: 1500
    brand_risk: high
```

Escalation policy (`src/server/agent/escalation.ts`):
- `enterprise` client → always requires human
- Agent confidence `< 0.75` → requires human
- Exposure `> £500` → requires human
- Brand safety ambiguous → requires human

---

## Tech stack

| | |
|--|--|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| AI | Anthropic Claude Sonnet (optional) |
| Streaming | SSE (Server-Sent Events) |
| Charts | Pure SVG (no chart library) |
| Fonts | Syne · DM Sans · IBM Plex Mono |
| Deploy | Vercel |

---

## API

| Method | Path | Body / Params | Purpose |
|--------|------|---------------|---------|
| `GET` | `/api/events/stream` | — | SSE stream (init + live events) |
| `POST` | `/api/demo/scenario` | `{ scenarioId }` | Trigger a demo scenario |
| `POST` | `/api/demo/reset` | — | Reset to calm state |
| `POST` | `/api/alerts/resolve` | `{ id, status }` | Approve / override / dismiss alert |
| `GET` | `/api/investigations` | `?id=` | Fetch investigation by ID |
| `GET` | `/api/audit/export` | — | Download full audit JSON |

---

## Project structure

```
config/
  charter.yaml              Guardrail policy: caps, blocklist, client tiers
  brands/                   Per-client brand guidelines

src/
  app/
    api/                    API routes: stream, demo, alerts, audit
    (app)/                  Dashboard pages
  components/
    agent/                  AgentWatchBanner, ReasoningTrace
    alerts/                 ApprovalGate
    dashboard/              DaySummary, PlacementCard, DemoControls, GuardrailAlerts, AlertsPanel
    layout/                 AppSidebar, DashboardHeader
  server/
    ingest/hub.ts           Singleton orchestrator — event routing, broadcast, state
    guardrails/             Accumulator + rules engine + charter loader
    agent/                  Orchestrator, Claude integration, tool runner, escalation rules
    mock/                   Stream generator, scenario event builders, fixtures
    audit/                  Audit log entry creator
  lib/
    store/dashboard-store.ts  Zustand store — all client state + applyMessage()
    spend/                    Hourly bucket metrics, day summary aggregation
    format.ts                 GBP formatting, channel styles
  hooks/
    use-spend-stream.ts     EventSource hook — connects to SSE, feeds store
  types/
    index.ts                Client, Placement, Alert, Investigation, SpendEvent
    stream.ts               StreamMessage discriminated union
```

---

## Deploy

1. Push to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repo
3. Root directory: `.`
4. Add env vars (optional): `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
5. Deploy — `main` branch auto-deploys

---

## Troubleshooting

**500 / `Cannot find module './873.js'` / `__webpack_modules__[moduleId] is not a function`**

Stale `.next` cache. Fix with one command:

```bash
npm run dev:clean
```

Or manually: stop all terminals running Next → `npm run clean && npm run dev` → hard-refresh (`Ctrl+Shift+R`).

Run only **one** dev server at a time. Use the URL printed by the terminal you just started.

---

## Out of scope

Real ad APIs · multi-tenant auth · bidding optimisation · cross-channel reporting · persistent database · production rate limiting

---

*Sentinel is a hackathon prototype demonstrating agentic architecture patterns for ad operations.*
