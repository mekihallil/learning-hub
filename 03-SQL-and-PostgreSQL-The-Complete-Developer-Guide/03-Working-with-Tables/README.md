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


## 🔗 22. One-to-Many and Many-to-One Relationships

**What it does:** Describes the most common relationship in databases: **one** record on one side connects to **many** records on the other. "One-to-many" and "many-to-one" are the **same relationship** read from opposite directions.
**Why it is used:** Most real data is hierarchical. One user posts many photos, one photo gets many comments. Recognizing the pattern tells you exactly where the link must go.
**When to use it:** Every time you ask "who does this belong to?" during design (topic 21).

**Analogy:** One author, many books. Each book has exactly one author, but an author can have many books.

**Reading it in both directions:**

| Direction | Sentence | Name |
|---|---|---|
| User → Photo | One user has **many** photos | **One-to-many** |
| Photo → User | Many photos belong to **one** user | **Many-to-one** |

**More examples:**

| One side | Many side |
|---|---|
| A user | Their photos |
| A photo | Its comments |
| A country | Its cities |
| A company | Its employees |
| A boat | Its crew members |

**Visualizing it with data:**
```
users                       photos
-----------------           -----------------------------
 id | username               id | url            | user_id
----+-----------            ----+----------------+--------
  1 | monahan93               2 | http://two.jpg |      1
  4 | 99stroman               3 | http://25.jpg  |      1
                              4 | http://36.jpg  |      1
                              1 | http://one.jpg |      4
```
User 1 appears on **three** photo rows. Each photo row names **exactly one** user.

**The rule for where the link goes:**

| Rule | Why |
|---|---|
| The link column lives on the **"many" side** | Each "many" row can hold exactly one answer to "who is my one?" |
| It does **not** go on the "one" side | A user would need a column holding a whole **list** of photos, which a single cell can't do cleanly |

**What that looks like:**
```
✅  photos.user_id  (each photo stores ONE user id)
❌  users.photo_ids (each user would need MANY photo ids in one cell)
```

> ⚠️ **Warning:** Don't try to store "many" inside one cell (like `'1,2,3'`). You can't search, count, or validate it reliably (topic 2).

> 🏆 **Golden Rule:** **The foreign key goes on the "many" side.** Ask "which side has many?" and put the link column there.


## 🔀 23. One-to-One and Many-to-Many Relationships

**What it does:** Covers the two other relationship types. **One-to-one** links exactly one record to exactly one record. **Many-to-many** links many records to many records on both sides.
**Why it is used:** Not everything is one-to-many. A person has one passport, but a student takes many classes and each class has many students.
**When to use it:** When you ask "who does this belong to?" and the answer is "just one, and it only belongs to one back" or "many, and it also works the other way."

**Analogy:** One-to-one is a **person and their passport**. Many-to-many is **students and classes**: each student has many classes, and each class has many students.

**The four relationship types:**

| Type | Example | Where the link goes |
|---|---|---|
| **One-to-many** | User → photos | A foreign key on the "many" side (topic 22) |
| **Many-to-one** | Photos → user | Same relationship, opposite direction |
| **One-to-one** | User → profile | A foreign key on either side, marked `UNIQUE` |
| **Many-to-many** | Photos ↔ tags | A **third table** in between |

**One-to-one: each user has one profile**
```
users                    profiles
------------             ------------------------------
 id | username            id | bio          | user_id
----+-----------          ----+--------------+--------
  1 | monahan93             1 | Loves hiking |      1
  2 | pferrer               2 | Photographer |      2
```
Each `user_id` appears **once only**. In practice you'd enforce that with `UNIQUE` (a column rule you'll meet later).

**Many-to-many: photos and tags**
A photo can have many tags, and a tag can be on many photos. Neither table can hold the link alone, so we add a **join table** (also called a junction or association table):
```
photos            photos_tags                 tags
-------           -----------------           ---------
 id | url          photo_id | tag_id            id | name
----+------        ---------+--------          ----+--------
  1 | one.jpg             1 |      1             1 | travel
  2 | two.jpg             1 |      2             2 | food
                          2 |      1
```
**Reading it:** photo 1 has tags 1 and 2 (travel, food). Tag 1 (travel) is on photos 1 and 2.

**The join table pattern:**

