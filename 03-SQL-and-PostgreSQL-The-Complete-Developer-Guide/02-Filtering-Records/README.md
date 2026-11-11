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