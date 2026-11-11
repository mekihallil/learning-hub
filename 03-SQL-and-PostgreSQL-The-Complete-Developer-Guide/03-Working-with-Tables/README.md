## 🗺️ 20. The Plan Moving Forward

**What it does:** Gives you the roadmap for the next stretch: moving from **single standalone tables** (`cities`, `phones`) to **several tables that connect to each other**.
**Why it is used:** Real apps never have just one table. A photo app has users, photos, and comments, and they all refer to each other. Knowing the route first makes each new idea easier to place.
**When to use it:** Read it once before starting the design topics.

**Analogy:** It's the route overview on a GPS before you start driving. You still take one turn at a time, but you know where you're headed.

**The roadmap:**

| Stage | Topics | Goal |
|---|---|---|
| 1. Design | 21 | Decide which tables and columns an app needs |
| 2. Relationships | 22 to 23 | Understand how tables relate (one-to-many, many-to-many) |
| 3. Keys | 24 to 27 | Connect tables with primary keys and foreign keys |
| 4. Query connected data | 28 | Read data that spans two tables |
| 5. Practice | 29 to 30 | Build a table with two foreign keys yourself |
| 6. Rules | 31 to 34 | What Postgres allows and blocks on insert and delete |
| 7. Bigger design | 35 | Combine everything into one working schema |

**The running example for these topics:** a photo-sharing app.
```
users  ──<  photos  ──<  comments
```
One user has many photos, and one photo has many comments.

**Set up a fresh database for it:**
```sql
CREATE DATABASE photo_app;
```
**Output:**
```
CREATE DATABASE
```
```sql
\c photo_app
```
**Output:**
```
You are now connected to database "photo_app" as user "postgres".
```
`\c` is a psql command (like `\dt`), not SQL.

> ⚠️ **Warning:** `CREATE DATABASE` can't run inside a transaction, and you must **connect to the new database** (`\c`) before creating tables. Otherwise your tables land in whichever database you were in before.

> 🏆 **Golden Rule:** **Design first, query second.** Every topic that follows is about getting the structure right so the queries stay simple.