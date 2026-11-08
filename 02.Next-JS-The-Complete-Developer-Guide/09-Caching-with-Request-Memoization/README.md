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



## 🧠 88. Request Memoization

**What it does:** While Next.js renders **one page request** on the server, identical `fetch()` calls are **automatically merged into one**. The first call goes to the network, and every later call with the same URL and options gets the same result back.
**Why it is used:** In the App Router, many components fetch their own data (topics 78 to 80). Without memoization, a layout, a page, and three children could all request the same URL and hit the server five times.
**When to use it:** You don't turn it on, it's automatic. You just need to know it exists so you can fetch **where the data is used** without worrying about duplicates.

**Analogy:** A waiter takes the same drink order from three people at one table. Instead of making three trips to the bar, they make **one trip** and hand out the same drink. When the table is cleared (the request ends), the waiter forgets the order.

**Example: three components, one network request:**
```tsx
async function getUser() {
  const res = await fetch("https://api.example.com/user/1");
  return res.json();
}

// layout.tsx           → await getUser()
// page.tsx             → await getUser()
// components/Header    → await getUser()
```
**Output:**
```
Calls in the code:        3
Real network requests:    1   ← the other two reuse the first result
```

**The rules:**

| Question | Answer |
|---|---|
| What is memoized? | `fetch()` calls using the **GET** method |
| What counts as "identical"? | Same URL **and** same options |
| How long does it last? | One server render pass (one request), then it's discarded |
| Shared between different users or requests? | ❌ No, every request starts fresh |
| Works in Client Components? | ❌ No, it's a server-side React feature |

**Request Memoization is not the Data Cache (topic 34):**

| | Request Memoization | Data Cache |
|---|---|---|
| **Lasts** | One request | Across requests (and deploys) |
| **Purpose** | Avoid duplicate calls **within** one render | Avoid refetching on **later** requests |
| **Controlled by** | React (automatic) | `cache`, `revalidate`, `revalidatePath` |
| **Cleared by** | The request ending | Revalidation |

**The big limitation: it only covers `fetch()`.** Prisma, SQL, and other database calls are **not** `fetch()`, so they are **not** memoized:
```tsx
// ❌ NOT deduplicated: this is Prisma, not fetch()
const topic = await db.topic.findUnique({ where: { slug } }); // in the page
const topic = await db.topic.findUnique({ where: { slug } }); // in a child
```
**Output:**
```
Calls in the code:        2
Real database queries:    2   ← both run
```
That's exactly the problem topic 89 solves.

**What can opt a `fetch()` out of memoization:**

| Cause | Why |
|---|---|
| Different URL or different options | They're no longer "identical" |
| Using `POST` (or any non-GET method) | Only GET is memoized |
| Passing an `AbortController` `signal` | Aborting makes sharing unsafe |

> ⚠️ **Warning:** Don't confuse memoization with persistent caching. It only prevents duplicates **inside one render**. The next visitor's request fetches again, unless the Data Cache (topics 34 and 36) applies.

> ⚠️ **Warning:** Memoization doesn't make `fetch` calls cheaper to **write** badly. If two components need the same data, it's fine to fetch in both, but if the **options differ even slightly** (different headers, different query string), you pay for two requests.

