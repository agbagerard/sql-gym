export const SCHEMA_SQL = `
-- =========================================================================
-- users + events  (Exercise 1: First Touch, reused by Exercise 5: Orphan Join)
-- =========================================================================
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  signed_up_at TEXT NOT NULL
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_time TEXT NOT NULL
);

INSERT INTO users (id, name, signed_up_at) VALUES
  (1, 'Ada Lovelace',   '2026-01-15 10:00:00'),
  (2, 'Linus Torvalds', '2026-02-03 14:30:00'),
  (3, 'Grace Hopper',   '2026-03-22 09:15:00');

-- Users 1 and 2 have events BEFORE their signup row's signed_up_at.
-- That is the messy reality of product analytics: anonymous events get
-- stitched to a user record once they sign up.
INSERT INTO events (id, user_id, event_type, event_time) VALUES
  (1, 1, 'view_pricing',   '2026-01-15 09:42:00'),
  (2, 1, 'signup',         '2026-01-15 10:00:00'),
  (3, 1, 'create_project', '2026-01-15 10:12:00'),

  (4, 2, 'view_landing',   '2026-02-01 11:05:00'),
  (5, 2, 'view_pricing',   '2026-02-02 16:20:00'),
  (6, 2, 'signup',         '2026-02-03 14:30:00'),
  (7, 2, 'invite_team',    '2026-02-03 14:55:00'),

  (8, 3, 'signup',         '2026-03-22 09:15:00'),
  (9, 3, 'create_project', '2026-03-22 09:30:00');

-- =========================================================================
-- event_log  (Exercise 2: The Duplicate Trap)
-- The upstream broker is at-least-once: same delivery_id can appear twice,
-- with slightly different received_at because the broker retried.
-- =========================================================================
CREATE TABLE event_log (
  delivery_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  received_at TEXT NOT NULL
);

INSERT INTO event_log (delivery_id, user_id, event_type, received_at) VALUES
  ('dlv-001', 1, 'view_pricing',  '2026-01-15 09:42:00'),
  ('dlv-002', 1, 'signup',        '2026-01-15 10:00:00'),
  ('dlv-002', 1, 'signup',        '2026-01-15 10:00:13'),
  ('dlv-003', 1, 'create_project','2026-01-15 10:12:00'),
  ('dlv-006', 1, 'view_pricing',  '2026-01-22 14:20:00'),
  ('dlv-004', 2, 'view_landing',  '2026-02-01 11:05:00'),
  ('dlv-005', 2, 'signup',        '2026-02-03 14:30:00'),
  ('dlv-005', 2, 'signup',        '2026-02-03 14:31:02');

-- =========================================================================
-- signups  (Exercise 3: The 40% Drop)
-- All timestamps stored in UTC. The product is Pacific-time (PDT = UTC-7).
-- Last week's Pacific schedule:
--   Sun Jun 21: 2 evening signups (18, 20 PDT)
--   Mon Jun 22: 6 signups across 10-20 PDT (standard distribution)
--   Tue Jun 23: 6 signups but unusually evening-heavy (10 + 19..23 PDT)
--   Wed/Thu/Fri Jun 24-26: 6 signups each, standard distribution
-- =========================================================================
CREATE TABLE signups (
  id INTEGER PRIMARY KEY,
  signed_up_at_utc TEXT NOT NULL
);

INSERT INTO signups (id, signed_up_at_utc) VALUES
  -- Sun Jun 21 evening Pacific (lands in Mon UTC)
  ( 1, '2026-06-22 01:00:00'),  -- 18:00 PDT Sun
  ( 2, '2026-06-22 03:00:00'),  -- 20:00 PDT Sun
  -- Mon Jun 22 Pacific
  ( 3, '2026-06-22 17:00:00'),  -- 10:00 PDT Mon
  ( 4, '2026-06-22 19:00:00'),  -- 12:00 PDT Mon
  ( 5, '2026-06-22 21:00:00'),  -- 14:00 PDT Mon
  ( 6, '2026-06-22 23:00:00'),  -- 16:00 PDT Mon
  ( 7, '2026-06-23 01:00:00'),  -- 18:00 PDT Mon (rolls to Tue UTC)
  ( 8, '2026-06-23 03:00:00'),  -- 20:00 PDT Mon (rolls to Tue UTC)
  -- Tue Jun 23 Pacific (evening-heavy day)
  ( 9, '2026-06-23 17:00:00'),  -- 10:00 PDT Tue (the only daytime one)
  (10, '2026-06-24 02:00:00'),  -- 19:00 PDT Tue (rolls to Wed UTC)
  (11, '2026-06-24 03:00:00'),  -- 20:00 PDT Tue
  (12, '2026-06-24 04:00:00'),  -- 21:00 PDT Tue
  (13, '2026-06-24 05:00:00'),  -- 22:00 PDT Tue
  (14, '2026-06-24 06:00:00'),  -- 23:00 PDT Tue
  -- Wed Jun 24 Pacific
  (15, '2026-06-24 17:00:00'),
  (16, '2026-06-24 19:00:00'),
  (17, '2026-06-24 21:00:00'),
  (18, '2026-06-24 23:00:00'),
  (19, '2026-06-25 01:00:00'),
  (20, '2026-06-25 03:00:00'),
  -- Thu Jun 25 Pacific
  (21, '2026-06-25 17:00:00'),
  (22, '2026-06-25 19:00:00'),
  (23, '2026-06-25 21:00:00'),
  (24, '2026-06-25 23:00:00'),
  (25, '2026-06-26 01:00:00'),
  (26, '2026-06-26 03:00:00'),
  -- Fri Jun 26 Pacific
  (27, '2026-06-26 17:00:00'),
  (28, '2026-06-26 19:00:00'),
  (29, '2026-06-26 21:00:00'),
  (30, '2026-06-26 23:00:00'),
  (31, '2026-06-27 01:00:00'),
  (32, '2026-06-27 03:00:00');

-- =========================================================================
-- orders + refunds  (Exercise 4: Refunds & Revenue, Exercise 5: Orphan Join)
-- Order 4 references user_id 999, which doesn't exist in users.
-- Order 3 was fully refunded.
-- =========================================================================
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  ordered_at TEXT NOT NULL
);

CREATE TABLE refunds (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  refunded_at TEXT NOT NULL
);

INSERT INTO orders (id, user_id, amount_cents, ordered_at) VALUES
  (1,   1, 5000,  '2026-05-10 14:00:00'),
  (2,   1, 2500,  '2026-05-15 11:30:00'),
  (3,   2, 3000,  '2026-05-20 09:00:00'),
  (4, 999, 10000, '2026-05-22 16:45:00');

INSERT INTO refunds (id, order_id, amount_cents, refunded_at) VALUES
  (1, 3, 3000, '2026-05-25 10:00:00');

-- =========================================================================
-- session_events  (Exercise 6: Sessionize)
-- "30-minute gap" rule: a gap of 30 minutes or more from the previous event
-- starts a new session.
-- =========================================================================
CREATE TABLE session_events (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_time TEXT NOT NULL
);

INSERT INTO session_events (id, user_id, event_time) VALUES
  (1, 1, '2026-06-22 10:00:00'),
  (2, 1, '2026-06-22 10:20:00'),  -- 20 min gap → same session
  (3, 1, '2026-06-22 11:00:00'),  -- 40 min gap → new session
  (4, 1, '2026-06-22 11:10:00'),  -- 10 min gap → same session
  (5, 1, '2026-06-22 14:30:00'),  -- 200 min gap → new session
  (6, 2, '2026-06-22 09:00:00'),
  (7, 2, '2026-06-22 09:15:00');  -- 15 min gap → same session
`;
