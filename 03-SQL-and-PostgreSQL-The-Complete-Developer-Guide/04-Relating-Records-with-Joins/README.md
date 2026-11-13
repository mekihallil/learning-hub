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


