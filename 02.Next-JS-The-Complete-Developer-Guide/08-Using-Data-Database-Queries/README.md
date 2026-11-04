## ⏳ 69. Showing Loading Spinners with `useFormStatus`

**What it does:** `useFormStatus` is a React hook that tells a component whether the **form it lives inside** is currently submitting. It returns a `pending` flag that is `true` while the Server Action is running, so you can show a spinner and disable the button.
**Why it is used:** Server Actions take a moment. Without feedback, users think nothing happened and click again, creating duplicate records. A spinner says "working on it."
**When to use it:** Any submit button. It's especially handy when you want a **reusable** submit button that works in every form without passing props.

**Analogy:** It's the "your order is being prepared" light above a restaurant counter. The light doesn't need to know *which* order is cooking. It just glows whenever the kitchen behind it is busy.

| Value | What it is |
|---|---|
| `pending` | `true` while the parent form's action is running |
| `data` | The `FormData` being submitted (rarely needed) |
| `method` | `"get"` or `"post"` |
| `action` | The function the form is calling |


**`useFormStatus` vs `isPending` from `useActionState`:** both give you a pending flag, but they work differently.

| | `useFormStatus()` | `isPending` from `useActionState` |
|---|---|---|
| **Imported from** | `react-dom` | Returned by the `useActionState` hook (from `react`) |
| **Where it must be used** | In a **child component** rendered inside the `<form>` | In the **same component** that calls `useActionState` |
| **Needs props from the form?** | No, it reads the parent form automatically | You pass `isPending` down yourself |
| **Best for** | A reusable `<FormButton>` shared across forms | A one-off form where everything lives in one component |
| **Also gives you** | `data`, `method`, `action` | The latest `state` and the wrapped `action` |

**Practical example: the same result with `isPending`, no extra component:**


> ⚠️ **Warning:** **`useFormStatus` only works in a component rendered *inside* a `<form>`, not in the same component that renders the `<form>` tag.** If you call it in the component that returns `<form>`, `pending` is always `false`. That's why the button must be its own separate component.

> ⚠️ **Warning:** It needs `"use client"` at the top of the file, because it's a hook.

> ⚠️ **Warning:** It tracks the **nearest parent form** only. If a page has two forms, each button reports on its own form, which is usually what you want.

> ⚠️ **Version note:** `useFormStatus` is imported from `react-dom`, while `useActionState` is imported from `react` (topic 29). Mixing up the two import paths is a common mistake. If you're on HeroUI v3 (topic 41), check its docs for the equivalent loading-state prop on `Button`.

> 🏆 **Golden Rule:** Never leave a submit button silent. Always show a pending state. Use `useFormStatus` in a **small reusable button component** for the cleanest code, or `isPending` when the form is a one-off.


## 📋 70. Fetching and Listing Content from Prisma

**What it does:** Reads records from the database with Prisma (`findMany`) inside a **Server Component** and renders them as a list of links.
**Why it is used:** Showing saved data is the other half of creating it (topic 59). Because Server Components run on the server, you can query the database directly, with no API route, no `useEffect`, and no loading state to manage (topic 18).
**When to use it:** Any page that displays stored data: a list of topics, posts, comments, or products.

**Analogy:** The Server Component is a librarian who walks to the shelves (the database), collects the books, and hands you a finished reading list. You never see the walk, only the result.



**Common Prisma read methods:**

| Method | Returns | Example |
|---|---|---|
| `findMany()` | An **array** of rows | `db.topic.findMany()` |
| `findUnique({ where })` | One row or `null`, searched by a `@unique` / `@id` field | `db.topic.findUnique({ where: { slug } })` |
| `findFirst({ where })` | The first matching row or `null` | `db.topic.findFirst({ where: { slug } })` |
| `count()` | A number | `db.topic.count()` |

