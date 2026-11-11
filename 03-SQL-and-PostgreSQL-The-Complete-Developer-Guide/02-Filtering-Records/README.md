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