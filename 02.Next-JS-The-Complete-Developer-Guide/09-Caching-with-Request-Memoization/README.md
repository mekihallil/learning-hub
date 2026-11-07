## 🔂 86. Multiple Repeated DB Queries

**What it does:** Explains the problem that appears when many components each ask the database for the **same data**. The page looks fine, but behind the scenes the same query runs dozens of times.
**Why it matters:** Nothing breaks. There's no error, no warning, and the page still renders correctly. You only notice later, when the app gets slow or the database bill grows. The comment thread from topic 85 is the perfect example.
**When it happens:** Whenever **child components fetch for themselves** (topic 78) and several of them need the **same** record or list.

**Analogy:** Ten people in an office each walk to the archive room to pull the **same file**, one after another. The file only needed to be fetched once and photocopied. The trip itself is the expensive part, not the file.

**How the problem creeps in:**
```tsx
// CommentList asks for all comments on post 42...
const comments = await fetchCommentsByPostId("42");

// ...and EVERY CommentShow asks for the very same list again
const comments = await fetchCommentsByPostId("42");
```
```
1 CommentList + 20 CommentShow components = 21 identical queries
```

**Step 1: Make the problem visible with a log.** Add a `console.log` to the query function:
```tsx
// db/queries/comments.ts
export function fetchCommentsByPostId(postId: string) {
  console.log("Querying comments for post", postId);

  return db.comment.findMany({
    where: { postId },
    include: { user: { select: { name: true, image: true } } },
  });
}
```
**Output (in the server terminal, not the browser):**
```
Querying comments for post 42
Querying comments for post 42
Querying comments for post 42
Querying comments for post 42
... (repeated once per comment on the page)
```
The same line printing again and again is the symptom.

**Step 2: Or log every query Prisma sends (no code changes to your query functions):**
```tsx
// db/index.ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient({
  log: ["query"],
});
```
**Output:**
```
prisma:query SELECT "Comment"."id", ... FROM "Comment" WHERE "Comment"."postId" = ?
prisma:query SELECT "Comment"."id", ... FROM "Comment" WHERE "Comment"."postId" = ?
prisma:query SELECT "Comment"."id", ... FROM "Comment" WHERE "Comment"."postId" = ?
```
Identical `SELECT` lines back to back mean duplicated work.