| Part | Meaning |
|---|---|
| Name | The two table names together, like `photos_tags` |
| Columns | **Two foreign keys**, one for each side |
| Each row | One pairing, such as "photo 1 has tag 2" |

**Another many-to-many, hiding in our app:** `comments` itself is a join between users and photos. Many users comment on many photos, and each comment row records one pairing.

**Choosing the type:**

| Ask | Answer | Type |
|---|---|---|
| Does A have many Bs, but each B has one A? | Yes | One-to-many |
| Does each A have exactly one B and vice versa? | Yes | One-to-one |
| Does A have many Bs **and** B have many As? | Yes | Many-to-many (use a join table) |

> ⚠️ **Warning:** One-to-one is rarer than it looks. Often the two things are really **one table** that doesn't need splitting. Split only when there's a reason (rarely used data, or sensitive data kept separate).

> ⚠️ **Warning:** Never try to fake many-to-many by adding columns like `tag1`, `tag2`, `tag3`. You'd be stuck at three tags and every query gets awkward.

> 🏆 **Golden Rule:** **Many-to-many always needs a third table.** If neither side can hold the link, put it in a table that holds one foreign key for each side.


## 🔑 24. Primary Keys and Foreign Keys

**What it does:** Two kinds of columns that make relationships possible. A **primary key** uniquely identifies each row in its own table. A **foreign key** is a column in another table that **points at** a primary key.
**Why it is used:** To link a photo to a user you need a reliable, permanent way to say "this exact user." Names can repeat or change, but an id can't.
**When to use it:** Every table gets a primary key. Every "many" side of a relationship gets a foreign key.

**Analogy:** A primary key is your **passport number**. It's unique to you, never reused, and it never changes. A foreign key is writing that passport number on a hotel booking form to say which person the booking is for.

**The pair in action:**
```
users  (id = PRIMARY KEY)           photos  (user_id = FOREIGN KEY)
---------------------               ------------------------------
 id | username                       id | url            | user_id
----+------------                   ----+----------------+--------
  1 | monahan93         ◄────────      2 | http://two.jpg |      1
  2 | pferrer           ◄────────      5 | http://754.jpg |      2
  3 | si93onis
  4 | 99stroman         ◄────────      1 | http://one.jpg |      4
```
`photos.user_id` is a foreign key because its values come from `users.id`, the primary key.

**Rules for a primary key:**

| Rule | Meaning |
|---|---|
| **Unique** | No two rows share the same value |
| **Never `NULL`** | Every row must have one |
| **Never changes** | Other tables rely on it staying the same |
| **One per table** | Each table has a single primary key |

**Rules for a foreign key:**

| Rule | Meaning |
|---|---|
| Points at **another table's primary key** | `photos.user_id` → `users.id` |
| Can **repeat** | Many photos can share one `user_id` |
| Can be `NULL` (unless you forbid it) | A photo can exist with no user (topic 31) |
| Must refer to a value that **exists** | You can't point at user 9999 if there's no such user (topic 31) |

**Primary key vs foreign key:**

| | Primary key | Foreign key |
|---|---|---|
| **Purpose** | Identify **this** row | Point at a row in **another** table |
| **Unique values?** | ✅ Always | ❌ Can repeat |
| **Allows `NULL`?** | ❌ Never | ✅ Yes, by default |
| **Example** | `users.id` | `photos.user_id` |
| **Count per table** | Exactly one | Zero or many |

**Naming convention:** call the foreign key `<singular_table>_id`, like `user_id` or `photo_id`. Anyone reading it knows which table it points to.

> ⚠️ **Warning:** **Don't use a real-world value as a primary key**, such as a username or an email. People change usernames and emails, and every linked row would then break. Use a meaningless generated number (topic 26).

> 🏆 **Golden Rule:** **Primary key = "who am I?" Foreign key = "who do I belong to?"** The foreign key always stores another table's primary key value.


## 🔍 25. Understanding Foreign Keys

**What it does:** Looks closer at how a foreign key behaves: what values it may hold, what it means when several rows share the same one, and what the database checks every time you write to it.
**Why it is used:** Foreign keys are the glue of your whole design. A solid mental model prevents the most common bugs (broken links, orphaned rows).
**When to use it:** Before you write `CREATE TABLE` with a foreign key (topic 27).

