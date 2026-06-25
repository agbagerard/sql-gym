# SQL Gym — Distribution Plan

> Definition of done is **not** "the app works." It's **"a stranger reacted to it."** Build to that bar. The day the build is done, the very next action is to post it — not polish. Post.

This doc is first-class. The product is the easy half; getting it in front of people who don't know you is the half that actually decides whether v1 was worth building.

---

## The one signal we're building toward

Someone we've never met says **"is there more of these?"** — or shares it unprompted.

That sentence is the green light for the roadmap we deliberately killed in the brief (accounts, streaks, more lessons, a backend). Until we hear it, **v1 stays v1.** No scope creep on faith.

Anti-signals to ignore: upvotes with no comments, "neat" with no follow-up, our own friends being nice. We're hunting for a *pull*, not politeness.

---

## Where the first 50 users come from (named, not hoped-for)

### 1. The Reddit re-attempt — the move we didn't finish
- **Subreddit:** r/SQL (primary). r/dataengineering as a follow-up if the first lands.
- **The post:** Exercise 1 ("First Touch") again, tuned for the room — lead with the *trap*, not the tool. Show the obvious `MIN()` + ungrouped-column query, ask the room what's wrong with it, then drop the punchline: the user "signed up before they viewed pricing" because MySQL silently picked a row.
- **The link:** live site URL at the **bottom**, framed as "I built a free thing around this idea," not as the headline. The exercise has to earn the click.
- **Why this first:** it's unfinished business. The idea already got traction once as a raw post; this time it has somewhere to send people.

### 2. The "I built it" post — once the site is live
- **Hook:** *"I built a free SQL gym that teaches the traps, not the syntax."*
- The differentiator is the whole pitch: every competitor auto-grades, so none of them can teach judgment on dirty data. Say that plainly.
- Land it where builders gather: r/SQL, r/dataengineering, Hacker News (Show HN), maybe r/datascience.

### 3. The exercises as standalone content (SEO + evergreen)
- Each exercise's "why the obvious answer is wrong" is already a self-contained post. Repackage them:
  - Short-form: a single trap as a Twitter/X or LinkedIn thread.
  - Long-form: a blog post / dev.to article per exercise, each ending with a link to try it live.
- This is the compounding channel — it keeps working after the launch-day spike fades.

---

## Launch-day checklist (do in order, same day)

1. [ ] Site is deployed and the live URL loads on a phone and a fresh browser (no cache, not logged into anything).
2. [ ] Walk all 6 exercises end-to-end on the live URL: run the obvious query, confirm the trap fires, reveal the explanation.
3. [ ] Draft the r/SQL post (trap-first, link at bottom). Read it out loud once.
4. [ ] Post it.
5. [ ] Stay in the thread for the first 2–3 hours. Reply to every comment — the conversation *is* the distribution.
6. [ ] Log what happened (see below).

**Rule restated:** the next action after "done" is step 3, not another polish pass.

---

## What to measure (lightweight — no analytics backend in v1)

We deliberately have no accounts and no DB, so measurement is manual and qualitative. That's fine for v1.

- **Comments, not clicks.** Did anyone engage with the *idea* (the trap), or just the tool?
- **The money quote.** Did anyone ask for more, or share it? Write the exact words down.
- **Where they got stuck.** Which exercise drew confusion or "wait, that's wrong?" reactions — that's signal for which trap resonates.
- If we want a single number, drop a privacy-light counter (e.g. Vercel Analytics) — but treat it as a tiebreaker, not the verdict. The verdict is the money quote.

---

## Decision gate (after the first post lands)

- **Green light** (heard "is there more?" / got shared): pick the *next* most-requested thing from the killed roadmap — usually a milestone 7, since Exercise 6 (Sessionize) is built to be the cliffhanger. One thing, not the whole roadmap.
- **Yellow** (polite, no pull): re-cut the post angle, try r/dataengineering, ship one standalone content piece. The product may be fine and the framing wrong.
- **Red** (crickets across two honest attempts): the wedge didn't wedge. Stop and rethink the premise before building more. This is the cheap failure the whole "smallest shippable version" discipline was designed to buy.
