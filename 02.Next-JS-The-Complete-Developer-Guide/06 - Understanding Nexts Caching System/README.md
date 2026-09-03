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