**Analogy:** A **return address** on a parcel. It must be a real address (a row that exists), many parcels can share the same address, and a parcel with a blank return address is possible but odd.

**What a foreign key can hold:**

| Value in `photos.user_id` | Allowed? | Meaning |
|---|---|---|
| `1` (user 1 exists) | ✅ | This photo belongs to user 1 |
| `1` again, on another photo | ✅ | User 1 owns several photos |
| `9999` (no such user) | ❌ Error | Link to something that doesn't exist |
| `NULL` | ✅ (unless forbidden) | This photo has no owner |

**Following a link, step by step:**
```
Photo row:  id = 3, url = 'http://25.jpg', user_id = 1
                                                  │
                                                  ▼
User row:   id = 1, username = 'monahan93'
```
To find who posted photo 3, take its `user_id` (1) and look up user 1.

**Going the other direction:** to find all photos by user 1, search `photos` for rows where `user_id = 1`:
```
photos where user_id = 1  →  rows 2, 3, 4
```

**The idea behind it: referential integrity.** Postgres **guarantees** that every foreign key either points at a real row or is `NULL`. You never have to wonder whether the link is broken.

**Where it checks, and what it blocks:**

| You try to... | Postgres checks... | Covered in |
|---|---|---|
| **Insert** a photo with a made-up `user_id` | Does that user exist? | Topic 31 |
| **Update** `user_id` to a made-up value | Does that user exist? | Topic 31 |
| **Delete** a user who still has photos | What should happen to those photos? | Topics 32 to 34 |

**What the database stores:** it saves the foreign key as a **constraint**, a named rule on the table. Postgres names it automatically, like `photos_user_id_fkey` (`table_column_fkey`), and you'll see that name in error messages.

**Two columns, one type:** a foreign key and the key it points to must have **compatible types**. A `SERIAL` primary key is an integer, so the foreign key is `INTEGER`.

> ⚠️ **Warning:** A foreign key links to **one specific table**. `photos.user_id` can only hold ids from `users`, never ids from some other table.

> ⚠️ **Warning:** The foreign key is **not** the user's data. It's only an id. To see the username you must look it up in `users` (topic 28).

> 🏆 **Golden Rule:** **A foreign key is a promise.** It either points at a row that really exists or it's `NULL`, and Postgres enforces that promise on every write.



## 🔢 26. Auto-Generated IDs

**What it does:** Lets Postgres **create the primary key value for you** every time you insert a row, using the `SERIAL` type. You never type an id yourself.
**Why it is used:** Ids must be unique and never repeat. Handing out numbers by hand invites duplicates. Postgres keeps a counter and always gives the next number.
**When to use it:** For the primary key of almost every table.

**Analogy:** A **ticket dispenser** at a deli counter. Each person gets the next number, nobody gets the same one, and a number is never handed out twice.

**Create the `users` table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50)
);
```
**Output:**
```
CREATE TABLE
```

| Part | Meaning |
|---|---|
| `id` | The column name |
| `SERIAL` | A whole number that Postgres fills in automatically, counting up from 1 |
| `PRIMARY KEY` | Unique, never `NULL`, identifies the row (topic 24) |

**Insert rows without mentioning `id`:**
```sql
INSERT INTO users (username)
VALUES ('monahan93'), ('pferrer'), ('si93onis'), ('99stroman');
```
**Output:**
```
INSERT 0 4
```

**Check the ids Postgres generated:**
```sql
SELECT * FROM users;
```
**Output:**
```
 id | username
----+-----------
  1 | monahan93
  2 | pferrer
  3 | si93onis
  4 | 99stroman
(4 rows)
```

**See the ids as you insert with `RETURNING` (topic 18):**
```sql
INSERT INTO users (username) VALUES ('newperson') RETURNING id;
```
**Output:**
```
 id
----
  5

