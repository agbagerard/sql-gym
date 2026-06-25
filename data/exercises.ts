export type Cell = string | number | null;

export type ResultSet = {
  columns: string[];
  rows: Cell[][];
};

export type Exercise = {
  slug: string;
  title: string;
  hook: string;
  scenario: string;
  task: string;
  starterSql: string;
  expected: ResultSet;
  orderMatters: boolean;
  obviousAnswer: string;
  whyWrong: string;
  correctAnswer: string;
  matchIsTrap?: boolean;
};

const firstTouch: Exercise = {
  slug: "first-touch",
  title: "First Touch",
  hook: "A MIN() query that's correct on SQLite and silently wrong on MySQL.",
  scenario:
    "Marketing wants to know each user's **first touch** — the first event they ever logged on the site. They're trying to figure out which channel actually pulled people in.\n\nTable: `events(user_id, event_type, event_time)`.",
  task:
    "Return one row per user with their `user_id`, the `event_type` of their earliest event, and the `event_time` of that event.",
  starterSql:
    "-- the obvious query — but is it correct?\nSELECT user_id, event_type, MIN(event_time) AS event_time\nFROM events\nGROUP BY user_id;",
  expected: {
    columns: ["user_id", "event_type", "event_time"],
    rows: [
      [1, "view_pricing", "2026-01-15 09:42:00"],
      [2, "view_landing", "2026-02-01 11:05:00"],
      [3, "signup", "2026-03-22 09:15:00"],
    ],
  },
  orderMatters: false,
  matchIsTrap: true,
  obviousAnswer:
    "SELECT user_id, event_type, MIN(event_time) AS event_time\nFROM events\nGROUP BY user_id;",
  whyWrong:
    "On SQLite this happens to return the right `event_type` — SQLite has a special rule that bare columns alongside `MIN()`/`MAX()` come from the row that matched. That rule does NOT exist in MySQL's default mode or in older Postgres setups, where `event_type` would come from an arbitrary row in the group. Same query, same data, silently wrong answer in production. Ask for the matching row explicitly with a self-join or a window function.",
  correctAnswer:
    "SELECT e.user_id, e.event_type, e.event_time\nFROM events e\nJOIN (\n  SELECT user_id, MIN(event_time) AS first_time\n  FROM events\n  GROUP BY user_id\n) f ON f.user_id = e.user_id AND f.first_time = e.event_time;",
};

const duplicateTrap: Exercise = {
  slug: "duplicate-trap",
  title: "The Duplicate Trap",
  hook: "At-least-once delivery. DISTINCT and COUNT(*) both lie to you, in different directions.",
  scenario:
    "The upstream message broker guarantees **at-least-once** delivery. Engineering told you this in passing; nobody wrote it down. Some rows in `event_log` are the same logical event delivered twice — same `delivery_id`, but slightly different `received_at` because the broker retried.\n\nTable: `event_log(delivery_id, user_id, event_type, received_at)`.",
  task:
    "Return one row per user with their `user_id` and the number of **distinct** events they generated. Legitimate repeat events (same user, same event type, different occurrences) should still count separately.",
  starterSql:
    "-- the obvious query — careful with at-least-once delivery\nSELECT user_id, COUNT(*) AS event_count\nFROM event_log\nGROUP BY user_id;",
  expected: {
    columns: ["user_id", "event_count"],
    rows: [
      [1, 4],
      [2, 2],
    ],
  },
  orderMatters: false,
  obviousAnswer:
    "SELECT user_id, COUNT(*) AS event_count\nFROM event_log\nGROUP BY user_id;",
  whyWrong:
    "`COUNT(*)` counts physical rows, not logical events. With at-least-once delivery, duplicated rows inflate the count. The instinct to use `COUNT(DISTINCT event_type)` is also a trap — it collapses legitimate repeat events (e.g., a user viewing pricing twice on separate days). The unique identifier is `delivery_id`. Dedupe on that.",
  correctAnswer:
    "SELECT user_id, COUNT(DISTINCT delivery_id) AS event_count\nFROM event_log\nGROUP BY user_id;",
};