**Why it feels harmless at first (and why it isn't):**

| | With a few comments | With a busy thread |
|---|---|---|
| **Duplicate queries** | 3 to 5 | 100+ |
| **Page speed** | Feels fine | Noticeably slower |
| **Database load** | Negligible | Real cost, and it multiplies per visitor |
| **SQLite (local)** | Hidden by being a local file | Still wasteful |
| **Hosted database** | Each query is a **network round trip** | Latency adds up quickly |

> **Why SQLite hides it:** reading a local file is extremely fast, so duplicates don't hurt while developing. The same code can crawl when the database moves to a hosted server (topic 42 warns about this move).

**Where repeated queries usually come from:**

| Pattern | Example |
|---|---|
| Recursive components that each fetch (topic 84) | `CommentShow` inside `CommentShow` |
| A page **and** its child both need the same record | Page fetches the topic for a heading, `PostList` fetches it again |
| A layout and a page both check the user | Both call `auth()` or look up the same user |
| List items that each fetch their own related data | 50 posts each fetching their author (N+1, topic 78) |

**Two different problems, two different fixes:**

| Problem | Example | Fix |
|---|---|---|
| **Same** query repeated (identical arguments) | 21 × `fetchCommentsByPostId("42")` | **Deduplicate** it (topic 87) |
| **Different** queries that could be one (N+1) | 50 × `findUnique` for 50 authors | **Combine** them with `include` / `select` (topic 78) |

> ⚠️ **Warning:** Don't assume "no errors" means "no problem." Repeated queries produce **correct** pages, so you only find them by looking at your **server logs**.

> ⚠️ **Warning:** Check the logs in the **terminal where `npm run dev` or `npm start` is running**, not the browser console. Server Components log to the server.

> 🏆 **Golden Rule:** After building any page where child components fetch data, **look at the terminal once**. If the same query line prints more than once for one page load, you have a duplicate to fix.

---

## 🧬 87. Introducing Duplicate Queries (and How `cache()` Solves Them)

**What it does:** Introduces React's **`cache()`** function, which wraps a query so that **identical calls during one page render share a single result**. The first call hits the database, and every repeat call gets the saved answer instantly.
**Why it is used:** It lets every component keep fetching its own data (clean, self-contained code from topic 78) **without** paying for it many times over.
**When to use it:** On any read-only query function that **several components may call** in the same render.

**Analogy:** The office archive room gets a **sticky note on the door**: "Post 42 comments are already out on the desk." The first person fetches the file and leaves it there. Everyone after them just reads it from the desk instead of making the trip.

**The fix: wrap the query in `cache()`:**
```tsx
// db/queries/comments.ts
import { cache } from "react";
import { db } from "@/db";

export const fetchCommentsByPostId = cache((postId: string) => {
  console.log("Querying comments for post", postId);

  return db.comment.findMany({
    where: { postId },
    include: { user: { select: { name: true, image: true } } },
  });
});
```
Nothing else changes. `CommentList` and every `CommentShow` still call `fetchCommentsByPostId(postId)` exactly as before.

**Output (server terminal):**
```
Before:  Querying comments for post 42   ← repeated 21 times
After:   Querying comments for post 42   ← printed ONCE
```

**How it works behind the scenes:**
```
Call 1: fetchCommentsByPostId("42")  → not seen yet → runs the query → saves the result
Call 2: fetchCommentsByPostId("42")  → already saved → returns it instantly
Call 3: fetchCommentsByPostId("42")  → already saved → returns it instantly
Call 4: fetchCommentsByPostId("99")  → different argument → runs a NEW query
```
React remembers results **per set of arguments**.

**Important: the argument rules.** `cache()` decides "is this the same call?" by comparing arguments with **strict equality** (`===`-style), not by looking inside objects:

| Argument | Deduped? | Why |
|---|---|---|
| `"42"` (string) | ✅ Yes | Same value, strictly equal |
| `42` (number) | ✅ Yes | Same |
| `{ postId: "42" }` (object literal) | ❌ **No** | Each `{...}` is a **new object**, so they never compare equal |
| The same object variable passed twice | ✅ Yes | Same reference |

```tsx
// ❌ Two separate object literals look identical but are NOT equal, so no dedupe
fetchComments({ postId: "42" });
fetchComments({ postId: "42" });

// ✅ Pass primitives (strings and numbers) so repeated calls match
fetchComments("42");
fetchComments("42");
```

**What `cache()` does NOT do:**

| It is | It is NOT |
|---|---|
| Scoped to **one request** (one page render) | A long-term cache shared between visitors |
| A way to avoid **repeating the same read** during a render | A replacement for `revalidatePath` / `revalidateTag` (topic 53) |
| For **reading** data | For writes. Never wrap `create`, `update`, or `delete` in it |
| Per-**function** (each wrapped function has its own memory) | Shared across different functions that run similar queries |

**Output (what happens on the next page visit):**
```
Visitor A loads /topics/javascript/posts/42  → 1 query (shared across all components)
Visitor B loads the same page               → 1 NEW query (cache doesn't carry over)
```
Each page load gets its own fresh result, which is exactly what keeps data from going stale between visitors.

**Comparing the tools that dedupe or cache:**

| Tool | Dedupes within a render? | Persists across requests? | Works with Prisma? |
|---|---|---|---|
| React `cache()` | ✅ Yes | ❌ No | ✅ **Yes**, wrap your function |
| Automatic `fetch()` memoization (topic 34) | ✅ Yes | Via the Data Cache (separate) | ❌ Only for `fetch()` calls, **not** Prisma |
| Next.js `revalidate` / tags (topics 36 and 39) | n/a | ✅ Yes | Applies to pages and `fetch` |

> **Why Prisma needs `cache()`:** Next.js automatically dedupes `fetch()` requests, but a Prisma query is **not** a `fetch()`. React's `cache()` is how you get the same benefit for database calls.

**Where to apply it, and where not to:**

| ✅ Wrap in `cache()` | ❌ Don't wrap |
|---|---|
| `fetchCommentsByPostId(postId)` | `createComment`, `deletePost` (mutations) |
| `fetchTopicBySlug(slug)` | A query that must return **fresh** data twice in one render |
| `getCurrentUser()` helpers used by many components | Anything taking a **new object** argument each call |
| Any read used by a parent **and** its children | Functions that are only ever called once |

**Quick test checklist:**
- [ ] Add 3 or 4 comments and replies to a post
- [ ] Load the post page and count `Querying comments...` lines in the terminal (should be **1**)
- [ ] Temporarily remove `cache()` and reload (you should see one line per component)
- [ ] Put `cache()` back
- [ ] Create a new comment and confirm it appears (`revalidatePath` still handles freshness)

> ⚠️ **Warning:** `cache()` dedupes only while **React is rendering a page**. Calling a cached function from a **Server Action** or a **Route Handler** does not give you the same sharing, so don't rely on it there.

> ⚠️ **Warning:** In `npm run dev`, extra renders (hot reload, React's development checks) can make logs look noisier than in production. **Verify with `npm run build && npm start`** before concluding that dedupe isn't working (topic 57).

> ⚠️ **Warning:** Data is deduped **within the render**, so if a Server Component changes data and then reads it again **in the same render**, it would see the old cached result. Mutations belong in Server Actions, which run **outside** the render.

> ⚠️ **Version note:** `cache()` from `react` is the established approach for deduping non-`fetch` work. Newer Next.js versions are adding extra caching APIs (such as the `use cache` directive), and the `log: ["query"]` Prisma option can differ slightly in newer Prisma versions (including 7, which may need a driver adapter configured). Check the [Next.js caching docs](https://nextjs.org/docs/app/guides/caching) and the [Prisma docs](https://www.prisma.io/docs) for your versions.

> 🏆 **Golden Rule:** **Fetch where it's used, dedupe with `cache()`.** Keep each component self-contained, wrap shared **read** queries in `cache()`, pass **strings and numbers** as arguments, and confirm in the terminal that each query prints **once** per page load.