INSERT 0 1
```
Remove that row again so the examples below still match:
```sql
DELETE FROM users WHERE username = 'newperson';
```

**What `SERIAL` does behind the scenes:**
```
SERIAL = INTEGER column + a counter (called a sequence) + "use the counter by default"
```

**Surprising but normal behavior:**

| Situation | What happens to ids |
|---|---|
| You delete user 3 | Id 3 is **never reused**, so the next user gets 5 or higher |
| An insert **fails** (an error) | The counter may still have advanced, leaving a **gap** |
| You `ROLLBACK` a transaction | The counter does **not** roll back |

Gaps in ids are completely normal and harmless.

**The modern alternative:** since PostgreSQL 10, the SQL-standard syntax is:
```sql
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(50)
);
```
It works much like `SERIAL`, but it's standard SQL, and `ALWAYS` stops you from accidentally supplying your own id. `SERIAL` is still very widely used, and both are fine.

> ⚠️ **Warning:** **Don't insert your own ids into a `SERIAL` column.** Postgres won't notice, so the counter will later try the same number and fail with a duplicate key error.

> ⚠️ **Warning:** Never treat ids as "how many rows exist." Gaps happen, so an id of 100 doesn't mean there are 100 rows.

> 🏆 **Golden Rule:** **Let the database generate primary keys.** Leave `id` out of your `INSERT`, and use `RETURNING id` when you need to know the new value.


## 🧷 27. Creating Foreign Key Columns

**What it does:** Adds a column that is **linked to another table's primary key**, using `REFERENCES`. Postgres then enforces the link automatically.
**Why it is used:** This is the actual code behind everything in topics 22 to 25. Without it, `user_id` would just be an ordinary number that could point anywhere.
**When to use it:** Whenever a table sits on the "many" side of a relationship.

**Analogy:** Writing a name on a form is one thing. Having the clerk **check the name against the official register** is a foreign key. The database does the checking for you.

**Create `photos`, linked to `users`:**
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(200),
  user_id INTEGER REFERENCES users(id)
);
```
**Output:**
```
CREATE TABLE
```

| Part | Meaning |
|---|---|
| `user_id` | The column name (`<table>_id` convention, topic 24) |
| `INTEGER` | Same kind of number as a `SERIAL` id |
| `REFERENCES users(id)` | "Every value here must match a value in `users.id`" |

**Insert photos, using the real user ids:**
```sql
INSERT INTO photos (url, user_id)
VALUES
  ('http://one.jpg', 4),
  ('http://two.jpg', 1),
  ('http://25.jpg', 1),
  ('http://36.jpg', 1),
  ('http://754.jpg', 2),
  ('http://35.jpg', 3),
  ('http://256.jpg', 4);
```
**Output:**
```
INSERT 0 7
```

**Look at the result:**
```sql
SELECT * FROM photos;
```
**Output:**
```
 id |      url       | user_id
----+----------------+---------
  1 | http://one.jpg |       4
  2 | http://two.jpg |       1
  3 | http://25.jpg  |       1
  4 | http://36.jpg  |       1
  5 | http://754.jpg |       2
  6 | http://35.jpg  |       3
  7 | http://256.jpg |       4
(7 rows)
```

**Confirm Postgres stored the link:**
```sql
\d photos
```
**Output:**
```
                                 Table "public.photos"
 Column  |          Type          | Nullable |              Default
---------+------------------------+----------+------------------------------------
 id      | integer                | not null | nextval('photos_id_seq'::regclass)
 url     | character varying(200) |          |
 user_id | integer                |          |
Indexes:
    "photos_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "photos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)
```

**Try a link that doesn't exist:**
```sql
INSERT INTO photos (url, user_id) VALUES ('http://nobody.jpg', 9999);
```
**Output:**
```
ERROR:  insert or update on table "photos" violates foreign key constraint "photos_user_id_fkey"
DETAIL:  Key (user_id)=(9999) is not present in table "users".
```
Postgres refused, because there's no user 9999.

**Two syntax styles (same result):**
```sql
-- Short form, used above
user_id INTEGER REFERENCES users(id)

-- Long form, with an explicit name for the rule
user_id INTEGER,
CONSTRAINT photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
```

> ⚠️ **Warning:** **Create the referenced table first.** Making `photos` before `users` fails with `ERROR: relation "users" does not exist`.

> ⚠️ **Warning:** The failed insert above may still have **used up** an id from the counter (topic 26), so the next photo id can skip a number. That's normal.

> 🏆 **Golden Rule:** **`REFERENCES other_table(column)` turns a plain number into a checked link.** Write it on every foreign key so the database protects your data for you.


## 🔎 28. Running Queries on Associated Data