> ⚠️ **Version note:** Caching defaults changed across Next.js 14, 15, and 16, but request memoization of identical GET `fetch()` calls in a single render has remained a React-level behavior. Always confirm against the [official caching docs](https://nextjs.org/docs/app/guides/caching) for your version.

> 🏆 **Golden Rule:** For `fetch()`, relax and fetch where you need the data. Next.js merges the duplicates for you. For anything **not** `fetch()` (Prisma, SQL, SDKs), you must deduplicate yourself (topic 89).

---

## 🔁 89. Deduplicating Requests with `cache`

**What it does:** React's `cache()` function wraps **any** async function (a Prisma query, an SDK call, a calculation) and remembers its result for the duration of one request. Calling it again with the **same arguments** returns the saved result instead of running the function again.
**Why it is used:** Request memoization (topic 88) only covers `fetch()`. Prisma queries need a manual version of the same idea, so a page and its children can ask for the same record without hitting the database repeatedly.
**When to use it:** Whenever **two or more components** in the same render need the same database result, such as the page needing a topic for a heading while a child needs it for permissions, or **every comment in a thread** asking for "the comments of this post" (topic 84).

**Analogy:** A librarian keeps a sticky note on the desk: "Book 42, shelf C." The first time someone asks, the librarian walks to the shelf. The next person asking for book 42 gets the note instead. When the library closes (the request ends), the notes are thrown away.

**Step 1: Wrap the query once, at module level:**
```tsx
// db/queries/topics.ts
import { cache } from "react";
import { db } from "@/db";

export const fetchTopicBySlug = cache(async (slug: string) => {
  console.log("DB QUERY: topic", slug);
  return db.topic.findUnique({ where: { slug } });
});
```

**Step 2: Call it from as many components as you like:**
```tsx
// app/topics/[slug]/page.tsx
const topic = await fetchTopicBySlug(slug);
if (!topic) notFound();

// components/topics/TopicSidebar.tsx
const topic = await fetchTopicBySlug(slug);   // reuses the first result
```
**Output (server terminal):**
```
DB QUERY: topic javascript      ← printed ONCE, even though two components asked
```

**Before and after, with the comment thread from topic 84:**
```tsx
// db/queries/comments.ts
export const fetchCommentsByPostId = cache((postId: string) => {
  return db.comment.findMany({
    where: { postId },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
});
```
```
Without cache():   CommentList + 20 CommentShow components = 21 queries
With cache():      CommentList + 20 CommentShow components = 1 query
```
Every `CommentShow` can call `fetchCommentsByPostId(postId)` and simply pick out its own comment and replies, without extra database work.

**How `cache()` decides two calls are "the same":**

| Arguments | Same call? |
|---|---|
| `"javascript"` and `"javascript"` | ✅ Yes (primitives compare by **value**) |
| `42` and `42` | ✅ Yes |
| `"javascript"` and `"cooking"` | ❌ No, separate results |
| `{ slug: "a" }` and `{ slug: "a" }` (two separate objects) | ❌ **No**, objects compare by **reference** |

**Practical example: the object gotcha:**
```tsx
// ❌ Each call creates a NEW object, so cache never hits
const getTopic = cache(async (opts: { slug: string }) => { ... });
getTopic({ slug: "javascript" });
getTopic({ slug: "javascript" });   // runs again

// ✅ Use primitive arguments
const getTopic = cache(async (slug: string) => { ... });
getTopic("javascript");
getTopic("javascript");             // reused
```

**Comparing the three tools you now know:**

| | Request Memoization (topic 88) | `cache()` (this topic) | Data Cache (topic 34) |
|---|---|---|---|
| **Works on** | `fetch()` only | **Any** async function | `fetch()` (and Next.js caching APIs) |
| **Setup needed** | None, automatic | Wrap the function | Options like `revalidate` |
| **Lasts** | One request | One request | Across requests |
| **Use it for** | Duplicate API calls | Duplicate **Prisma/SQL** calls | Data that can be reused between visitors |

**Do you still need it for Prisma if you fetch only once?** No. If only one component ever calls the query, `cache()` changes nothing. Add it **when a second caller appears**.

**Where to define cached functions:**
```tsx
// ✅ Module level (top of the file), created once
export const fetchTopicBySlug = cache(async (slug: string) => { ... });

// ❌ Inside a component, a brand new cache is created on every render, so nothing is shared
export default async function Page() {
  const fetchTopic = cache(async (slug: string) => { ... });
}
```

> ⚠️ **Warning:** `cache()` works **only in Server Components** and **only for the current request**. It never shares results between users, which also makes it safe for per-user data.

> ⚠️ **Warning:** It does **not** survive revalidation or the next request. It is not a replacement for Next.js caching (topics 36 and 39) or for `revalidatePath` after mutations (topic 53).

> ⚠️ **Warning:** Use **primitive arguments** (strings, numbers) so the cache can recognize repeats. Passing a fresh object every time silently defeats it.

> ⚠️ **Warning:** A cached function should be **read-only**. Don't wrap creates, updates, or deletes in `cache()`. Those are Server Actions (topics 73 to 76) and must run every time.

> ⚠️ **Version note:** `cache` from `react` handles **per-request** deduplication. For **cross-request** caching of database results, Next.js offers separate APIs (`unstable_cache` in older versions, and newer caching directives in recent versions), and these have changed between releases. Check the [Next.js docs](https://nextjs.org/docs/app/guides/caching) for your version before relying on them. The `Prisma` client import path may also differ in newer Prisma versions (topic 76).

> 🏆 **Golden Rule:** `fetch()` is deduplicated **for you**. Anything else (especially Prisma) needs **`cache()`**. Wrap each shared query **once, at module level, with primitive arguments**, and then call it freely from any component that needs it.


## 🔂 90. Multiple Repeated DB Queries

**What it does:** Explains the problem that appears when **many components each ask the database for the same thing**. Nothing looks broken, the page renders correctly, but behind the scenes the same query runs over and over.
**Why it is useful:** Topics 78 to 80 encouraged fetching in child components. That's great for reusability, but it has a hidden cost. Repeated queries make pages slower, waste database capacity, and only show up as real pain once you have more data.
**When to care:** Any page that renders **a list of components that each fetch for themselves**, such as a comment thread (topic 84), a post list, or a set of cards.

**Analogy:** Ten cooks each walk to the pantry to get the same bag of flour, one after another. The kitchen works, but nine of those trips were wasted. One cook could have grabbed it once and shared.

**Two different problems that look similar:**

| Problem | What happens | Example |
|---|---|---|
| **Duplicate queries** | The **same** query runs many times | 20 comments each running `findMany({ where: { postId } })` |
| **N+1 queries** | One query for a list, then **one more per item** | 1 query for 50 posts, then 50 queries for each post's author |

| | Duplicate queries | N+1 queries |
|---|---|---|
| **Queries are** | Identical | Similar but with different ids |
| **Best fix** | `cache()` (topic 89) | `include` / `select` in one query (topic 78) |
| **Grows with** | Number of components | Number of rows |

**Why it's easy to miss:**
```
Page still renders correctly           ✅
No errors in the console               ✅
Fast on your laptop with 5 comments    ✅
Slow in production with 500 comments   ❌   ← the first time you notice

**A simple checklist to find repeated queries:**

| Question | If **yes** |
|---|---|
| Does a list component render children that each fetch? | Suspect duplicates or N+1 |
| Is the same function called from the page **and** a child? | Wrap it in `cache()` |
| Do queries inside a loop (`.map`) hit the database? | Move to one `include` query |
| Does the terminal show the same SQL several times for one page load? | You have duplicates |

> ⚠️ **Warning:** `cache()` fixes **duplicates** but does **not** fix **N+1**. Different arguments (a different id each time) are different cache entries, so each one still runs. Use `include` or `select` for that.

> ⚠️ **Warning:** Don't turn on `log: ["query"]` in production. It's noisy and can expose query details in your logs. Use it while developing, or only behind an environment check.

> 🏆 **Golden Rule:** **Measure before you optimize.** Turn on query logging, load the page once, and count. If you see the same statement repeated, deduplicate it. If you see one statement per row, use `include`.

---



## 🪞 91. Introducing Duplicate Queries

**What it does:** Walks through a concrete example where duplicate queries happen **naturally**, in the nested comment thread, and then fixes them with `cache()` keyed on `postId` (topic 89).
**Why it is used:** Seeing the problem happen in real code makes the fix obvious. It also shows that the duplication isn't caused by a mistake. It comes directly from a reasonable pattern: each comment component fetching what it needs.
**When to use it:** As the demonstration step before applying `cache()` to any shared query.

**Analogy:** A group of friends each looks up the same restaurant's opening hours on their own phone. Nobody did anything wrong, but one person could have looked it up and told everyone.


``
One query, however many components ask.

```
Before:  CommentList + 4 CommentShow = 5 queries
After:   CommentList + 4 CommentShow = 1 query
```

**Why the cache key is `postId`:**
- `cache()` compares **arguments**. Every component passes the same string, so every call after the first is a hit.
- A **different post** has a different `postId`, so it gets its own query and result. Nothing is shared across posts.

**Common mistakes that silently defeat the fix:**

| Mistake | What goes wrong |
|---|---|
| Calling `db.comment.findMany` directly in one component | That component still queries on its own |
| Creating `cache()` **inside** a component | A new cache is created on every render, so nothing is shared (topic 89) |
| Passing an **object** like `fetchComments({ postId })` | Objects compare by reference, so each call looks different |
| Slightly different queries in each component (a different `include`) | They are different queries, so they don't share a result |

**The last row is the most common.** Define **one** query with **one** `include` that covers everything the thread needs, and have every component use it.

**Quick verification checklist:**
- [ ] Turn on `log: ["query"]` (topic 90)
- [ ] Load a post with several nested replies
- [ ] Count the `SELECT ... FROM "Comment"` lines in the terminal
- [ ] You should see **exactly one**
- [ ] Add a new reply, reload, and confirm the count is still one

> ⚠️ **Warning:** `cache()` only deduplicates **within a single request**. The next page load runs the query once again, and that is expected. To avoid repeating it across visits, use Next.js caching (topics 36 and 39).

> ⚠️ **Warning:** Don't reach for `cache()` before you've seen the duplicates. Turn on query logging, confirm the repeated lines, **then** apply the fix. Otherwise you're guessing (topic 82).

> ⚠️ **Version note:** `cache` from `react` is a Server Component feature. The Prisma client setup and logging options may differ in newer Prisma versions (including 7), so verify against the [Prisma docs](https://www.prisma.io/docs) if your logs or imports don't match.

> 🏆 **Golden Rule:** When a **list of components** each needs the **same data**, fetch it through **one cached function keyed on a simple id** (like `postId`). The components stay independent and reusable, and the database is asked only once.


## 🧠 92. Request Memoization

**What it does:** While Next.js renders **one page request** on the server, identical `fetch()` calls are **automatically merged into one**. The first call goes to the network, and every later call with the same URL and options gets the same result back.
**Why it is used:** In the App Router, many components fetch their own data (topics 78 to 80). Without memoization, a layout, a page, and three children could all request the same URL and hit the server five times.
**When to use it:** You don't turn it on, it's automatic. You just need to know it exists so you can fetch **where the data is used** without worrying about duplicates.

**Analogy:** A waiter takes the same drink order from three people at one table. Instead of making three trips to the bar, they make **one trip** and hand out the same drink. When the table is cleared (the request ends), the waiter forgets the order.

**Example: three components, one network request:**
```tsx
async function getUser() {
  const res = await fetch("https://api.example.com/user/1");
  return res.json();
}

// layout.tsx           → await getUser()
// page.tsx             → await getUser()
// components/Header    → await getUser()
```
**Output:**
```
Calls in the code:        3
Real network requests:    1   ← the other two reuse the first result
```

**The rules:**

| Question | Answer |
|---|---|
| What is memoized? | `fetch()` calls using the **GET** method |
| What counts as "identical"? | Same URL **and** same options |
| How long does it last? | One server render pass (one request), then it's discarded |
| Shared between different users or requests? | ❌ No, every request starts fresh |
| Works in Client Components? | ❌ No, it's a server-side React feature |

**Request Memoization is not the Data Cache (topic 34):**

| | Request Memoization | Data Cache |
|---|---|---|
| **Lasts** | One request | Across requests (and deploys) |
| **Purpose** | Avoid duplicate calls **within** one render | Avoid refetching on **later** requests |
| **Controlled by** | React (automatic) | `cache`, `revalidate`, `revalidatePath` |
| **Cleared by** | The request ending | Revalidation |

**The big limitation: it only covers `fetch()`.** Prisma, SQL, and other database calls are **not** `fetch()`, so they are **not** memoized:
```tsx
// ❌ NOT deduplicated: this is Prisma, not fetch()
const post = await db.post.findUnique({ where: { id: postId } }); // in the page
const post = await db.post.findUnique({ where: { id: postId } }); // in a child
```
**Output:**
```
Calls in the code:        2
Real database queries:    2   ← both run
```
This is exactly the problem topics 90 and 91 showed, and topic 93 solves it.

**What can opt a `fetch()` out of memoization:**

| Cause | Why |
|---|---|
| Different URL or different options | They're no longer "identical" |
| Using `POST` (or any non-GET method) | Only GET is memoized |
| Passing an `AbortController` `signal` | Aborting makes sharing unsafe |

> ⚠️ **Warning:** Don't confuse memoization with persistent caching. It only prevents duplicates **inside one render**. The next visitor's request fetches again, unless the Data Cache (topics 34 and 36) applies.

> ⚠️ **Warning:** If two components need the same data but the **options differ even slightly** (different headers, a different query string), they are not identical and you pay for two requests.

> ⚠️ **Version note:** Caching defaults changed across Next.js 14, 15, and 16, but request memoization of identical GET `fetch()` calls in a single render has remained a React-level behavior. Confirm against the [official caching docs](https://nextjs.org/docs/app/guides/caching) for your version.

> 🏆 **Golden Rule:** For `fetch()`, relax and fetch where you need the data. Next.js merges the duplicates for you. For anything **not** `fetch()` (Prisma, SQL, SDKs), you must deduplicate yourself (topic 93).

---

## 🔁 93. Deduplicating Requests with `cache`

**What it does:** React's `cache()` function wraps **any** async function (a Prisma query, an SDK call, a calculation) and remembers its result for the duration of one request. Calling it again with the **same arguments** returns the saved result instead of running the function again.
**Why it is used:** Request memoization (topic 92) only covers `fetch()`. Prisma queries need a manual version of the same idea, so a page and its children can ask for the same record without hitting the database repeatedly.
**When to use it:** Whenever **two or more components** in the same render need the same database result, such as the page needing a post for its heading while the comment form and the comment list each need that same post, all looked up by the same `postId`.

**Analogy:** A librarian keeps a sticky note on the desk: "Book 42, shelf C." The first time someone asks, the librarian walks to the shelf. The next person asking for book 42 gets the note instead. When the library closes (the request ends), the notes are thrown away.

**Step 1: Wrap the query once, at module level:**
```tsx
// db/queries/topics.ts
import { cache } from "react";
import { db } from "@/db";

export const fetchTopicBySlug = cache(async (slug: string) => {
  console.log("DB QUERY: topic", slug);
  return db.topic.findUnique({ where: { slug } });
});
```

**Step 2: Call it from as many components as you like:**
```tsx
// app/topics/[slug]/page.tsx
const topic = await fetchTopicBySlug(slug);
if (!topic) notFound();

// components/topics/TopicSidebar.tsx
const topic = await fetchTopicBySlug(slug);   // reuses the first result
```
**Output (server terminal):**
```
DB QUERY: topic javascript      ← printed ONCE, even though two components asked
```

**Before and after, keyed on `postId`:**
```tsx
// db/queries/posts.ts
export const fetchPostById = cache(async (postId: string) => {
  return db.post.findUnique({
    where: { id: postId },
    include: { user: { select: { name: true } } },
  });
});
```
```tsx
// Three components on the same page, each calling it with the same postId
const post = await fetchPostById(postId);   // PostShow
const post = await fetchPostById(postId);   // CommentCreateForm wrapper
const post = await fetchPostById(postId);   // CommentList
```
**Output:**
```
Without cache():   3 components = 3 database queries
With cache():      3 components = 1 database query
```
`postId` is a **string**, a primitive, so `cache()` recognizes repeat calls by value and reuses the first result.

**How `cache()` decides two calls are "the same":**

| Arguments | Same call? |
|---|---|
| `"javascript"` and `"javascript"` | ✅ Yes (primitives compare by **value**) |
| `42` and `42` | ✅ Yes |
| `"javascript"` and `"cooking"` | ❌ No, separate results |
| `{ id: "a" }` and `{ id: "a" }` (two separate objects) | ❌ **No**, objects compare by **reference** |

**Practical example: the object gotcha:**
```tsx
// ❌ Each call creates a NEW object, so cache never hits
const getPost = cache(async (opts: { postId: string }) => { ... });
getPost({ postId: "42" });
getPost({ postId: "42" });   // runs again

// ✅ Use a primitive argument
const getPost = cache(async (postId: string) => { ... });
getPost("42");
getPost("42");               // reused
```

**Comparing the three tools you now know:**

| | Request Memoization (topic 92) | `cache()` (this topic) | Data Cache (topic 34) |
|---|---|---|---|
| **Works on** | `fetch()` only | **Any** async function | `fetch()` (and Next.js caching APIs) |
| **Setup needed** | None, automatic | Wrap the function | Options like `revalidate` |
| **Lasts** | One request | One request | Across requests |
| **Use it for** | Duplicate API calls | Duplicate **Prisma/SQL** calls | Data that can be reused between visitors |

**Do you still need it for Prisma if you fetch only once?** No. If only one component ever calls the query, `cache()` changes nothing. Add it **when a second caller appears**, and confirm with query logging first (topic 90).

**Where to define cached functions:**
```tsx
// ✅ Module level (top of the file), created once
export const fetchPostById = cache(async (postId: string) => { ... });

// ❌ Inside a component, a brand new cache is created on every render, so nothing is shared
export default async function Page() {
  const fetchPost = cache(async (postId: string) => { ... });
}
```

> ⚠️ **Warning:** `cache()` works **only in Server Components** and **only for the current request**. It never shares results between users, which also makes it safe for per-user data.

> ⚠️ **Warning:** It does **not** survive revalidation or the next request. It is not a replacement for Next.js caching (topics 36 and 39) or for `revalidatePath` after mutations (topic 53).

> ⚠️ **Warning:** Use **primitive arguments** (strings, numbers) so the cache can recognize repeats. Passing a fresh object every time silently defeats it.

> ⚠️ **Warning:** A cached function should be **read-only**. Don't wrap creates, updates, or deletes in `cache()`. Those are Server Actions (topics 73 to 76) and must run every time.

> ⚠️ **Version note:** `cache` from `react` handles **per-request** deduplication. For **cross-request** caching of database results, Next.js offers separate APIs (`unstable_cache` in older versions, and newer caching directives in recent versions), and these have changed between releases. Check the [Next.js docs](https://nextjs.org/docs/app/guides/caching) for your version before relying on them. The `Prisma` client import path may also differ in newer Prisma versions (topic 76).

> 🏆 **Golden Rule:** `fetch()` is deduplicated **for you**. Anything else (especially Prisma) needs **`cache()`**. Wrap each shared query **once, at module level, with primitive arguments**, and then call it freely from any component that needs it.