## 😵 33. Super Unexpected Behavior (Caching Gotchas)

**What it does:** Next.js aggressively caches things by default in older versions (App Router, pre-Next 15) — pages, fetch requests, and route segments can all be cached, which sometimes makes it *look* like your code isn't working when really you're just seeing stale, cached output.
**Why it is used:** Caching makes apps fast. But it becomes "unexpected behavior" when you update data (via a Server Action or database change) and the page keeps showing the old version, because Next.js served a cached copy instead of re-running your code.
**When it bites you:** Right after a mutation (create/update/delete) when the UI doesn't reflect the change, even though the database updated correctly.

**Analogy:** It's like a restaurant handing out yesterday's printed menu because printing a new one felt unnecessary — the food changed, but the menu didn't know that.

```tsx
// This fetch might be cached even though the DB changed underneath it
const posts = await fetch("https://api.example.com/posts");
```
**Output (the confusing part):** You delete a post in the database, refresh the page, and the deleted post is *still there* — not because delete failed, but because the page/fetch was cached.

> ⚠️ **Warning:** Before assuming your mutation logic is broken, always ask: "is this actually a caching issue?" It's one of the most common false-alarm bugs in Next.js App Router projects.

---


## 🗃️ 34. The Full Route Cache System

**What it does:** Next.js (App Router) has multiple layers of caching working together — not just one cache. The main ones:
- **Request Memoization** — dedupes identical fetches within a single render pass.
- **Data Cache** — caches the results of `fetch()` calls across requests/deployments.
- **Full Route Cache** — caches the entire rendered HTML/RSC output of a route at build time.
- **Router Cache** (client-side) — caches route segments in the browser as you navigate.

**Why it is used:** Together these layers let Next.js avoid re-rendering and re-fetching things that haven't changed, making navigation and page loads very fast.

**When to care about it:** Whenever a page shows unexpected/stale data — you need to know *which* cache layer is responsible before you can fix it.

| Cache Layer | Where it lives | What it caches |
|---|---|---|
| Request Memoization | Server, per-request | Duplicate `fetch()` calls in one render |
| Data Cache | Server, persistent | `fetch()` results across requests/deploys |
| Full Route Cache | Server, persistent | Entire rendered route (HTML + RSC payload) |
| Router Cache | Browser, per-session | Visited route segments for instant back/forward nav |

> 🏆 **Golden Rule:** When debugging stale data, work top-down: check the Router Cache first (client-side), then the Full Route Cache, then the Data Cache — it's usually one of these three, not your actual application logic.
