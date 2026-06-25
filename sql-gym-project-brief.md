# SQL Gym — Project Brief

> Foundation doc for the Cowork/Claude Code project. This defines the **smallest shippable version** — the thing a stranger can react to this week — not the eventual platform. Scope discipline is the whole point.

---

## 1. One-line scope (confirm or redline this)

**A free, in-browser set of ~6 judgment-based SQL exercises built on realistically messy data — where the obvious query is a silent bug, and the explanation teaches you *why* it's wrong.**

That's the wedge. Not "another SQL practice site." The thing competitors (sql-practice.online, DataLemur, StrataScratch) structurally *can't* do because they auto-grade: teach judgment on dirty, real-world data with an opinionated human voice.

---

## 2. What we are explicitly NOT building yet

Killing these on purpose. They are the "Duolingo for SQL" scope creep, and every one of them is a reason to delay shipping:

- ❌ User accounts / auth
- ❌ Streaks, XP, gamification, spaced repetition
- ❌ A database backend (no Supabase yet)
- ❌ Payments / paywall / tiers
- ❌ 128 lessons / full curriculum
- ❌ Mobile app
- ❌ Multiple SQL dialects

All of that is *post-evidence*. None of it ships in v1. If a stranger doesn't pull toward 6 free exercises, none of the above would have saved it.

---

## 3. Stack & architecture (decided — change only with reason)

- **SQL execution: client-side, in the browser, via `sql.js`** (SQLite compiled to WASM). No backend, no server cost, instant. The schemas + seed data ship as a static `.sql` string loaded into an in-memory SQLite DB per session.
- **Framework:** Next.js + React (your existing stack).
- **Styling:** Tailwind. (Pull the `frontend-design` skill before building UI — don't ship default-looking.)
- **Hosting:** Vercel, static. Free. Deployable day one.
- **Editor:** CodeMirror 6 with SQL syntax highlighting.
- **Answer checking:** run the user's query against the in-memory DB, compare the result set to the expected result set (order-insensitive unless the exercise tests ordering). No "match the exact string" — match the data.

This stack means **zero infra, zero cost, and a live URL within the first build session.**

---

## 4. Project structure

```
sql-gym/
├── app/
│   ├── page.tsx                 # landing → list of exercises
│   ├── exercise/[slug]/page.tsx # single exercise view
│   └── layout.tsx
├── components/
│   ├── SqlEditor.tsx            # CodeMirror wrapper
│   ├── ResultsTable.tsx         # renders query output
│   ├── ExercisePrompt.tsx       # the scenario + task
│   └── FeedbackPanel.tsx        # the "why the obvious answer is wrong" reveal
├── lib/
│   ├── db.ts                    # sql.js init, load schema, run query
│   └── checkAnswer.ts           # compare result sets
├── data/
│   ├── schemas.sql              # all table defs + dirty seed data
│   └── exercises.ts             # exercise definitions (see §5)
├── DISTRIBUTION.md              # see §6 — first-class, not an afterthought
└── README.md
```

The whole app is ~6 components and two data files. That's the point.

---

## 5. The 6 starter exercises (the actual content moat)

Each exercise = `{ slug, scenario, task, expectedResult, theObviousWrongAnswer, whyItsWrong, oneCorrectAnswer }`. The dirty data lives in `schemas.sql`.

1. **First Touch** — return each user's first event. (The one you already posted: `MIN()` + ungrouped column = silent bug on MySQL; user signs up *after* viewing pricing.)
2. **The Duplicate Trap** — at-least-once event delivery means real duplicate rows. Dedup without nuking legitimate repeat events. (`ROW_NUMBER` vs naive `DISTINCT`.)
3. **The 40% Drop** — "Marketing says signups fell 40% last Tuesday — real, or a tracking bug?" Forces translating a vague business panic into SQL. The drop is a timezone artifact.
4. **Refunds & Revenue** — a judgment call with no syntactically-correct escape: does a refunded order count as revenue? Defend the choice. Senior-vs-junior line.
5. **The Orphan Join** — a user in `orders` who isn't in `users` (broken FK). An `INNER JOIN` silently drops their revenue. Find the leak.
6. **Sessionize** — group events into sessions where a 30-min gap starts a new one. `LAG` + running sum. The "where's the rest?" cliffhanger lands here.

Difficulty ramps 1→6. Each ends with a one-line teaser for the next. **Exercise 6 is the hook** — it's the one that should make people want a milestone 7 that doesn't exist yet.

---

## 6. Distribution plan (DISTRIBUTION.md) — the part that makes this not-Ethonode

Definition of done is **not** "the app works." It's **"a stranger reacted to it."** Build to that bar.

**Where the first 50 users come from (name them before coding):**
- Attempt 2 of the Reddit post (r/SQL or r/dataengineering) — *the move you didn't finish.* Post Exercise 1 again, tuned for the room, with a link to the live site at the bottom.
- A "I built a free SQL gym that teaches the traps, not the syntax" post once the site is live.
- The exercises double as SEO/content: each exercise's "why the obvious answer is wrong" is a standalone post.

**The signal we're building toward:** someone we've never met says *"is there more of these?"* or shares it. That's the green light for §2's roadmap. Until then, v1 stays v1.

**Rule:** the day the build is "done," the very next action is to post it. Not polish. Post.

---

## 7. Build sequence

1. `sql.js` loads, runs a hardcoded query against a seeded in-memory DB, prints results. *(Prove the hard part first.)*
2. `schemas.sql` + Exercise 1 wired end to end: prompt → editor → run → results → check → feedback reveal.
3. Remaining 5 exercises as data.
4. Landing page listing the 6.
5. `frontend-design` pass so it doesn't look templated.
6. Deploy to Vercel. **Post it the same day.**

Steps 1–2 are the real work and prove the whole concept. If step 1 fights you, stop and tell me — don't grind on it silently.