const fortyPercentDrop: Exercise = {
  slug: "forty-percent-drop",
  title: "The 40% Drop",
  hook: "Marketing says Tuesday signups fell off a cliff. The cliff is a timezone.",
  scenario:
    "Marketing is in a panic: \"Signups fell ~50% last Tuesday (Jun 23). Real, or a tracking bug?\" The product is US-only, users skew Pacific. The `signups` table stores `signed_up_at_utc` in UTC. PDT = UTC-7 for this date range.\n\nTable: `signups(id, signed_up_at_utc)`.",
  task:
    "Show the daily signup count for Jun 21–26, **bucketed by Pacific local date** (`local_date`, `signups`), ordered by `local_date`. Confirm or refute the drop.",
  starterSql:
    "-- the obvious query — what timezone does this group by?\nSELECT DATE(signed_up_at_utc) AS local_date, COUNT(*) AS signups\nFROM signups\nGROUP BY local_date\nORDER BY local_date;",
  expected: {
    columns: ["local_date", "signups"],
    rows: [
      ["2026-06-21", 2],
      ["2026-06-22", 6],
      ["2026-06-23", 6],
      ["2026-06-24", 6],
      ["2026-06-25", 6],
      ["2026-06-26", 6],
    ],
  },
  orderMatters: true,
  obviousAnswer:
    "SELECT DATE(signed_up_at_utc) AS local_date, COUNT(*) AS signups\nFROM signups\nGROUP BY local_date\nORDER BY local_date;",
  whyWrong:
    "`DATE(signed_up_at_utc)` buckets by **UTC** date, not Pacific. The UTC day boundary cuts through 5pm Pacific. On Jun 23 Pacific, signups were unusually evening-heavy — most of them rolled into Jun 24 UTC, leaving Jun 23 UTC with only 3 signups. To marketing's dashboard that looked like a 50% drop; in Pacific local time the day was perfectly normal. Whenever a column is `_utc` and the business is in one timezone, convert before bucketing.",
  correctAnswer:
    "SELECT DATE(signed_up_at_utc, '-7 hours') AS local_date, COUNT(*) AS signups\nFROM signups\nGROUP BY local_date\nORDER BY local_date;",
};

const refundsAndRevenue: Exercise = {
  slug: "refunds-and-revenue",
  title: "Refunds & Revenue",
  hook: "Does a refunded order count as revenue? Pick a side and write the query that defends it.",
  scenario:
    "Finance asks you for **net revenue per user**. The `orders` table has every order ever placed. The `refunds` table records refunds against those orders (an order can be partially or fully refunded; in this dataset, refunds are full).\n\nTables: `orders(id, user_id, amount_cents, ordered_at)`, `refunds(id, order_id, amount_cents, refunded_at)`.",
  task:
    "Return `user_id` and `net_revenue_cents` (orders minus refunds) for every user who has ever placed an order. Include users whose net is zero. Order by `user_id`.",
  starterSql:
    "-- the obvious query — does it answer the question?\nSELECT user_id, SUM(amount_cents) AS net_revenue_cents\nFROM orders\nGROUP BY user_id\nORDER BY user_id;",
  expected: {
    columns: ["user_id", "net_revenue_cents"],
    rows: [
      [1, 7500],
      [2, 0],
      [999, 10000],
    ],
  },
  orderMatters: true,
  obviousAnswer:
    "SELECT user_id, SUM(amount_cents) AS net_revenue_cents\nFROM orders\nGROUP BY user_id\nORDER BY user_id;",
  whyWrong:
    "Gross revenue, not net. A refunded order's row is still in `orders` — it doesn't get deleted when the refund is issued; instead, a row gets inserted in `refunds`. If you report this number to finance as \"net revenue,\" you're overstating it. The senior judgment call is to subtract refunds **per user**, not as one global adjustment, so a single big refund doesn't get smeared across customers who paid in full.",
  correctAnswer:
    "WITH gross AS (\n  SELECT user_id, SUM(amount_cents) AS amt\n  FROM orders GROUP BY user_id\n),\nrefunded AS (\n  SELECT o.user_id, SUM(r.amount_cents) AS amt\n  FROM refunds r JOIN orders o ON o.id = r.order_id\n  GROUP BY o.user_id\n)\nSELECT g.user_id, g.amt - COALESCE(r.amt, 0) AS net_revenue_cents\nFROM gross g LEFT JOIN refunded r ON r.user_id = g.user_id\nORDER BY g.user_id;",
};

