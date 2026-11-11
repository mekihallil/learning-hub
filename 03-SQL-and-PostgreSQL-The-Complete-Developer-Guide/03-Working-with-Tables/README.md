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



## 🧭 21. Approaching Database Design

**What it does:** A repeatable method for turning an app idea into **tables and columns**, using two questions you can ask about any app.
**Why it is used:** Without a method, you guess, and wrong guesses mean rebuilding tables full of data. Topic 2 introduced the idea. This is the step-by-step version.
**When to use it:** At the start of every project, with pencil and paper.

**Analogy:** Planning a filing cabinet before buying folders. First decide which **drawers** you need (tables), then what **fields** go on each sheet (columns).

**The two questions:**

| Question | Answer becomes | Photo app answer |
|---|---|---|
| 1. What **types of things** does the app store? | **Tables** | users, photos, comments |
| 2. What **properties** does each thing have? | **Columns** | see below |

**Step 1: list the things (nouns):**
```
users      photos      comments
```

**Step 2: list each thing's properties:**
```
users:     username
photos:    url
comments:  contents
```

**Step 3: ask "who does this belong to?"** This is the new step, and it is where the **relationships** come from:
```
a photo   → was posted by a user
a comment → was written by a user, on a photo
```

**A tempting mistake: copying data instead of linking it.**
```
photos
------------------------------------------
 url         | username     | user_email
 one.jpg     | monahan93    | m93@mail.com
 two.jpg     | monahan93    | m93@mail.com    ← same info repeated
 25.jpg      | monahan93    | m93@mail.com    ← and again
```
If monahan93 changes their email, you must fix **every** photo row, and one missed row means the data disagrees with itself. The fix is to store the user **once** and point to it (topics 24 to 27).

**A good-design test for each column:**

| Ask | If the answer is "yes" |
|---|---|
| Does this fact describe **only this one thing**? | Keep it in this table |
| Am I **repeating** information that exists elsewhere? | Move it to its own table and link to it |
| Could this value **change** and force edits in many rows? | Store it once and link |

**Draw it before you code:**
```
┌─────────┐        ┌─────────┐        ┌──────────┐
│  users  │ 1────* │ photos  │ 1────* │ comments │
└─────────┘        └─────────┘        └──────────┘
```

> ⚠️ **Warning:** Don't skip the paper stage. Moving a column or splitting a table **after** it holds real data means migrating every row.

> 🏆 **Golden Rule:** **Nouns become tables, properties become columns, and "belongs to" becomes a link between tables.** Store each fact exactly once.