**What it does:** Shows how to **read data that is spread across two linked tables**, for example "show me all the photos that belong to this user."
**Why it is used:** Splitting data into tables keeps it tidy, but you still need to see it together. Linked tables make that possible.
**When to use it:** Any time the answer needs information from both sides of a relationship.

**Analogy:** A library card catalog points to shelf numbers. You read the card (one table), then walk to that shelf (the other table).

**Question 1: which photos belong to user 4?** The link lives in `photos.user_id`, so a plain `WHERE` is enough:
```sql
SELECT * FROM photos WHERE user_id = 4;
```
**Output:**
```
 id |      url       | user_id
----+----------------+---------
  1 | http://one.jpg |       4
  7 | http://256.jpg |       4
(2 rows)
```

**Question 2: which photos belong to the user named `monahan93`?** You only know the **name**, so first find the id:
```sql
SELECT id FROM users WHERE username = 'monahan93';
```
**Output:**
```
 id
----
  1
(1 row)
```
Then use that id:
```sql
SELECT url FROM photos WHERE user_id = 1;
```
**Output:**
```
      url
----------------
 http://two.jpg
 http://25.jpg
 http://36.jpg
(3 rows)
```
This works, but two queries by hand is slow and clumsy.

**Preview: do it in one query with a `JOIN`.** Joins get their own topics later, so here's only the idea:
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
`JOIN ... ON users.id = photos.user_id` means: "line up each photo with the user whose `id` equals that photo's `user_id`." Row order isn't guaranteed unless you sort.

**Where to filter once linked:**
```sql
SELECT url, username
FROM photos
JOIN users ON users.id = photos.user_id
WHERE username = 'monahan93';
```
**Output:**
```
      url
----------------+-----------
 http://two.jpg | monahan93
 http://25.jpg  | monahan93
 http://36.jpg  | monahan93
(3 rows)
```

**The pattern:**

| Goal | Approach |
|---|---|
| You know the **id** | `WHERE foreign_key = id` on the "many" table |
| You know only a **name** | Look up the id first, or use a `JOIN` |
| You want data from **both tables** in one result | `JOIN` |

> ⚠️ **Warning:** Both `users` and `photos` have a column called `id`. In a join, an unqualified `id` is ambiguous and gives `ERROR: column reference "id" is ambiguous`. Write `users.id` or `photos.id`.

> ⚠️ **Warning:** Result order isn't guaranteed unless you add sorting (`ORDER BY`, later). Don't assume rows come back in id order.

> 🏆 **Golden Rule:** **The foreign key is your bridge.** Match `photos.user_id` against `users.id` and you can travel between the two tables in either direction.



## 📝 29. Exercise Overview

**What it does:** A short exercise to practice **creating a table with two foreign keys**: a `comments` table that links to both `users` and `photos`.
**Why it is used:** Reading about foreign keys is easy. Writing one from scratch shows whether you really understand it.
**When to use it:** After topics 24 to 28. Try each task before reading the solution in topic 30.

**The goal:** every comment records **what was said**, **who said it**, and **which photo it is about**.
```
users ──< comments >── photos
```

**Your tasks:**

**Task 1.** Create a `comments` table with:

| Column | Type | Notes |
|---|---|---|
| `id` | auto-generated integer | Primary key |
| `contents` | text up to 240 characters | The comment itself |
| `user_id` | integer | Foreign key to `users` |
| `photo_id` | integer | Foreign key to `photos` |

**Expected output:**
```
CREATE TABLE
```

**Task 2.** Insert these four comments, written as (contents, user_id, photo_id):

| contents | user_id | photo_id |
|---|---|---|
| Nice shot! | 2 | 1 |
| Love this | 3 | 1 |
| Where was this taken? | 4 | 2 |
| Beautiful | 1 | 5 |

**Expected output:**
```
INSERT 0 4
```

**Task 3.** Print the `contents` of every comment on photo 1.

**Expected output:**
```
  contents
------------
 Nice shot!
 Love this
(2 rows)
```

**Task 4.** Try to add a comment on photo 999 and read the error.

**Expected output:** an error saying the key is not present in table `photos`.

**Hints:**

| Task | Hint |
|---|---|
| 1 | Use the same pattern as `photos.user_id` in topic 27, but twice |
| 1 | `users` and `photos` must already exist |
| 2 | List the column names in the `INSERT`, and leave `id` out (topic 26) |
| 3 | Photo 1's comments are found by filtering on the foreign key |

