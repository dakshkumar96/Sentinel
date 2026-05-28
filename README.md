# Sentinel

Agentic spend guardian for AI-channel advertising — built for agencies.

**Status:** Hackathon demo complete — live dashboard, guardrails, agent (Claude or mock), HITL slide-over, audit export.

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
| ✅ | **Brand-safety review** | `brand_safety` scenario — agent checks conversation + brand guidelines; uses Claude when `ANTHROPIC_API_KEY` is set, else mock. |
| ✅ | **Zero-conversion burn** | `zero_conv_burn` scenario — spend burst, agent recommends pause with HITL gate. |
| ✅ | **Escalation tuning** | Healthy spike skips human gate; bad spike asks for approval — hard-coded per scenario + charter tighten rules. |
| ✅ | **Human-in-the-loop gates** | Slide-over **approval gate** — Approve / Override / Dismiss with evidence; auto-opens on `pending_human` agent alerts. |
| ✅ | **Alert sidebar** | Open vs resolved, guardrail vs agent badges, escalation counts, review → approval gate. |
| ✅ | **Agent reasoning trace** | Tools stage sequentially, evidence, verdict, confidence; Claude or mock per `ANTHROPIC_API_KEY`. |
| ✅ | **Audit log export** | Download JSON (`/api/audit/export`) — alerts, investigations, actions, pauses. |

**Not on the dashboard (by design):** bidding/optimization, full cross-channel reporting, or replacing platform-native hard budget controls.

See [PLAN.md](./PLAN.md) for post-hackathon items (real ad APIs, learning from feedback).

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

Optional: set `ANTHROPIC_API_KEY` (and `ANTHROPIC_MODEL` if needed) in Vercel for live Claude investigations; without it, the mock agent runs the same demo flows.

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
