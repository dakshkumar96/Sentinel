# Sentinel

Agentic spend guardian for AI-channel advertising — built for agencies.

**Status:** Phase 1–4 demo complete — live dashboard, charter guardrails, mock agent, HITL sidebar.

## Dashboard features

Agency command center for AI-channel spend (ChatGPT-style placements, Thrad publishers, and similar).

**Legend:** ✅ Done · 🎬 Demo (scripted via scenario buttons) · 🔜 Planned

| Status | Feature | What you see |
|--------|---------|----------------|
| ✅ | **Live spend watch** | Per-client and per-placement spend updating in real time (mock SSE); calm green state by default. |
| ✅ | **Campaign & placement grid** | Cards for each client/placement with channel, status, and spend velocity. |
| ✅ | **Spend sparklines** | Spend trend per placement; turns amber/red when a scenario fires. |
| ✅ | **Demo scenario controls** | One-click triggers: `healthy_spike`, `bad_spike`, `brand_safety`, `zero_conv_burn`, `guardrail_cap` + reset. |
| ✅ | **Guardrail alerts** | Instant alerts from `charter.yaml` on live ticks (budget cap, blocklist) + `guardrail_cap` scenario; auto-pause, no LLM. |
| ✅ | **Spend anomaly cards** | `healthy_spike` / `bad_spike` fire spend + agent investigation; cards pulse amber/red on out-of-band spend. |
| ✅ | **Brand-safety review** | `brand_safety` scenario — mock agent checks conversation + brand guidelines; escalate with evidence (no live Claude yet). |
| ✅ | **Zero-conversion burn** | `zero_conv_burn` scenario — spend burst, agent recommends pause with HITL gate. |
| ✅ | **Escalation tuning** | Healthy spike skips human gate; bad spike asks for approval — hard-coded per scenario + charter tighten rules. |
| ✅ | **Human-in-the-loop gates** | Approve / Override / Dismiss on agent alerts in the sidebar (slide-over sheet 🔜). |
| ✅ | **Alert sidebar** | Open vs resolved, guardrail vs agent badges, escalation counts, click-to-view trace. Audit log export 🔜. |
| ✅ | **Agent reasoning trace** | Tools stage sequentially, evidence, verdict, confidence, escalation outcome on main panel. |

**Not on the dashboard (by design):** bidding/optimization, full cross-channel reporting, or replacing platform-native hard budget controls.

See [PLAN.md](./PLAN.md) for remaining polish (Claude API agent, audit export, slide-over approval sheet).

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

No env vars required for the demo (mock stream + scenario-keyed agent). Add `ANTHROPIC_API_KEY` in Vercel when wiring live Claude investigations.

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
