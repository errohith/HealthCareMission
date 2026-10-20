# Diabetes Patient Management UI

React + TypeScript (Vite) front end for the FastAPI service in the parent folder.

| Screen | Route | API |
| --- | --- | --- |
| Add Encounter | `#/add` | `POST /encounters` |
| Search Patient (by patient number and/or risk level and/or risk score) | `#/search` | `GET /encounters/search` |
| High-Risk Queue (encounter ids link to Status Tracking) | `#/high-risk` | `GET /care-queue/high` |
| Status Tracking | `#/status/<encounterId>` | `GET` / `PATCH /interventions/{id}` |

## Run

Start the API first (`uvicorn main:app --reload` in the parent folder), then:

```bash
npm install
npm run dev        # http://localhost:5173
```

Requests go to `/api/...`, which `vite.config.ts` proxies to `http://localhost:8000`
(override with `API_URL=http://host:port npm run dev`).

## Code layout

- `src/api.ts` – typed functions for every endpoint, with FastAPI error messages surfaced as `ApiError`
- `src/screens/` – one component per screen
- `src/components/` – icons and logo (inline SVG), badges, form field, alerts
- `src/routes.ts` – hash routing

The Status Tracking "Updates" list shows changes made in the current browser session; the API stores only the latest state of each intervention.

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
```
