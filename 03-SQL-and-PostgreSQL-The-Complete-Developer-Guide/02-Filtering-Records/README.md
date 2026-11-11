## 🎯 10. Filtering Rows with Where

**What it does:** `WHERE` keeps only the rows that pass a **true/false test** and throws away the rest, so `SELECT` returns just the rows you care about.
**Why it is used:** Real tables are big. You rarely want every row, you want "cities bigger than X" or "orders from this customer."
**When to use it:** Any time you don't want the whole table.

**Analogy:** It's the filter panel on a shopping site (price under $50, brand = Nike). The products stay in the store, you just only see the ones that match.

```sql
SELECT name, area
FROM cities
WHERE area > 4000;
```
**Output:**
```
   name   | area
----------+------
 Tokyo    | 8223
 Shanghai | 4015
(2 rows)
```

**What Postgres does with each row:**

| Row | Test: `area > 4000` | Kept? |
|---|---|---|
| Tokyo (8223) | true | ✅ |
| Delhi (2240) | false | ❌ |
| Shanghai (4015) | true | ✅ |
| Sao Paulo (3043) | false | ❌ |

**The order Postgres works in:**

| Step | Clause | What happens |
|---|---|---|
| 1 | `FROM cities` | Grab the table (4 rows) |
| 2 | `WHERE area > 4000` | Keep rows where the test is true (2 rows) |
| 3 | `SELECT name, area` | Pick the columns to show |

Note that the order you **write** the clauses is `SELECT`, `FROM`, `WHERE`, but Postgres **runs** them as `FROM`, `WHERE`, `SELECT`.

**If no row matches, it is not an error:**
```sql
SELECT name FROM cities WHERE area > 99999;
```
**Output:**
```
 name
------
(0 rows)
```

> ⚠️ **Warning:** `WHERE` only filters the **result**. It never changes or deletes anything stored in the table.

> ⚠️ **Warning:** Clause order matters. `WHERE` must come **after** `FROM`, otherwise you get `ERROR: syntax error at or near "WHERE"`.

> 🏆 **Golden Rule:** A `WHERE` clause is a **true/false test run on every row**. True means the row stays, false means it's dropped.


## 🔬 11. More on the Where Keyword

**What it does:** Introduces the full set of **comparison operators** you can use inside a `WHERE` test, not just `>`.
**Why it is used:** Different questions need different tests: equal to, not equal to, within a range, or missing entirely.
**When to use it:** Any time you build a `WHERE` condition.

**Analogy:** Each operator is a different question you ask about a value: "is it exactly this?", "is it bigger?", "is it between these two?"

**The operators:**

| Operator | Meaning | Example |
|---|---|---|
| `=` | Equal to (**one** equals sign) | `area = 8223` |
| `<>` or `!=` | Not equal to | `country <> 'India'` |
| `>` | Greater than | `area > 4000` |
| `<` | Less than | `area < 4000` |
| `>=` | Greater than or equal | `area >= 4015` |
| `<=` | Less than or equal | `area <= 4015` |
| `BETWEEN a AND b` | Within a range, **including both ends** | `area BETWEEN 2000 AND 4000` |
| `IN (...)` | Matches any value in a list (topic 15) | `name IN ('Delhi', 'Tokyo')` |
| `IS NULL` | The value is missing | `area IS NULL` |

**Equal to:**
```sql
SELECT name, area FROM cities WHERE area = 8223;
```
**Output:**
```
 name  | area
-------+------
 Tokyo | 8223
(1 row)
```

**Between two values:**
```sql
SELECT name, area FROM cities WHERE area BETWEEN 2000 AND 4000;
```
**Output:**
```
   name    | area
-----------+------
 Delhi     | 2240
 Sao Paulo | 3043
(2 rows)
```
`BETWEEN 2000 AND 4000` is the same as `area >= 2000 AND area <= 4000`. Shanghai (4015) is just outside the range.

**Not equal to:**
```sql
SELECT name FROM cities WHERE country <> 'India';
```
**Output:**
```
   name
-----------
 Tokyo
 Shanghai
 Sao Paulo
(3 rows)
```

**Text comparisons are case-sensitive:**
```sql
SELECT name FROM cities WHERE name = 'delhi';
```
**Output:**
```
 name
------
(0 rows)
```
`'delhi'` is not `'Delhi'`. Use `LOWER(name) = 'delhi'` to ignore case (topic 9).

**Checking for missing values:**
```sql
SELECT name FROM cities WHERE area IS NULL;
```
**Output:**
```
 name
------
(0 rows)
```
No city here is missing its area, so nothing matches.

> ⚠️ **Warning:** SQL uses a **single** `=` to compare. Writing `==` is a syntax error.

> ⚠️ **Warning:** **Never write `= NULL`.** `NULL` means "unknown," and nothing equals unknown, not even `NULL` itself. `WHERE area = NULL` quietly returns 0 rows. Use `IS NULL` or `IS NOT NULL`.

> ⚠️ **Warning:** Text values need **single quotes** (`'Delhi'`). Double quotes mean "a column name" (topic 5).

> 🏆 **Golden Rule:** `=` for equal, `<>` for not equal, `BETWEEN` for ranges (ends included), `IS NULL` for missing values.


## 🧩 12. Compound Where Clauses

