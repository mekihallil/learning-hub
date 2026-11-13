## 🧭 36. Queries with Joins and Aggregations

**What it does:** Introduces the next section: two new ways of getting answers out of your tables. **Joins** combine rows from **different tables**. **Aggregations** boil **many rows down to one value** (a count, a total, an average).
**Why it is used:** Topics 20 to 35 split data into linked tables. That keeps it tidy, but real questions need it back together: "who wrote this comment?" or "how many photos does each user have?"
**When to use it:** Any time the answer spans more than one table, or you want a summary number instead of a list of rows.

**Analogy:** A **join** is laying two printed lists side by side and matching up the rows that belong together. An **aggregation** is the "total" line at the bottom of a receipt.

**The two tools:**

| Tool | What it does | Example question |
|---|---|---|
| **Join** | Matches rows from two tables using a shared value | "Show each comment with its author's username" |
| **Aggregation** | Collapses many rows into one result | "How many photos exist in total?" |
| **Both together** | Match first, then summarize | "How many comments does each photo have?" |

**A first taste of an aggregation:**
```sql
SELECT COUNT(*) FROM photos;
```
**Output:**
```
 count
-------
     7
(1 row)
```
`COUNT(*)` counts rows. Joins come first in this section, and the other aggregate tools (`SUM`, `AVG`, `MAX`, grouping) follow later.

**Reset your practice database.** Run this to get the exact data used in the next topics:
```sql
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50)
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(200),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  contents VARCHAR(240),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE
);

INSERT INTO users (username)
VALUES ('monahan93'), ('pferrer'), ('si93onis'), ('99stroman');

INSERT INTO photos (url, user_id)
VALUES
  ('http://one.jpg', 4), ('http://two.jpg', 1), ('http://25.jpg', 1),
  ('http://36.jpg', 1), ('http://754.jpg', 2), ('http://35.jpg', 3),
  ('http://256.jpg', 4);

INSERT INTO comments (contents, user_id, photo_id)
VALUES
  ('Nice shot!', 2, 1),
  ('Love this', 3, 1),
  ('Where was this taken?', 4, 2),
  ('Beautiful', 1, 5);
```
**Output:**
```
DROP TABLE
DROP TABLE
DROP TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
INSERT 0 4
INSERT 0 7
INSERT 0 4
```
(You may also see `NOTICE: table "..." does not exist, skipping` on a first run.)

> ⚠️ **Warning:** This script **deletes** the three tables and their data before rebuilding them. Run it only on your practice database.

> ⚠️ **Warning:** The foreign keys here allow `NULL` (no `NOT NULL`). That is on purpose, because topics 42 and 43 need a photo with no owner.

> 🏆 **Golden Rule:** **Joins connect tables, aggregations summarize rows.** Learn them separately first, then combine them.


## 🔗 37. Joining Data from Different Tables

**What it does:** `JOIN` lines up rows from **two tables** into one result, matching them with a condition you write after `ON`.
**Why it is used:** A comment row only stores a `user_id` (a number). To see the actual **username**, you must reach into the `users` table.
**When to use it:** Whenever the data you want to show lives in more than one table.

**Analogy:** A comment has a name tag that says only "user #2." The join walks over to the guest list, finds user #2, and reads out "pferrer."

**Question:** show each comment's text next to the username of the person who wrote it.
```sql
SELECT contents, username
FROM comments
JOIN users ON users.id = comments.user_id;
```
**Output:**
```
       contents        | username
-----------------------+-----------
 Nice shot!            | pferrer
 Love this             | si93onis
 Where was this taken? | 99stroman
 Beautiful             | monahan93
(4 rows)
```
Row order isn't guaranteed in a join. Yours may differ.

**Reading it:**

| Part | Meaning |
|---|---|
| `FROM comments` | Start with the comments table |
| `JOIN users` | Bring in the users table |
| `ON users.id = comments.user_id` | Match a comment to the user whose `id` equals the comment's `user_id` |
| `SELECT contents, username` | Show columns from **either** table |

**How the matching works, for one comment:**
```
Comment 1:  contents = 'Nice shot!',  user_id = 2

   Compare 2 with every user id:
     users.id = 1  →  no
     users.id = 2  →  YES  ← keep this pairing
     users.id = 3  →  no
     users.id = 4  →  no

Result row:  Nice shot!  |  pferrer
```
Postgres does this for every row, then returns only the pairings where `ON` was true.

**Same column name in both tables:** `id` exists in `comments` **and** `users`, so Postgres needs to know which one you mean:
```sql
SELECT id, contents, username
FROM comments
JOIN users ON users.id = comments.user_id;
```
**Output:**
```
ERROR:  column reference "id" is ambiguous
LINE 1: SELECT id, contents, username
```
Fix it by naming the table:
```sql
SELECT comments.id, contents, username
FROM comments
JOIN users ON users.id = comments.user_id;
```
**Output:**
```
 id |       contents        | username
----+-----------------------+-----------
  1 | Nice shot!            | pferrer
  2 | Love this             | si93onis
  3 | Where was this taken? | 99stroman
  4 | Beautiful             | monahan93
(4 rows)
```

**Table order and side order don't change the matches:**
```sql
-- All three return the same pairings
FROM comments JOIN users ON users.id = comments.user_id
FROM users JOIN comments ON users.id = comments.user_id
FROM comments JOIN users ON comments.user_id = users.id
```

**A wrong `ON` still runs, it just means something else:**
```sql
SELECT contents, username
FROM comments
JOIN users ON users.id = comments.photo_id;
```
**Output:**
```
       contents        | username
-----------------------+-----------
 Nice shot!            | monahan93
 Love this             | monahan93
 Where was this taken? | pferrer
(3 rows)
```
This compares a **photo** id against a **user** id. Postgres sees two integers and is happy, but the answer is nonsense.