const orphanJoin: Exercise = {
  slug: "orphan-join",
  title: "The Orphan Join",
  hook: "An INNER JOIN that silently eats $100 of revenue. Find the leak.",
  scenario:
    "Sales pulls last quarter's revenue numbers and the totals don't reconcile with finance — finance is ~$100 higher. You suspect a referential-integrity problem: the `users` table got rebuilt at some point and an old `user_id` no longer exists, but its orders are still in `orders`.\n\nTables: `users(id, name, signed_up_at)`, `orders(id, user_id, amount_cents, ordered_at)`.",
  task:
    "Return `user_id` and `revenue_cents` (gross — ignore refunds for this exercise) for **every user_id that has at least one order**, including orphan user_ids no longer in `users`. Order by `user_id`.",
  starterSql:
    "-- the obvious query — what does INNER JOIN drop here?\nSELECT u.id AS user_id, SUM(o.amount_cents) AS revenue_cents\nFROM users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.id\nORDER BY u.id;",
  expected: {
    columns: ["user_id", "revenue_cents"],
    rows: [
      [1, 7500],
      [2, 3000],
      [999, 10000],
    ],
  },
  orderMatters: true,
  obviousAnswer:
    "SELECT u.id AS user_id, SUM(o.amount_cents) AS revenue_cents\nFROM users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.id\nORDER BY u.id;",
  whyWrong:
    "`INNER JOIN` silently drops orders whose `user_id` doesn't match any row in `users`. That's the orphan: user 999's order vanishes from the report, and you'd never know unless you cross-checked totals. The simpler fix is to recognize you don't need to start from `users` at all — the question is about orders, so aggregate `orders` directly. When you DO need user metadata, use `LEFT JOIN orders u ON ...` starting from `orders`.",
  correctAnswer:
    "SELECT user_id, SUM(amount_cents) AS revenue_cents\nFROM orders\nGROUP BY user_id\nORDER BY user_id;",
};

const sessionize: Exercise = {
  slug: "sessionize",
  title: "Sessionize",
  hook: "Group events into sessions with a 30-min gap rule. LAG + running sum — the cliffhanger.",
  scenario:
    "Product wants to know how many distinct **sessions** each user has. Definition: a session is a run of events with **less than 30 minutes** between consecutive events. A gap of 30 minutes or more starts a new session.\n\nTable: `session_events(id, user_id, event_time)`.",
  task:
    "Label each row with `session_id` (1-indexed per user) so events in the same session share a `session_id`. Return `user_id, event_time, session_id` ordered by `user_id, event_time`.",
  starterSql:
    "-- start here. hint: LAG to see the previous event_time per user,\n-- then a running sum of \"new session\" flags.\nSELECT user_id, event_time\nFROM session_events\nORDER BY user_id, event_time;",
  expected: {
    columns: ["user_id", "event_time", "session_id"],
    rows: [
      [1, "2026-06-22 10:00:00", 1],
      [1, "2026-06-22 10:20:00", 1],
      [1, "2026-06-22 11:00:00", 2],
      [1, "2026-06-22 11:10:00", 2],
      [1, "2026-06-22 14:30:00", 3],
      [2, "2026-06-22 09:00:00", 1],
      [2, "2026-06-22 09:15:00", 1],
    ],
  },
  orderMatters: true,
  obviousAnswer:
    "SELECT user_id, event_time,\n       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time) AS session_id\nFROM session_events\nORDER BY user_id, event_time;",
  whyWrong:
    "`ROW_NUMBER` numbers every event individually — every row becomes its own session. The trick is **gap detection**: for each row, look at the previous row's `event_time` with `LAG`, decide whether the gap crosses 30 minutes, then take a running `SUM` of those flags per user. That running sum is the session id.\n\nThis is the technique that unlocks most of streaming-style analytics in SQL (funnels, retention, session attribution). When you find yourself reaching for a loop, reach for `LAG` + running sum instead.",
  correctAnswer:
    "WITH flagged AS (\n  SELECT\n    user_id,\n    event_time,\n    CASE\n      WHEN (julianday(event_time) -\n            julianday(LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time))) * 24 * 60 >= 30\n      THEN 1 ELSE 0\n    END AS is_new_session\n  FROM session_events\n)\nSELECT\n  user_id,\n  event_time,\n  1 + SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_time) AS session_id\nFROM flagged\nORDER BY user_id, event_time;",
};

export const EXERCISES: Exercise[] = [
  firstTouch,
  duplicateTrap,
  fortyPercentDrop,
  refundsAndRevenue,
  orphanJoin,
  sessionize,
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}
