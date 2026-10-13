# Demo Video Script (3-5 minutes)

Record with QuickTime (File > New Screen Recording) or Cmd+Shift+5. Before recording:

```bash
source .venv/bin/activate
uvicorn main:app --reload        # leave running; open http://127.0.0.1:8000/docs
```

Have three windows ready: this repo in VS Code, a terminal, and Swagger in the browser.
Pick the HIGH-risk encounter **168920160** for the workflow demo.

---

## 1. The problem (~30s): README

> "A hospital's care-management team can't review every discharged diabetes patient. The decision
> this app supports is: *which recently discharged patients should we review first?* I built the
> workflow around that decision, not a model: ingest, score with an explainable rule, queue,
> track interventions, and measure against historical outcomes."

Scroll briefly over the **FDE Discovery** table: what we know, what we don't, the hypothesis.

## 2. Architecture and the leakage rule (~45s): VS Code

- Show the file list: `data_loader -> PostgreSQL <- repository <- service <- main`.
- Open `service.py` and show `calculate_risk_score`:
  > "These are the five rules from the brief. Notice `readmitted` is never read here; it's only
  > used later in `get_readmission_analysis` to evaluate the rule."
- Show `EXCLUDED_DISCHARGE_DISPOSITIONS`:
  > "One FDE judgment call: 188 MEDIUM/HIGH patients were discharged as expired or to hospice.
  > Nobody can call them, so they're excluded from the queue."
- Open `repository.py` briefly: "Only parameterized SQL lives here."

## 3. Load the data (~30s): terminal

```bash
python data_loader.py
```

> "The loader prints a cleanup report: missing values, invalid outcomes, duplicates. It loads
> 101,766 encounters and creates 8,350 queue entries. It's safe to re-run: no duplicates, and
> existing care-team work is kept."

Optionally show the PostgreSQL screenshot or run `psql -f docs/screenshots/verify_queries.sql`.

## 4. The care-management workflow (~1m15s): Swagger

1. `GET /care-queue/high` with `limit=5`:
   "Highest-score patients first, each with a PENDING_REVIEW intervention."
2. `PATCH /interventions/168920160` using the example body (CONTACTED / Care Team A).
   Point out that `updated_at` changed.
3. Error handling, quickly:
   - `PATCH /interventions/999` returns **404**, because the encounter doesn't exist.
   - `PATCH` a LOW-risk encounter (e.g. `12522`) returns **409** with the reason.
   - `status: "DONE"` returns **422** with the allowed values.
4. Restart uvicorn (Ctrl+C, then run it again) and call `GET /care-queue/high?limit=1`:
   "The status is still CONTACTED. It's persisted in PostgreSQL."

## 5. Metrics and outcomes (~1m): Swagger

1. `GET /operations/summary`: "Workload view: 8,350 in the queue, now split into pending,
   in-progress and completed."
2. `GET /operations/readmission-analysis`, which is the key slide:
   > "Baseline <30-day readmission is 11.16%. HIGH risk is 28.58%, about 2.6x baseline.
   > MEDIUM is 21.6%. The queue is 8.2% of encounters but captures 17.7% of all readmissions,
   > so the rule concentrates risk well."
3. `GET /management/dashboard`: "The same story in one executive view."

## 6. Honest limits and next steps (~30s)

> "What this doesn't prove: preventability or causation. And about 82% of readmissions still
> come from the LOW group, so the rule is precise but misses most cases. Before production, the
> hospital needs to validate the rule clinically, define capacity and intervention cost, and run
> a pilot. Next I'd compare a logistic regression or gradient-boosting model against this rule
> on the same metrics. Rules stay the baseline because they're auditable."

---

**After recording:** reset the demo intervention so the data is clean:

```sql
UPDATE care_interventions
SET status = 'PENDING_REVIEW', assigned_to = NULL, notes = NULL
WHERE encounter_id = 168920160;
```
