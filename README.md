# Sentinel

Agentic spend guardian for AI-channel advertising — built for agencies.

**Status:** Phase 1 live — dashboard + mock stream + demo scenarios.

## Dashboard features

The main UI is a single agency command center for AI-channel spend (ChatGPT-style placements, Thrad publishers, and similar). Planned v1 surface:

| Feature | What you see |
|--------|----------------|
| **Live spend watch** | Per-client and per-placement spend updating in real time (mock SSE feed); calm green state by default, anomalies surface automatically. |
| **Campaign & placement grid** | Cards for each client/placement with channel, status, and spend velocity. |
| **Spend sparklines** | Hourly spend trends per placement — spikes turn red when out of band. |
| **Guardrail alerts** | Instant, non-agent flags when hard limits hit (budget cap, blocklisted context) — auto-pause with no LLM “thinking” step. |
| **Agent reasoning trace** | Step-by-step investigation: which tools ran, what they returned, conclusion, and confidence (demo hero panel). |
| **Human-in-the-loop gates** | Slide-over **Approve / Override / Pause** when judgment is ambiguous or stakes are high; evidence bundled on the card. |
| **Brand-safety review** | Flag when creative may mismatch conversation context (e.g. ad near layoffs chat) with transcript excerpt for review. |
| **Spend anomaly cards** | e.g. “4× spend in 1 hour” — agent resolves as healthy scaling vs burn vs escalate. |
| **Zero-conversion burn** | Placement spent with no conversions over a window — recommend pause with spend total. |
| **Escalation tuning** | Only high-signal issues interrupt the human; healthy spikes logged without a gate (anti–alert-fatigue story). |
| **Alert & audit sidebar** | Open vs resolved alerts, guardrail vs agent source, and a log of what the system did and why. |
| **Demo scenario controls** | One-click triggers for judge demos: `healthy_spike`, `bad_spike`, `brand_safety`, `zero_conv_burn`, `guardrail_cap`. |

**Not on the dashboard (by design):** bidding/optimization, full cross-channel reporting, or replacing platform-native hard budget controls.

Implementation status: Phase 1 complete (dashboard, SSE, scenarios). Phase 2+ (guardrails, Claude agent) — see [PLAN.md](./PLAN.md).

## Quick start

```bash
cd sentinel
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

**Blank or white page?** The dev server often breaks if `.next` was deleted while it was running. Fix:

```bash
# Ctrl+C to stop the server, then:
rm -rf .next
npm run dev
```

Hard-refresh the browser (Cmd+Shift+R).

## Deploy to production (Vercel)

Code is on `main` at [github.com/dakshkumar96/Sentinel](https://github.com/dakshkumar96/Sentinel).

**Option A — Vercel dashboard (recommended, no CLI login):**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **dakshkumar96/Sentinel**
3. Root directory: `sentinel` if the repo root is the monorepo parent, otherwise leave as **`.`** if the Next app is the repo root
4. Deploy — every push to `main` auto-deploys

**Option B — CLI:**

```bash
vercel login
cd sentinel
npx vercel --prod
```

No env vars required for Phase 1 (mock data only). Add `ANTHROPIC_API_KEY` in Vercel when Phase 3 agent work ships.

`create-next-app` is not a global command — use `npx` if scaffolding a fresh folder:

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

This repo was bootstrapped manually because `sentinel/` already had project files.

## Docs

- [PLAN.md](./PLAN.md) — architecture, phases, demo script
- [docs/PRD.md](./docs/PRD.md) — product requirements summary

## Structure

```
config/          Charter + brand guidelines (YAML)
docs/            PRD
src/app/         Next.js routes + API
src/components/  Dashboard UI
src/server/      Guardrails, agent, mock stream
src/types/       Shared TypeScript models
```