> ⚠️ **Warning:** **Postgres checks that your `ON` is valid, not that it makes sense.** Always join a **foreign key** to the **primary key** it points at (topic 24).

> ⚠️ **Warning:** A plain `JOIN` **drops rows that find no partner**. Comments with no matching user would silently vanish (topics 42 and 43).

> ⚠️ **Warning:** Column names that exist in both tables must be prefixed with the table name, like `comments.id`.

> 🏆 **Golden Rule:** **`JOIN other_table ON primary_key = foreign_key`.** Say which tables, say which two columns must be equal, then pick the columns to show.


## ⚡ 38. Another Quick Join

**What it does:** A second worked example of `JOIN`, this time between `photos` and `users`, so the pattern from topic 37 becomes automatic.
**Why it is used:** One example shows how a join works. A second shows what **stays the same** every time.
**When to use it:** Whenever you want each photo shown with its owner's details.

**Analogy:** The same card-catalog lookup as before, just on a different shelf.

**Show every photo with its owner:**
```sql
SELECT url, username
FROM photos
JOIN users ON users.id = photos.user_id;
```
**Output:**
```
      url       | username
----------------+-----------
 http://one.jpg | 99stroman
 http://two.jpg | monahan93
 http://25.jpg  | monahan93
 http://36.jpg  | monahan93
 http://754.jpg | pferrer
 http://35.jpg  | si93onis
 http://256.jpg | 99stroman
(7 rows)
```

**Notice the repeats.** `monahan93` appears **three times** and `99stroman` **twice**. Each photo gets its own row, and its owner's name is copied onto it. That is how a one-to-many relationship (topic 22) looks after a join.

**Add a filter with `WHERE` (it runs on the joined rows):**
```sql
SELECT url, username
FROM photos
JOIN users ON users.id = photos.user_id
WHERE username = 'monahan93';
```
**Output:**
```
      url       | username
----------------+-----------
 http://two.jpg | monahan93
 http://25.jpg  | monahan93
 http://36.jpg  | monahan93
(3 rows)
```

**Start from the other table:** same pairs, different starting point:
```sql
SELECT username, url
FROM users
JOIN photos ON photos.user_id = users.id;
```
**Output:**
```
 username  |      url
-----------+----------------
 99stroman | http://one.jpg
 monahan93 | http://two.jpg
 monahan93 | http://25.jpg
 monahan93 | http://36.jpg
 pferrer   | http://754.jpg
 si93onis  | http://35.jpg
 99stroman | http://256.jpg
(7 rows)
```

**The three-question recipe for any join:**

| Question | In this example |
|---|---|
| 1. Which **two tables** hold the data? | `photos` and `users` |
| 2. Which **two columns** connect them? | `photos.user_id` and `users.id` |
| 3. Which **columns** do I want to show? | `url` and `username` |

**The pattern:**
```sql
SELECT <columns from either table>
FROM <table A>
JOIN <table B> ON <table B>.<primary key> = <table A>.<foreign key>;
```

> ⚠️ **Warning:** Don't expect one output row per **user**. A join produces one row per **matching pair**, so users with several photos appear several times.

> ⚠️ **Warning:** Row order isn't guaranteed. Don't rely on it unless you add sorting later.

> 🏆 **Golden Rule:** **Every join follows the same recipe: two tables, one matching condition, then your columns.** Only the table and column names change.


## 📝 39. Exercise Overview

**What it does:** A practice exercise on `JOIN`, using the photo app, including one query that joins **three tables**.
**Why it is used:** Joins click when you write them yourself. Trying each task before reading topic 40 is how it sticks.
**When to use it:** After topics 37 and 38. Attempt all three before reading the solutions.

**Your data (from the reset script in topic 36):**
```sql
SELECT * FROM comments;
```
**Output:**
```
 id |       contents        | user_id | photo_id
----+-----------------------+---------+----------
  1 | Nice shot!            |       2 |        1
  2 | Love this             |       3 |        1
  3 | Where was this taken? |       4 |        2
  4 | Beautiful             |       1 |        5
(4 rows)
```

**Task 1.** Print the `contents` of each comment and the `url` of the photo it was posted on.

**Expected output:**
```
       contents        |      url
-----------------------+----------------
 Nice shot!            | http://one.jpg
 Love this             | http://one.jpg
 Where was this taken? | http://two.jpg
 Beautiful             | http://754.jpg
(4 rows)
```

**Task 2.** Print the `contents` of every comment written by the user `si93onis`.

**Expected output:**
```
 contents
-----------
 Love this
(1 row)
```

**Task 3 (stretch).** Print the `username` of each commenter and the `url` of the photo they commented on. This needs **three tables** (`comments`, `users`, `photos`).

**Expected output:**
```
 username  |      url
-----------+----------------
 pferrer   | http://one.jpg
 si93onis  | http://one.jpg
 99stroman | http://two.jpg
 monahan93 | http://754.jpg
(4 rows)
```
(Row order may differ.)

**Hints:**

| Task | Hint |
|---|---|
| 1 | Which column in `comments` points at `photos`? |
| 2 | Join to find the author, then filter with `WHERE` |
| 3 | `comments` has **two** foreign keys. Each one needs its own `JOIN ... ON` |
| All | Use `table.column` for any name that exists in more than one table |

> ⚠️ **Warning:** Don't start by guessing. First answer the three recipe questions from topic 38: which tables, which connecting columns, which output columns.

> 🏆 **Golden Rule:** **One `JOIN` per table you bring in.** Three tables means two joins.