**What it does:** Combines several tests in one `WHERE` using `AND`, `OR`, and `NOT`.
**Why it is used:** Real questions have more than one condition: "big **and** populous," or "Delhi **or** very large."
**When to use it:** Any time one test isn't enough.

**Analogy:** `AND` is a nightclub needing **both** a ticket **and** an ID. `OR` is a door that opens for **either** a ticket **or** a VIP pass.

| Keyword | A row is kept when... |
|---|---|
| `AND` | **Both** sides are true |
| `OR` | **At least one** side is true |
| `NOT` | The test is **false** (it flips the result) |

**AND:**
```sql
SELECT name, area, population
FROM cities
WHERE area > 4000 AND population > 30000000;
```
**Output:**
```
 name  | area | population
-------+------+------------
 Tokyo | 8223 |   38505000
(1 row)
```
Shanghai has an area over 4000, but its population is under 30 million, so it fails the second test.

**OR:**
```sql
SELECT name, area
FROM cities
WHERE area > 4000 OR name = 'Delhi';
```
**Output:**
```
   name   | area
----------+------
 Tokyo    | 8223
 Delhi    | 2240
 Shanghai | 4015
(3 rows)
```

**NOT:**
```sql
SELECT name FROM cities WHERE NOT (area > 4000);
```
**Output:**
```
   name
-----------
 Delhi
 Sao Paulo
(2 rows)
```

**Mixing `AND` and `OR` (the tricky part).** `AND` is evaluated **before** `OR`, like multiplication before addition.
```sql
-- Without parentheses
SELECT name FROM cities
WHERE name = 'Delhi' OR name = 'Tokyo' AND area > 5000;
```
Postgres reads this as: `name = 'Delhi'` **OR** (`name = 'Tokyo'` AND `area > 5000`).
**Output:**
```
 name
-------
 Tokyo
 Delhi
(2 rows)
```

```sql
-- With parentheses
SELECT name FROM cities
WHERE (name = 'Delhi' OR name = 'Tokyo') AND area > 5000;
```
**Output:**
```
 name
-------
 Tokyo
(1 row)
```
Now both names must also pass `area > 5000`, so Delhi (2240) drops out.

**Each side must be a complete test:**
```sql
-- ❌ Wrong
WHERE area > 4000 AND < 9000
-- ✅ Right
WHERE area > 4000 AND area < 9000
```
The wrong version gives `ERROR: syntax error at or near "<"`.

> ⚠️ **Warning:** Forgetting that `AND` runs before `OR` is one of the most common SQL bugs. It returns plausible but **wrong** rows with no error.

> 🏆 **Golden Rule:** **When you mix `AND` and `OR`, always add parentheses** to say exactly what you mean, even when you think the default is fine.


## 📝 13. A Where Exercise Overview

**What it does:** Sets up a short **practice exercise** so you can write `WHERE` queries yourself, using the `phones` table.
**Why it is used:** Reading SQL is easy, writing it is what builds the skill. Trying each question before looking at the answer (topic 14) is how it sticks.
**When to use it:** After topics 10 to 12, before moving on.

**The table to practice on:**
```sql
SELECT * FROM phones;
```
**Output:**
```
    name     | manufacturer | price | units_sold
-------------+--------------+-------+------------
 N1280       | Nokia        |   199 |       1925
 iPhone 5S   | Apple        |   399 |       9436
 Galaxy S5   | Samsung      |   299 |       2359
 S5620 Monte | Samsung      |   250 |       2385
(4 rows)
```

**A worked example (not one of the tasks):** print the name of phones that cost more than 300.
```sql
SELECT name FROM phones WHERE price > 300;
```
**Output:**
```
   name
-----------
 iPhone 5S
(1 row)
```

**A 3-step method for every question:**

| Step | Ask yourself | In the example |
|---|---|---|
| 1 | Which **columns** does the answer show? → `SELECT` | `name` |
| 2 | Which **table**? → `FROM` | `phones` |
| 3 | Which **rows** qualify? → `WHERE` | `price > 300` |

**Your tasks.** Write one query for each, then compare with the expected output.

**Task 1.** Print the name and manufacturer of all phones made by Samsung.
**Expected output:**
```
    name     | manufacturer
-------------+--------------
 Galaxy S5   | Samsung
 S5620 Monte | Samsung
(2 rows)
```

**Task 2.** Print the name and price of phones that sold fewer than 2,000 units **or** cost more than 350.
**Expected output:**
```
   name    | price
-----------+-------
 N1280     |   199
 iPhone 5S |   399
(2 rows)
```

**Task 3.** Print the name of phones priced between 200 and 300, including both ends.
**Expected output:**
```
    name
-------------
 Galaxy S5
 S5620 Monte
(2 rows)
```

**Hints:**

| Task | Hint |
|---|---|
| 1 | Text needs single quotes, and capitalization matters |
| 2 | Is "or" in English the same as `OR` in SQL here? Check both sides carefully |
| 3 | Look back at `BETWEEN` in topic 11 |

> ⚠️ **Warning:** Don't peek at topic 14 first. Even a wrong attempt teaches you more than reading the answer.

> 🏆 **Golden Rule:** Break every question into **what to show, where from, and which rows**. It turns any plain-English request into a query.