| Option | What it does |
|---|---|
| `where` | Filters rows |
| `orderBy` | Sorts the results |
| `take` / `skip` | Limits and pages the results (pagination) |
| `select` | Returns only the listed columns (smaller, faster, safer) |
| `include` | Also loads related records (like a topic's posts) |
`
This only works if your schema defines the relation (a `Post` model with a `topicId`, and a `posts Post[]` field on `Topic`).

**Keeping the list fresh:** the list is cached like any other page (topics 33 to 39). After creating a topic, `createTopic` already calls `revalidatePath(paths.home())`, which is what makes the new topic appear in this list without a manual refresh.

> ⚠️ **Warning:** Always give each item a `key` (here `topic.id`). Without it React logs a warning, and list updates can behave strangely.

> ⚠️ **Warning:** `findMany` with no `take` returns **every row**. That's fine while learning, but on a large table it slows the page and wastes memory. Add `take` and pagination before real data piles up.

> ⚠️ **Warning:** Only fetch what you display. Using `select` keeps private columns (like emails or internal flags) out of your components entirely.

> ⚠️ **Version note:** The `PrismaClient` import path depends on your setup. With the classic `prisma-client-js` generator it comes from `@prisma/client`. Newer Prisma versions (including 7) can generate the client into a custom folder, and may require a driver adapter for SQLite. If `lib/db.ts` shows an import or constructor error, follow the [Prisma docs](https://www.prisma.io/docs) for your exact version.

> 🏆 **Golden Rule:** Fetch data in a **Server Component**, as close as possible to where it's displayed. Don't fetch in a parent and pass it down through many layers. Each component can ask the database for exactly what it needs.


## 🏗️ 71. Scaffolding the Topic Show Page

**What it does:** Creates the page that appears when a user clicks a topic (like `/topics/javascript`), starting as a simple skeleton that reads the topic's `slug` from the URL.
**Why it is used:** Following the planning steps (topics 48 and 51), you build the page structure first with placeholder content, confirm the route works, and only then add real data. It's much easier to debug a bare page than a half-finished one.
**When to use it:** Right after the topic list links exist (topic 70), so clicking a topic has somewhere to go.

**How the dynamic segment works:**

| Folder name | Matches | `params` value |
|---|---|---|
| `[slug]` | `/topics/javascript` | `{ slug: "javascript" }` |
| `[slug]` | `/topics/cooking` | `{ slug: "cooking" }` |
| `[id]` | `/snippets/5` | `{ id: "5" }` |



> ⚠️ **Warning:** In Next.js 15+, `params` is a **Promise** and must be awaited. In Next.js 14 and earlier it was a plain object (`params.slug` directly). If you copy older tutorial code and get a params error, this is almost always the cause.

> ⚠️ **Warning:** URL values can contain special characters (spaces become `%20`). Slugs here are restricted to lowercase letters and dashes by our Zod schema (topic 62), which keeps URLs clean. If you ever allow other characters, decode them with `decodeURIComponent`.

> 🏆 **Golden Rule:** Scaffold first, then fill in. Get the route rendering a heading and a couple of TODO comments, click through it from the topic list, and only then connect real data.

---


## ✍️ 72. Displaying a Creation Form

**What it does:** Puts a **"New Post" form** on the topic show page, in a popover just like the topic form (topic 60). The form needs to know **which topic** the post belongs to, so the page passes the `slug` down to it.
**Why it is used:** Posts live **inside** a topic. A form that doesn't know its topic can't save the post to the right place.
**When to use it:** Once the show page exists (topic 71) and before wiring the real save logic.

The `slug` appearing in the log proves the topic reached the action.

**The key trick: passing the slug with `.bind()`.** A form's `action` only receives `FormData`, so how does the action learn the slug?

| Approach | How | Trade-off |
|---|---|---|
| **`.bind(null, slug)`** (used above) | `createPost.bind(null, slug)` pre-fills the first argument | Clean. The slug isn't in the HTML. Argument order matters |
| **Hidden input** | `<input type="hidden" name="slug" value={slug} />` | Simple, but the value is visible and editable in the browser |
| **Read from the URL** | Parse `params` inside the action | Not available inside a Server Action, so you must pass it in |

*Where the pieces live:**

| Piece | Component type | Why |
|---|---|---|
| `TopicShowPage` | Server Component | Reads `params`, can query the database |
| `PostCreateForm` | Client Component | Uses `useActionState` and a popover |
| `createPost` | Server Action | Runs on the server, receives the form data |
| `FormButton` | Client Component | Uses `useFormStatus` (topic 69) |

This is the pattern from topic 22: a Server Component renders a Client Component and passes it plain props (`slug`).

> ⚠️ **Warning:** The `slug` the form receives is **user-controlled** data from the URL. In the real `createPost`, **verify the topic exists** in the database before saving. Never assume the slug is valid just because the form displayed.

> ⚠️ **Warning:** Argument order matters. With `.bind(null, slug)`, `slug` must be the **first** parameter of `createPost`, ahead of `prevState` and `formData`. Reordering breaks the types and the values.

> ⚠️ **Warning:** The popover form submits fine, but it **doesn't close itself** after a successful save by default. Redirecting after the save (topic 59) handles that, since the page re-renders.

> 🏆 **Golden Rule:** Display the form and prove the data arrives (check the server log) **before** adding validation and database logic. Each step is far easier to debug when only one thing is new.


## ✅ 73. Applying Validation to Post Creation

**What it does:** Fills in the first part of the `createPost` stub (topic 72) by checking the title and content with a Zod schema **before** anything else happens. Bad input is sent back as field errors, and good input moves on to the next step.
**Why it is used:** Form data is untrusted text (topic 61). Validating first means the database never sees empty, oversized, or malformed values.
**When to use it:** At the very top of every Server Action that accepts input. It's the same pattern as `createTopic` (topic 62), applied to a new form.



| | `createTopic` | `createPost` |
|---|---|---|
| **Fields** | `name`, `description` | `title`, `content` |
| **Extra argument** | None | `slug`, pre-filled with `.bind()` (topic 72) |
| **Schema** | `createTopicSchema` | `createPostSchema` |
| **State type** | `CreateTopicFormState` | `CreatePostFormState` (same shape, different field keys) |

**Reminder of the rule:** every key in the schema, the `FormState` interface, the `name=""` attribute of the input, and the `errors.x` read in the component must **match exactly** (topics 64 and 66).

> ⚠️ **Warning:** Validate with `safeParse`, not `parse`. `parse` throws on bad input, and a thrown error crashes the form instead of returning friendly messages (topic 62).

> ⚠️ **Warning:** Use `result.data` for everything after validation. Don't go back to `formData.get(...)`, or you bypass the checks you just wrote.

> ⚠️ **Version note:** `.flatten().fieldErrors` is the long-standing Zod pattern. Newer Zod versions (v4) deprecate it in favor of `z.flattenError(result.error).fieldErrors`. Check the [Zod docs](https://zod.dev) for the version you installed.

> 🏆 **Golden Rule:** Validation is **step one** in every action: validate, then authenticate, then save. Cheap checks first, so bad requests are rejected before they cost you a session lookup or a database call.

---

## 🔐 74. Checking Authentication Status

**What it does:** Adds the second step to `createPost`: it asks `auth()` who is making the request, and refuses to continue if nobody is signed in. It also gives you the user's `id`, which you'll need to record **who wrote** the post.
**Why it is used:** Hiding the "New Post" button from logged-out users is only cosmetic. Anyone can call a Server Action directly, so the **action itself** must verify the session (topic 47).
**When to use it:** In every Server Action that creates, edits, or deletes something belonging to a user.



| Check | Catches |
|---|---|
| `!session` | Nobody is signed in at all (`auth()` returned `null`) |
| `!session.user` | A session object exists but has no user data |
| `!session.user.id` | The user exists but the `id` wasn't added to the session (see below) |


Without that callback, `session.user.id` is `undefined`, the check fails, and **signed-in users** get "You must be signed in."

> If TypeScript says `Property 'id' does not exist on type 'User'`, extend the Auth.js types in a `next-auth.d.ts` file so `session.user.id` is a known string. See the [Auth.js docs on module augmentation](https://authjs.dev) for your version.

**Check order inside the action:**

| Step | Why it comes here |
|---|---|
| 1. Validate | Cheapest check, rejects obviously bad input immediately |
| 2. Check auth | A session lookup is more expensive, so only do it for valid input |
| 3. Save | Only reached by a valid request from a real user |

**Two places to protect, not one:**

| Where | Purpose | Strength |
|---|---|---|
| **UI** (hide the button for signed-out users) | Better user experience | Cosmetic only, easy to bypass |
| **Server Action** (`auth()` check) | Real security | Can't be bypassed from the browser |

> ⚠️ **Warning:** Never skip the check because "the button is hidden." Server Actions are reachable over the network, so each protected action must verify the session itself.

> ⚠️ **Warning:** Never take the user's id from the form (a hidden input or `formData`). A user could edit it and post as someone else. **Always take the id from `auth()` on the server.**

> ⚠️ **Warning:** Return the error rather than throwing it, so `useActionState` can display it (topic 32). Throwing sends the user to a crash screen.

> 🏆 **Golden Rule:** The full action order is **validate → authenticate → save → revalidate → redirect**. Memorize it. Every protected Server Action in your app follows the same five steps.


## 🎒 75. Passing Additional Args to a Server Action

**What it does:** Sends **extra values** (like the topic `slug` or a record `id`) to a Server Action, on top of the `FormData` the form already provides.
**Why it is used:** A form only knows about its own inputs. But `createPost` also needs to know **which topic** the post belongs to, and that information lives in the URL, not in any input box.
**When to use it:** Any time an action needs context the user didn't type: the current topic, the record being edited, the item being deleted.

**Analogy:** A form is a paper slip. The user fills in the boxes, but the **street name** is already printed on the mailbox you're dropping it into. `.bind()` is like pre-stamping the slip with that street name before handing it over.

**The three ways to do it:**

| Approach | How | Pros | Cons |
|---|---|---|---|
| **`.bind(null, value)`** | `createPost.bind(null, slug)` | Clean, no extra HTML, works with `useActionState` | Argument order matters |
| **Hidden input** | `<input type="hidden" name="slug" value={slug} />` | Simple, easy to read in `formData` | Visible in the page source, easy to edit |
| **Direct call with args** | `onClick={() => deletePost(id)}` in a Client Component | Great for buttons without a form (topic 24) | Not used with `<form action>` |


| Position | Parameter | Comes from |
|---|---|---|
| 1st | `slug` | `.bind(null, slug)` |
| 2nd | `prevState` | `useActionState` (always passes the last state) |
| 3rd | `formData` | The browser, when the form is submitted |

`.bind(null, slug)` always **pre-fills from the left**, so your own arguments come **first**, then the ones React adds.


> ⚠️ **Warning:** **Bound values and hidden inputs both travel through the browser, so a user can change them.** Treat them as **untrusted input**, exactly like form fields. Inside the action, verify the topic really exists and that the user is allowed to post there.

> ⚠️ **Warning:** Only pass **serializable** values (strings, numbers, plain objects). You can't bind functions, class instances, or database client objects.

> ⚠️ **Warning:** **Never pass the user's id this way.** Always take it from `auth()` on the server (topic 74). A passed-in user id could be edited to impersonate someone else.

> 🏆 **Golden Rule:** Pass **identifiers** (slug, id) as extra arguments, and **look up the real data** on the server. The client says *which* topic. The server decides *whether that's valid* and loads everything else itself.

---



## 💾 76. Creating the Record

**What it does:** Finishes `createPost` by **saving the post to the database**: it finds the topic from the slug, creates a `Post` linked to that topic and to the signed-in user, then refreshes the cache and redirects.
**Why it is used:** Validation (topic 73) and the auth check (topic 74) only decide whether saving is allowed. This is the step that actually stores the data.
**When to use it:** As the last step of a create action, after validation and authentication have passed.


**What goes into `data`, and where each value comes from:**

| Field | Source | Why this source |
|---|---|---|
| `title` | `result.data` (validated form input) | The user typed it, and Zod checked it |
| `content` | `result.data` (validated form input) | Same |
| `userId` | `session.user.id` from `auth()` | **Server-verified**, can't be faked by the client |
| `topicId` | Looked up from the `slug` in the database | The slug is untrusted, so we convert it to a real id ourselves |

**The five steps, in order:**

| Step | What happens | If it fails |
|---|---|---|
| 1. Validate | Zod checks title and content | Return field errors |
| 2. Authenticate | `auth()` must return a user id | Return a `_form` error |
| 3. Look up the topic | Confirm the slug points to a real topic | Return a `_form` error |
| 4. Create the record | `db.post.create(...)` inside `try/catch` | Return a generic `_form` error, log the real error |
| 5. Revalidate + redirect | Clear stale cache, send the user onward | (not expected to fail) |

**What to revalidate:** the page that **lists** the new post, which is the topic page. If the home page also showed recent posts, you would revalidate it as well (topic 53):


**Quick test checklist:**
- [ ] Submit an empty form → field errors appear under each input
- [ ] Submit while signed out → "You must be signed in" appears
- [ ] Submit with a made-up slug in the URL → "Cannot find topic" appears
- [ ] Submit valid data while signed in → redirected to the new post
- [ ] Open the database (`npx prisma studio`) → the `Post` row exists with the right `userId` and `topicId`

> ⚠️ **Warning:** **`redirect()` must stay outside the `try/catch`.** It works by throwing a special error, and the `catch` would swallow it and show "Something went wrong" after a successful save (topic 68).

> ⚠️ **Warning:** `revalidatePath` must come **before** `redirect()`. `redirect` ends the function immediately, so anything after it never runs.

> ⚠️ **Warning:** The redirect target (`/topics/[slug]/posts/[postId]`) doesn't exist until you build that route (topic 51 pattern). Until then, redirect to `paths.topicShow(slug)` so the user lands somewhere real.

> ⚠️ **Version note:** The `Post` type import path depends on your Prisma generator setup. With the classic `prisma-client-js` generator it comes from `@prisma/client`. Newer Prisma versions (including 7) can generate the client into a custom folder, so import from **that generated path** if the import isn't found.

> 🏆 **Golden Rule:** In a create action, **never trust the client for ownership or relationships.** Take the user from `auth()`, convert the slug into a real topic from your own database, and write only validated values. The client supplies *what* to say, the server decides *who* said it and *where* it goes.


## 🧭 77. Considerations Around Where to Fetch Data

**What it does:** Helps you decide **which component should query the database**: the page (which passes data down as props) or the individual component that displays it.
**Why it is useful:** Server Components let you fetch data anywhere, so there's no single "right" place. The choice affects how **reusable** your components are, how many **database queries** run, and how easy the code is to **change later**.
**When to think about it:** Every time a page shows data in several components, such as a post list, a post detail, and a comment section.

**Analogy:** Two ways to cater a party. **Option A:** one person shops for everything, then hands each cook their ingredients (fetch in the page, pass down). **Option B:** each cook goes to the market for their own ingredients (each component fetches its own). A is efficient, but the cooks depend on the shopper. B is independent, but you may get several trips to the same store.

**The two approaches:**

**Option A: fetch in the page, pass data down as props**
```tsx
// app/topics/[slug]/page.tsx
export default async function TopicShowPage({ params }: Props) {
  const { slug } = await params;

  const posts = await db.post.findMany({
    where: { topic: { slug } },
    include: { user: true, _count: { select: { comments: true } } },
  });

  return <PostList posts={posts} />;
}
```
```tsx
// components/posts/PostList.tsx  (receives data, doesn't fetch)
export default function PostList({ posts }: { posts: PostWithData[] }) {
  return posts.map((post) => <div key={post.id}>{post.title}</div>);
}
```

**Option B: each component fetches what it needs**
```tsx
// app/topics/[slug]/page.tsx
export default async function TopicShowPage({ params }: Props) {
  const { slug } = await params;
  return <PostList slug={slug} />;
}
```
```tsx
// components/posts/PostList.tsx  (fetches its own data)
export default async function PostList({ slug }: { slug: string }) {
  const posts = await db.post.findMany({ where: { topic: { slug } } });
  return posts.map((post) => <div key={post.id}>{post.title}</div>);
}
```

**Comparing them:**

| | A: Fetch in the page | B: Fetch in the component |
|---|---|---|
| **Reusability** | Component works with **any** source that returns the right shape | Component is **tied** to its own query |
| **Self-contained?** | No, the parent must know what data to supply | ✅ Yes, drop it anywhere with just an id or slug |
| **Duplicate queries?** | Rare, one fetch is shared | Possible if two components ask for the same thing |
| **Prop drilling** | Can pass data through many layers | None |
| **Typing** | You must define the data's shape (see below) | Type is inferred from the query |
| **Streaming** | Whole page waits for the slowest query | Each component can load on its own (see `Suspense` below) |
| **Best for** | Shared data, or reusable "dumb" display components | Independent sections of a page |

**Concern 1: duplicate queries.** If two components each query the same record, the database is hit twice. Next.js automatically dedupes identical `fetch()` calls within one render (**request memoization**, topic 34), but **Prisma queries are not `fetch()`**, so they aren't deduped for you. Wrap the query in React's `cache` to share the result:
```tsx
// lib/queries/topics.ts
import { cache } from "react";
import { db } from "@/lib/db";

export const getTopicBySlug = cache(async (slug: string) => {
  return db.topic.findUnique({ where: { slug } });
});
```
```tsx
// Both of these now share ONE database query during the same request
const topic = await getTopicBySlug(slug);   // in the page
const topic = await getTopicBySlug(slug);   // in a child component
```
**Output:**
```
Without cache():  2 components → 2 queries
With cache():     2 components → 1 query (second call reuses the first result)
```

**Concern 2: typing data you pass down.** With Option A, the child needs a type for what the parent fetched, especially when the query uses `include` or `select`. Derive it from the query itself so it never drifts out of date:
```tsx
// lib/queries/posts.ts
import type { Post } from "@prisma/client";

export type PostWithData = Post & {
  topic: { slug: string };
  user: { name: string | null };
  _count: { comments: number };
};

export function fetchPostsByTopicSlug(slug: string): Promise<PostWithData[]> {
  return db.post.findMany({
    where: { topic: { slug } },
    include: {
      topic: { select: { slug: true } },
      user: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
}
```
```tsx
// The page passes the function in, so the list component stays reusable
<PostList fetchData={() => fetchPostsByTopicSlug(slug)} />
```
```tsx
// components/posts/PostList.tsx
export default async function PostList({
  fetchData,
}: {
  fetchData: () => Promise<PostWithData[]>;
}) {
  const posts = await fetchData();
  // render posts...
}
```
This keeps `PostList` **reusable**: the topic page, a search page, and a user profile page can each pass their own query function, as long as it returns `PostWithData[]`.

**Concern 3: sequential vs. parallel fetching.** Two `await`s in a row run **one after the other**, which adds up:
```tsx
// ❌ Sequential: total time = query 1 + query 2
const topic = await getTopic(slug);
const posts = await getPosts(slug);

// ✅ Parallel: total time = the slower of the two
const [topic, posts] = await Promise.all([getTopic(slug), getPosts(slug)]);
```

**Concern 4: slow sections shouldn't block the page.** With Option B, wrap a slow component in `Suspense`. The rest of the page appears immediately and the slow part streams in:
```tsx
import { Suspense } from "react";

<h1>{topic.slug}</h1>
<Suspense fallback={<p>Loading posts...</p>}>
  <PostList slug={slug} />
</Suspense>
```
This is the component-level version of the automatic `loading.tsx` spinner (topic 20).

**A simple decision guide:**

| Situation | Choose |
|---|---|
| Several components need the **same** data | Fetch once in the page and pass down, or share a `cache()`d function |
| A component should be **reusable** across pages | Option A with a passed-in fetch function (or pass data in directly) |
| A section is **independent** and possibly slow | Option B + `Suspense` |
| A page only needs data in **one place** | Fetch right there, keep it simple |
| You're passing the same prop through **3+ layers** | Fetch closer to where it's used |

> ⚠️ **Warning:** Avoid fetching in a parent and passing a **huge** object through many layers "just in case." Each layer becomes coupled to the data's shape, and changing the query breaks them all.

> ⚠️ **Warning:** Don't fetch data in **Client Components** with `useEffect` when a Server Component can do it (topic 18). Client-side fetching adds loading flashes and exposes your API shape.

> ⚠️ **Warning:** `cache()` from React only dedupes **within a single request**. It is not a long-term cache. For data that persists across requests, use the Next.js caching tools (topics 36 and 39).

> 🏆 **Golden Rule:** There's no universally correct answer, so optimize for **clarity first**. Start by fetching where the data is used. Move the fetch **up** only when sharing is needed, and wrap it in **`cache()`** when two components ask for the same thing.