> ⚠️ **Warning:** Table order matters. `comments` points at both other tables, so it must be created **last**.

> 🏆 **Golden Rule:** A table can have **as many foreign keys as it needs**. Each one is just another `column INTEGER REFERENCES table(id)`.



## ✅ 30. Foreign Key Creation Solution

**What it does:** The worked answers to the exercise in topic 29, with an explanation of each part.
**Why it is used:** Comparing your attempt with a clean solution shows exactly where your thinking differed.
**When to use it:** After you've tried the four tasks yourself.

**Task 1: create the table**
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  contents VARCHAR(240),
  user_id INTEGER REFERENCES users(id),
  photo_id INTEGER REFERENCES photos(id)
);
```
**Output:**
```
CREATE TABLE
```

| Column | Why it's written that way |
|---|---|
| `id SERIAL PRIMARY KEY` | Auto-generated unique id (topic 26) |
| `contents VARCHAR(240)` | Text, capped at 240 characters |
| `user_id ... REFERENCES users(id)` | Who wrote it, checked against `users` |
| `photo_id ... REFERENCES photos(id)` | Which photo it's on, checked against `photos` |

**Task 2: insert the comments**
```sql
INSERT INTO comments (contents, user_id, photo_id)
VALUES
  ('Nice shot!', 2, 1),
  ('Love this', 3, 1),
  ('Where was this taken?', 4, 2),
  ('Beautiful', 1, 5);
```
**Output:**
```
INSERT 0 4
```

**Task 3: comments on photo 1**
```sql
SELECT contents FROM comments WHERE photo_id = 1;
```
**Output:**
```
  contents
------------
 Nice shot!
 Love this
(2 rows)
```

**Task 4: a comment on a photo that doesn't exist**
```sql
INSERT INTO comments (contents, user_id, photo_id)
VALUES ('Ghost comment', 1, 999);
```
**Output:**
```
ERROR:  insert or update on table "comments" violates foreign key constraint "comments_photo_id_fkey"
DETAIL:  Key (photo_id)=(999) is not present in table "photos".
```
The error name (`comments_photo_id_fkey`) tells you **which** foreign key failed.

**Bonus: read it all together with joins (preview):**
```sql
SELECT username, contents, url
FROM comments
JOIN users ON users.id = comments.user_id
JOIN photos ON photos.id = comments.photo_id;
```
**Output:**
```
 username  |       contents        |      url
-----------+-----------------------+----------------
 pferrer   | Nice shot!            | http://one.jpg
 si93onis  | Love this             | http://one.jpg
 99stroman | Where was this taken? | http://two.jpg
 monahan93 | Beautiful             | http://754.jpg
(4 rows)
```
One comment row connects **three** pieces of information, which is the power of two foreign keys.

**Common mistakes:**

| Mistake | What happens |
|---|---|
| Creating `comments` before `photos` | `ERROR: relation "photos" does not exist` |
| Forgetting `REFERENCES` | The column is just a number, with **no protection** |
| Putting `id` in the `INSERT` column list | You override the counter (topic 26) |
| Mixing up the user and photo ids | No error, but the **wrong** user or photo is linked |

> ⚠️ **Warning:** The database checks that a linked row **exists**, not that you picked the **right** one. Passing `user_id = 3` instead of `2` is valid, so double-check your values.

> 🏆 **Golden Rule:** **One `REFERENCES` per link.** Two relationships means two foreign key columns, each pointing at its own table.


## 🚧 31. Foreign Key Constraints Around Insertion

**What it does:** Explains what Postgres **allows and blocks when you insert or update** a row that has a foreign key, including the special case of `NULL`.
**Why it is used:** Knowing the rules tells you when an insert will fail, and how to **require** a link when you want one.
**When to use it:** Whenever you write data into a table with foreign keys.

**Analogy:** A bouncer who checks that the person you name as your guest is **actually on the guest list**. A made-up name gets turned away, but leaving the guest line blank is allowed unless the club insists on one.

**Rule 1: a foreign key must point at a row that exists.**
```sql
INSERT INTO photos (url, user_id) VALUES ('http://ghost.jpg', 9999);
```
**Output:**
```
ERROR:  insert or update on table "photos" violates foreign key constraint "photos_user_id_fkey"
DETAIL:  Key (user_id)=(9999) is not present in table "users".
```

**Rule 2: the same check applies to `UPDATE`.**
```sql
UPDATE photos SET user_id = 9999 WHERE id = 1;
```
**Output:**
```
ERROR:  insert or update on table "photos" violates foreign key constraint "photos_user_id_fkey"
DETAIL:  Key (user_id)=(9999) is not present in table "users".
```

**Rule 3: `NULL` is allowed by default.** It means "no link":
```sql
INSERT INTO photos (url, user_id) VALUES ('http://orphan.jpg', NULL);
```
**Output:**
```
INSERT 0 1
```
**Check it:**
```sql
SELECT * FROM photos WHERE user_id IS NULL;
```
**Output:**
```
 id |       url        | user_id
