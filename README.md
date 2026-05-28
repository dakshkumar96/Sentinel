# Sentinel

Agentic spend guardian for AI-channel advertising — built for agencies.

**Status:** Hackathon demo complete — live dashboard, charter guardrails, agent (Claude or mock), HITL slide-over, audit export.

## Dashboard features

| Feature | What you see |
|--------|----------------|
| **Live spend watch** | Per-client and per-placement spend updating in real time (mock SSE); calm green state by default. |
| **Campaign & placement grid** | Cards for each client/placement with channel, status, and spend velocity. |
| **Spend sparklines** | Spend trend per placement; turns amber/red on spikes. |
| **Demo scenario controls** | One-click triggers: `healthy_spike`, `bad_spike`, `brand_safety`, `zero_conv_burn`, `guardrail_cap` + reset. |
| **Guardrail alerts** | Instant alerts from `charter.yaml` (budget cap, blocklist) + `guardrail_cap`; auto-pause, no LLM. |
| **Spend anomaly cards** | `healthy_spike` / `bad_spike` → spend + agent investigation; cards pulse on out-of-band spend. |
| **Brand-safety review** | `brand_safety` — agent checks conversation + brand guidelines (Claude if keyed, else mock). |
| **Zero-conversion burn** | `zero_conv_burn` — spend burst, agent recommends pause with HITL gate. |
| **Escalation tuning** | Healthy spike skips human gate; bad spike asks for approval. |
| **Human-in-the-loop gates** | Slide-over approval gate — Approve / Override / Dismiss with evidence. |
| **Alert sidebar** | Open vs resolved, guardrail vs agent badges, escalation counts. |
| **Agent reasoning trace** | Tools stage sequentially, evidence, verdict, confidence. |
| **Audit log export** | Download JSON — alerts, investigations, actions, pauses. |

**Out of scope:** real ad APIs, multi-tenant auth, bidding optimization, full cross-channel reporting.

---

## Quick start

```bash
git clone https://github.com/dakshkumar96/Sentinel.git
cd Sentinel
npm install
npm run dev
```

Open **http://localhost:3000**.

### Optional: live Claude agent

```bash
cp .env.example .env.local
```

Add `ANTHROPIC_API_KEY` to `.env.local`. Without it, scenario-keyed mock agent runs the same demo flows.

### Troubleshooting

If the page is blank or errors after a git pull:

```bash
# Stop dev server (Ctrl+C), then:
rm -rf .next    # Windows PowerShell: Remove-Item -Recurse -Force .next
npm run dev
```

Hard-refresh the browser (Ctrl+Shift+R).

---

## 90-second judge demo

Use the **Demo scenarios** panel (right sidebar). Narration tips in **bold**.

| Step | Button | What happens | Say this |
|------|--------|----------------|----------|
| 1 | *(wait ~5s)* | Live spend ticks, green cards | “Calm state — one human watching many AI placements.” |
| 2 | **Bad spike** | Trace runs → **approval gate** opens | “Same 4× spike — conversions flat, no launch — agent recommends pause.” |
| 3 | **Approve** | Gate closes, placement can pause | “Human in the loop — agency approves spend decisions.” |
| 4 | **Reset** | Clean slate | |
| 5 | **Healthy spike** | Trace runs, **no gate** | “Same visual spike — conversions up, promo live — **no alert fatigue**.” |
| 6 | **Brand safety** | Escalate + evidence | “Brand context mismatch — escalate, not auto-pause.” |
| 7 | **Guardrail cap** | Red guardrail banner, instant pause | “Hard cap — **rules, not LLM** — deterministic.” |
| 8 | **Export audit log** | JSON download | “Full audit trail for compliance.” |

### “Is it agentic?” (30 seconds)

1. **Rules** — `guardrail_cap` / charter: deterministic, instant, no model.
2. **Agent** — `healthy_spike` vs `bad_spike`: same spike shape, different verdict after tools + reasoning.
3. **Meta** — escalation engine: healthy logs only; bad spike pulls a human; enterprise/low-confidence can tighten policy (`config/charter.yaml`).

---

## Deploy (Vercel)

Repo: [github.com/dakshkumar96/Sentinel](https://github.com/dakshkumar96/Sentinel)

1. [vercel.com/new](https://vercel.com/new) → Import **dakshkumar96/Sentinel**
2. **Root directory:** `.` (app is repo root)
3. Deploy — pushes to `main` auto-deploy
4. Optional env: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`

---

## API (demo)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/events/stream` | SSE live mock events |
| POST | `/api/demo/scenario` | `{ "scenarioId": "bad_spike" }` |
| POST | `/api/demo/reset` | Reset to calm state |
| GET | `/api/audit/export` | Audit JSON download |
| POST | `/api/alerts/resolve` | `{ "id", "status": "approved" }` |
| GET | `/api/investigations?id=` | Fetch investigation |

---

## Project structure

```
config/           charter.yaml, brand guidelines
src/app/          Next.js pages + API routes
src/components/   Dashboard, approval gate, reasoning trace
src/server/       Ingest hub, guardrails, agent, mock stream
src/lib/          Zustand store, spend metrics
docs/PRD.md       Product summary
PLAN.md           Architecture + phases
```

---

## Docs

- [PLAN.md](./PLAN.md) — architecture, build phases
- [docs/PRD.md](./docs/PRD.md) — product requirements
