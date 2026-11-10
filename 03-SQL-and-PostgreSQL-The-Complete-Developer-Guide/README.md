 <div align="center">

# 🐘 SQL and PostgreSQL: The Complete Developer's Guide

### 📘 My Learning Notes & Progress

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Instructor](https://img.shields.io/badge/Instructor-Stephen%20Grider-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Udemy-A435F0?style=for-the-badge&logo=udemy&logoColor=white)

</div>

---

## 🎓 Course Info

**Course Name:** SQL and PostgreSQL: The Complete Developer's Guide  
**Instructor:** Stephen Grider  
**Platform:** Udemy  
**Rating:** 4.7 ⭐  
**Duration:** ~22 hours  
**Language:** English  
**Level:** Beginner to Advanced

---

### About the Instructor

Stephen Grider is an experienced software engineer and Udemy instructor known for explaining complex programming concepts in a clear and practical way. He has extensive experience building JavaScript applications and mentoring developers throughout their software engineering journeys.

---

### About the Course

This course provides a comprehensive introduction to SQL and PostgreSQL, covering everything from fundamental database operations to advanced database design and performance optimization.

It focuses on understanding how relational databases work internally, designing efficient database structures, writing complex SQL queries, and managing data in real-world applications.

The course also explores how PostgreSQL handles data storage, indexing, concurrency, and transactions, helping developers build reliable and scalable database systems.

**Key Topics Covered:**

- Introduction to SQL and Relational Databases
- PostgreSQL Fundamentals and Database Design
- Creating, Inserting, Updating, and Deleting Records
- Filtering, Sorting, and Aggregating Data
- Joins and Relationships
- Primary Keys and Foreign Keys
- Subqueries and Common Table Expressions (CTEs)
- Database Design Patterns and Normalization
- Indexing and Query Performance Optimization
- Transactions and Concurrency
- Schema Migrations
- PostgreSQL Internals and Data Storage
- Connecting PostgreSQL with Applications
- Advanced Database Features and Real-World Use Cases

---

**Learning Goal:** Build a strong foundation in relational database design and SQL, and gain the practical skills needed to work with PostgreSQL in scalable, real-world backend applications.



## 🐘 1. What is PostgreSQL All About

**What it does:** PostgreSQL (often called **Postgres**) is a free, open-source **relational database management system**. It stores your data in organized **tables** and lets you read, add, change, and delete that data using a language called **SQL**.
**Why it is used:** Apps need a safe, fast place to keep data (users, orders, posts) that many people can use at the same time without corrupting it. Postgres handles storage, speed, and reliability so you don't have to build that yourself.
**When to use it:** Almost any app that stores structured data: websites, dashboards, stores, social apps.

**Analogy:** Postgres is a huge, well-run warehouse with a manager. **SQL is the language you use to give the manager instructions** ("bring me all customers from Ethiopia"). The warehouse is the software, the instructions are the language.

**Key terms:**

| Term | Meaning | Example |
|---|---|---|
| **Database** | A collection of related tables | `shop` |
| **Table** | A grid that stores one type of thing | `cities`, `users` |
| **Row** | One item in a table | One city: Tokyo |
| **Column** | One property of every item | `population` |
| **SQL** | The language for talking to the database | `SELECT * FROM cities;` |
| **PostgreSQL** | The software that stores data and runs your SQL | The "engine" |

**Check that Postgres is installed:**
```bash
psql --version
```
**Output:**
```
psql (PostgreSQL) 17.2
```
(Your version number may differ.)

**Ask the server for its version, using SQL:**
```sql
SELECT version();
```
**Output:**
```
                       version
------------------------------------------------------
 PostgreSQL 17.2 on x86_64-pc-linux-gnu, compiled by ...
(1 row)
```

**Postgres compared to other databases:**

| Database | Type | Typical use |
|---|---|---|
| **PostgreSQL** | Server, full-featured | Most web apps, analytics, anything that grows |
| **MySQL** | Server | Web apps, widely hosted |
| **SQLite** | A single file, no server | Local development, small apps (you used it with Prisma) |
| **SQL Server** | Server, from Microsoft | Enterprise and Windows environments |

> ⚠️ **Warning:** SQL is a standard, but every database has small **dialect differences**. The commands in these notes are written for **PostgreSQL**. They may need tweaks on MySQL or SQL Server.

> 🏆 **Golden Rule:** **SQL is the language, PostgreSQL is the engine.** Learning SQL here also helps you with other databases, because most of the core ideas carry over.



## 🧱 2. Database Design

**What it does:** Database design is deciding **what tables you need, what columns each table has, and how tables connect**, before you write any SQL.
**Why it is used:** Changing a table after thousands of rows exist is slow and risky. A short plan on paper prevents most of those rewrites (the same idea as the upfront design process in your Next.js notes).
**When to use it:** At the start of every project, before `CREATE TABLE`.

**Analogy:** An architect draws the blueprint before pouring concrete. Moving a wall on paper costs an eraser. Moving it after the building is up costs a demolition crew.

**The three questions to ask:**

| Question | Answer becomes | Example |
|---|---|---|
| 1. What **kinds of things** does the app store? | **Tables** | users, photos, comments, likes |
| 2. What do we need to know about each one? | **Columns** | a user has a username, email, bio |
| 3. How do the things **relate** to each other? | **Connections between tables** (covered later) | a photo belongs to one user |

**Practical example: a photo-sharing app**
```
users                photos                comments
-----                ------                --------
username             url                   contents
email                caption               (belongs to a user)
bio                  (belongs to a user)   (belongs to a photo)
```
**Output (what each table stores):**
```
users:    one row = one person
photos:   one row = one uploaded photo
comments: one row = one comment on one photo
```

**Design rules of thumb:**

| Rule | Why |
|---|---|
| One table per **type of thing** | Keeps data organized and easy to find |
| One row per **individual item** | Each photo or user is its own row |
| One column per **single fact** | Don't cram a list into one cell, such as `"john, mary, steve"` |
| Use **plural, lowercase** table names (`users`, `photos`) | Consistent and easy to read |
| Use `snake_case` for multi-word names (`units_sold`) | Avoids case-sensitivity problems |

> ⚠️ **Warning:** Don't store several values in one column (like a comma-separated list of tags). Searching and updating them later becomes very painful. Give them their own rows or table instead.

> 🏆 **Golden Rule:** **Nouns become tables, facts become columns.** Sketch the tables on paper first, and only write SQL once the sketch makes sense.


## 🏗️ 3. Creating Tables

**What it does:** `CREATE TABLE` builds a new, empty table and defines its **columns** and what **type of data** each column may hold.
**Why it is used:** A table must exist before you can store anything in it. The column types also make Postgres reject nonsense, like text in a number column.
**When to use it:** Once per table, after your design is ready (topic 2).

**Analogy:** It's printing an empty spreadsheet with the column headers filled in and each column locked to a data type, before anyone types a single row.

```sql
CREATE TABLE cities (
  name VARCHAR(50),
  country VARCHAR(50),
  population INTEGER,
  area INTEGER
);
```
**Output:**
```
CREATE TABLE
```

**Check that it exists:**
```sql
\dt
```
**Output:**
```
          List of relations
 Schema |  Name  | Type  |  Owner
--------+--------+-------+----------
 public | cities | table | postgres
(1 row)
```
`\dt` is a psql command (it starts with a backslash), not SQL.

**Common data types:**

| Type | Stores | Example value |
|---|---|---|
| `INTEGER` | Whole numbers | `38505000` |
| `NUMERIC(10, 2)` | Exact decimals (good for money) | `199.99` |
| `VARCHAR(50)` | Text up to 50 characters | `'Tokyo'` |
| `TEXT` | Text of any length | A long description |
| `BOOLEAN` | True or false | `true` |
| `DATE` | A calendar date | `'2026-11-10'` |
| `TIMESTAMP` | Date and time | `'2026-11-10 14:30:00'` |

**If the table already exists:**
```
ERROR:  relation "cities" already exists
```
Fix it safely with:
```sql
CREATE TABLE IF NOT EXISTS cities (
  name VARCHAR(50),
  country VARCHAR(50),
  population INTEGER,
  area INTEGER
);
```
**Output:**
```
NOTICE:  relation "cities" already exists, skipping
CREATE TABLE
```

**Delete a table you want to rebuild:**
```sql
DROP TABLE cities;
```
**Output:**
```
DROP TABLE
```

> ⚠️ **Warning:** **`DROP TABLE` permanently deletes the table and all its data.** There is no undo prompt. Double-check the name, and never run it on a production database casually.

> ⚠️ **Warning:** Money should use `NUMERIC`, not a floating-point type, so cents are never rounded oddly.

> 🏆 **Golden Rule:** Pick the **most specific type** that fits the data. The database then protects you from bad values for free.



## 🔍 4. Analyzing CREATE TABLE

**What it does:** Breaks the `CREATE TABLE` statement into its parts so you know **what every word and symbol does**, instead of copying it blindly.
**Why it is used:** Once you can read each piece, writing new tables (and fixing errors) becomes easy.
**When to use it:** Any time a statement looks confusing, or an error points to a specific part of it.

**Analogy:** It's like diagramming a sentence in grammar class: this word is the verb, this is the object, this is the punctuation.

```sql
CREATE TABLE cities (
  name VARCHAR(50),
  country VARCHAR(50),
  population INTEGER,
  area INTEGER
);
```

**Piece by piece:**

| Part | Kind | What it does |
|---|---|---|
| `CREATE TABLE` | **Keyword** | Tells Postgres what you want to do |
| `cities` | **Identifier** | The name you chose for the table |
| `( ... )` | Punctuation | Wraps the list of columns |
| `name`, `country`, `population`, `area` | **Identifiers** | The names you chose for each column |
| `VARCHAR(50)`, `INTEGER` | **Data types** | What each column may store |
| `,` | Punctuation | Separates one column from the next (**no comma after the last one**) |
| `;` | Punctuation | Ends the statement |

**Each column line follows the same pattern:**
```
column_name  DATA_TYPE
```

**Keyword vs identifier:**

| | Keyword | Identifier |
|---|---|---|
| **Who decides it** | SQL / Postgres | **You** |
| **Examples** | `CREATE`, `TABLE`, `SELECT`, `INTEGER` | `cities`, `population` |
| **Convention** | Write in `UPPERCASE` | Write in `lowercase_snake_case` |

**See the structure Postgres actually stored:**
```sql
\d cities
```
**Output:**
```
                    Table "public.cities"
   Column   |         Type          | Collation | Nullable | Default
------------+-----------------------+-----------+----------+---------
 name       | character varying(50) |           |          |
 country    | character varying(50) |           |          |
 population | integer               |           |          |
 area       | integer               |           |          |
```
Notice that `VARCHAR(50)` is shown as `character varying(50)`. They are the same type.

**What `VARCHAR(50)` really means:** up to **50 characters**. A longer value is rejected:
```
ERROR:  value too long for type character varying(50)
```

**Case rules:**
- SQL keywords are **not** case-sensitive (`create table` works), but uppercase makes them easy to spot.
- Unquoted names are folded to **lowercase** by Postgres, so `Cities` and `cities` are the same table.

> ⚠️ **Warning:** A **trailing comma** after the last column (`area INTEGER,`) causes a syntax error. A missing comma between columns causes one too.

> ⚠️ **Warning:** Avoid **double-quoted** names like `"Cities"`. They become case-sensitive, and you'll have to quote them every time.

> 🏆 **Golden Rule:** Read a `CREATE TABLE` as **"create a table named X with these (column name, data type) pairs."** Every column line is just a name followed by a type.


## ➕ 5. Inserting Data Into a Table

**What it does:** `INSERT INTO` adds one or more **new rows** to a table.
**Why it is used:** A new table is empty. Inserting is how data gets in (a new user signs up, an order is placed).
**When to use it:** Any time you need to store a new record.

**Analogy:** Filling in a new line on a paper form. You say which boxes (columns) you're filling, then write the values in the same order.

```sql
INSERT INTO cities (name, country, population, area)
VALUES ('Tokyo', 'Japan', 38505000, 8223);
```
**Output:**
```
INSERT 0 1
```
`INSERT 0 1` means one row was inserted (the `0` is a legacy value you can ignore).

**Insert several rows in one statement:**
```sql
INSERT INTO cities (name, country, population, area)
VALUES
  ('Delhi', 'India', 28125000, 2240),
  ('Shanghai', 'China', 22125000, 4015),
  ('Sao Paulo', 'Brazil', 20935000, 3043);
```
**Output:**
```
INSERT 0 3
```

**How the values line up:**

| Column | `name` | `country` | `population` | `area` |
|---|---|---|---|---|
| Value | `'Tokyo'` | `'Japan'` | `38505000` | `8223` |

The 1st value goes into the 1st column, the 2nd into the 2nd, and so on.

**Quote rules:**

| Kind of value | How to write it |
|---|---|
| Text | **Single** quotes: `'Tokyo'` |
| Numbers | No quotes: `38505000` |
| Text containing an apostrophe | Double the apostrophe: `'Cote d''Ivoire'` |

**Common errors:**
```
ERROR:  INSERT has more expressions than target columns
```
You gave more values than columns. Count them.
```
ERROR:  column "Name" of relation "cities" does not exist
```
Wrong column name, or you used double quotes. Use `name`.
```
ERROR:  invalid input syntax for type integer: "lots"
```
Text was placed in a number column.

> ⚠️ **Warning:** **Double quotes mean "this is a column or table name", single quotes mean "this is a text value".** `VALUES ("Tokyo")` fails because Postgres looks for a column named Tokyo.

> ⚠️ **Warning:** Running the same `INSERT` twice creates **duplicate rows**. This table has no unique rule yet (primary keys come later).

> 🏆 **Golden Rule:** Always list the column names in `INSERT INTO table (col1, col2)`. It keeps your statement correct even if the table gains a column later.


## 🔎 6. Retrieving Data with Select

**What it does:** `SELECT` reads data from a table and returns it as a **result set** (a temporary table of rows). It never changes the stored data.
**Why it is used:** Storing data is pointless unless you can get it back out and look at it.
**When to use it:** Every time you want to see, display, or analyze data.

**Analogy:** Asking a librarian: "Show me the title and author columns from the books shelf." You can look at the answer, but the shelf itself stays exactly as it was.

**Get every column and every row:**
```sql
SELECT * FROM cities;
```
**Output:**
```
   name    | country | population | area
-----------+---------+------------+------
 Tokyo     | Japan   |   38505000 | 8223
 Delhi     | India   |   28125000 | 2240
 Shanghai  | China   |   22125000 | 4015
 Sao Paulo | Brazil  |   20935000 | 3043
(4 rows)
```
`*` means "all columns".

**Get only specific columns:**
```sql
SELECT name, country FROM cities;
```
**Output:**
```
   name    | country
-----------+---------
 Tokyo     | Japan
 Delhi     | India
 Shanghai  | China
 Sao Paulo | Brazil
(4 rows)
```

**Change the column order:**
```sql
SELECT country, name FROM cities;
```
**Output:**
```
 country |   name
---------+-----------
 Japan   | Tokyo
 India   | Delhi
 China   | Shanghai
 Brazil  | Sao Paulo
(4 rows)
```
The order in `SELECT` controls the order of the output columns.

**Reading the statement:**

| Part | Meaning |
|---|---|
| `SELECT` | "Show me..." |
| `name, country` or `*` | ...these columns |
| `FROM cities` | ...from this table |

> ⚠️ **Warning:** `SELECT *` is great for exploring, but in real apps list only the columns you need. It's faster, and it avoids leaking private columns (like emails or password hashes).

> ⚠️ **Warning:** `SELECT` with no `WHERE` returns **every row**. That is fine for 4 rows and painful for 4 million. Filtering comes in later topics.

> 🏆 **Golden Rule:** `SELECT` **never changes** the table. It's always safe to run, so experiment freely.