----+------------------+---------
  9 | http://orphan.jpg |
(1 row)
```
(psql shows `NULL` as an empty space.) Clean it up:
```sql
DELETE FROM photos WHERE url = 'http://orphan.jpg';
```
**Output:**
```
DELETE 1
```

**Require a link with `NOT NULL`:** if every photo **must** have an owner, say so:
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(200) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id)
);
```
Now this fails:
```sql
INSERT INTO photos (url, user_id) VALUES ('http://orphan.jpg', NULL);
```
**Output:**
```
ERROR:  null value in column "user_id" of relation "photos" violates not-null constraint
```

**What each rule does:**

| Rule | Protects against |
|---|---|
| `REFERENCES users(id)` | Pointing at a user that doesn't exist |
| `NOT NULL` | Rows with **no** link at all |
| Both together | "Every photo must belong to a real user" |

**Order of operations:** to add a child row, the parent must exist **first**:
```
1. INSERT the user    ✅
2. INSERT the photo   ✅  (user_id now points at a real row)
```
Reversing the order fails.

> ⚠️ **Warning:** **`NULL` slips past the foreign key check.** `REFERENCES` alone does not force a link to exist. Add `NOT NULL` when the relationship is mandatory.

> ⚠️ **Warning:** You can't add `NOT NULL` to a column that already contains `NULL`s, so fix or delete those rows first.

> 🏆 **Golden Rule:** **`REFERENCES` guarantees a link is valid. `NOT NULL` guarantees a link exists.** Use both when a record must always belong to something.



## ⛔ 32. Constraints Around Deletion

**What it does:** Explains what happens when you **delete a row that other rows point to**, and the five choices you have for handling it.
**Why it is used:** If you delete user 1 but three photos still say `user_id = 1`, those photos would point at nothing. Postgres makes you decide what should happen instead of leaving broken links.
**When to use it:** When designing any foreign key. The choice is part of the table definition.

**Analogy:** Closing a **parent account** while its **child accounts** still depend on it. The bank must either refuse, close the children too, or leave them with no parent. It can't just pretend nothing happened.

**The default behavior: refuse.**
```sql
DELETE FROM users WHERE id = 1;
```
**Output:**
```
ERROR:  update or delete on table "users" violates foreign key constraint "photos_user_id_fkey" on table "photos"
DETAIL:  Key (id)=(1) is still referenced from table "photos".
```
User 1 still owns photos, so Postgres blocks the delete.

**The five options, set with `ON DELETE`:**

| Option | What happens to the child rows when the parent is deleted |
|---|---|
| `NO ACTION` (**default**) | **Block** the delete (the check happens at the end of the statement) |
| `RESTRICT` | **Block** the delete (the check happens immediately) |
| `CASCADE` | **Delete the child rows too** |
| `SET NULL` | **Keep** the child rows, set their foreign key to `NULL` |
| `SET DEFAULT` | **Keep** the child rows, set their foreign key to the column's default value |

**Syntax:**
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(200),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
```

**Choosing an option:**

| Situation | Good choice | Why |
|---|---|---|
| A user leaves and their photos should go too | `CASCADE` | Photos are meaningless without an owner |
| You want to be **forced** to clean up first | `RESTRICT` | Prevents accidental data loss |
| Posts should stay when the author leaves | `SET NULL` | Keeps the content, drops the link |
| A deleted parent should fall back to a default owner | `SET DEFAULT` | Rare, needs a valid default row |

**Which parent does this affect?** The `ON DELETE` rule sits on the **child's** foreign key. It controls what happens when the **parent** row (the one being pointed at) is deleted.

**What about updating the parent's id?** There's a matching `ON UPDATE` option, but primary keys should never change (topic 24), so you'll rarely need it.

> ⚠️ **Warning:** **`CASCADE` is powerful and dangerous.** One `DELETE` on a user can silently remove their photos, and the photos' comments, and so on down the chain.

> ⚠️ **Warning:** Think carefully about the **default**. `NO ACTION` is safe, but it means deleting a user is impossible until their photos are gone.

> 🏆 **Golden Rule:** **Every foreign key needs a decision: block, cascade, or set null.** Choose it deliberately, based on what the child data means without its parent.



## 🧪 33. Testing Deletion Constraints

**What it does:** Runs hands-on tests of `RESTRICT` and `CASCADE`, so you can **see** each behavior instead of just reading about it.
**Why it is used:** Delete rules are easy to misunderstand. Watching real rows disappear (or refuse to) makes them stick.
**When to use it:** After topic 32, on a practice database.

**Analogy:** A fire drill. You practice on purpose, in a safe place, so you know what happens when it matters.

**Start from a clean slate.** Because tables depend on each other, drop **children first**:
```sql
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50)
);

INSERT INTO users (username)
VALUES ('monahan93'), ('pferrer'), ('si93onis'), ('99stroman');
```
**Output:**
```
DROP TABLE
DROP TABLE
DROP TABLE
CREATE TABLE
INSERT 0 4
```
(You'll see `NOTICE: table "..." does not exist, skipping` if a table wasn't there.)

### Test 1: `ON DELETE RESTRICT`
```sql
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(200),
  user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT
);

INSERT INTO photos (url, user_id)
VALUES ('http://one.jpg', 4), ('http://two.jpg', 1);
```
**Try deleting a user who has photos:**
```sql
DELETE FROM users WHERE id = 1;
```
**Output:**
```
ERROR:  update or delete on table "users" violates foreign key constraint "photos_user_id_fkey" on table "photos"
DETAIL:  Key (id)=(1) is still referenced from table "photos".
```
**Delete a user with no photos:**
```sql
DELETE FROM users WHERE id = 3;
```
**Output:**
```
DELETE 1
```
User 3 owns nothing, so there's nothing to protect.

### Test 2: `ON DELETE CASCADE`
**Rebuild `photos` with the new rule:**
```sql
DROP TABLE photos;

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(200),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO photos (url, user_id)
VALUES ('http://one.jpg', 4), ('http://two.jpg', 2), ('http://25.jpg', 2);
```
**Delete user 2, who owns two photos:**
```sql
DELETE FROM users WHERE id = 2;
```
**Output:**
```
DELETE 1
```
**Check the photos:**
```sql
SELECT * FROM photos;
```
**Output:**
```
 id |      url       | user_id
----+----------------+---------
  1 | http://one.jpg |       4
(1 row)
```
Postgres reported deleting only **one** row, but user 2's two photos vanished too. The cascade removed them silently.

**What you just proved:**

| Test | Parent delete result | Child rows |
|---|---|---|
| `RESTRICT`, parent has children | ❌ Error | Untouched |
| `RESTRICT`, parent has no children | ✅ Works | None to affect |
| `CASCADE`, parent has children | ✅ Works | **Deleted too** |

**Tip: do dangerous tests inside a transaction (topic 18):**
```sql
BEGIN;
DELETE FROM users WHERE id = 4;
SELECT * FROM photos;
ROLLBACK;
```
`ROLLBACK` undoes the user delete **and** the cascaded photo delete.

> ⚠️ **Warning:** `DROP TABLE` fails if another table still references it (`ERROR: cannot drop table photos because other objects depend on it`). Drop **children first**, or use `DROP TABLE ... CASCADE` if you truly mean to remove dependents.

> ⚠️ **Warning:** The "rows deleted" count (`DELETE 1`) **only counts the parent**. Cascaded deletes don't show up in it, so always check the child table.

> 🏆 **Golden Rule:** **Test your delete rules on throwaway data**, and verify the child table afterwards. The only way to trust a cascade is to watch it happen.