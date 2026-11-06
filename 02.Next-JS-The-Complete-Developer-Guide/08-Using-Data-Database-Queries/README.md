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


## 👶 78. Data Fetching in Child Components

**What it does:** Lets a **child component fetch its own data** from the database, instead of the page fetching everything and passing it down. The page only hands the child a small identifier (like a `slug` or an `id`), and the child does the rest.
**Why it is used:** Each component becomes **self-contained**. You can drop `<PostList slug="javascript" />` onto any page and it just works, with no need to know what query feeds it. The page stays short, and each piece can load independently.
**When to use it:** Sections of a page that are independent of each other: a post list, a comment section, a "top topics" sidebar.

**Analogy:** A newspaper editor doesn't write every column. They assign sections: sports, weather, business. Each writer goes and gathers their own facts, and the editor just says "sports goes here." The child component is the section writer.

**Step 1: The page stays thin and only passes an identifier:**
```tsx
// app/topics/[slug]/page.tsx
import PostList from "@/components/posts/PostList";
import PostCreateForm from "@/components/posts/PostCreateForm";

export default async function TopicShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-3">
        <h1 className="text-2xl font-bold mb-2">{slug}</h1>
        <PostList slug={slug} />
      </div>
      <div>
        <PostCreateForm slug={slug} />
      </div>
    </div>
  );
}
```

**Step 2: The child is an `async` Server Component that fetches for itself:**
```tsx
// components/posts/PostList.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import paths from "@/paths";

export default async function PostList({ slug }: { slug: string }) {
  const posts = await db.post.findMany({
    where: { topic: { slug } },
    include: {
      user: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (posts.length === 0) {
    return <p>No posts yet. Be the first to write one!</p>;
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <Link key={post.id} href={paths.postShow(slug, post.id)}>
          <div className="border rounded p-2">
            <h3 className="text-lg font-bold">{post.title}</h3>
            <div className="flex gap-8">
              <p className="text-xs text-gray-400">By {post.user.name}</p>
              <p className="text-xs text-gray-400">{post._count.comments} comments</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```
**Output:**
```
Visit /topics/javascript:

  javascript
  ┌──────────────────────────────────────┐
  │ Hello World                          │
  │ By Manuel        2 comments          │
  └──────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │ Learning Server Components           │
  │ By Manuel        0 comments          │
  └──────────────────────────────────────┘
```

**Another example: the post page with two independent children:**
```tsx
// app/topics/[slug]/posts/[postId]/page.tsx
import PostShow from "@/components/posts/PostShow";
import CommentList from "@/components/comments/CommentList";

export default async function PostShowPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { postId } = await params;

  return (
    <div>
      <PostShow postId={postId} />      {/* fetches the post itself */}
      <CommentList postId={postId} />   {/* fetches the comments itself */}
    </div>
  );
}
```
Each child only needs an `id`. The page doesn't know or care what queries they run.

**What to pass down as props:**

| Pass this | Not this |
|---|---|
| `slug`, `postId` (small identifiers) | A big pre-fetched object "just in case" |
| Simple values the child can't get itself | The database client |
| Plain serializable data | Functions or class instances (when the child is a Client Component) |

**Why this works only in Server Components:** `async` components are a **Server Component** feature. A Client Component (`"use client"`) cannot be `async`. If a child needs both data **and** interactivity, split it:
```tsx
// Server Component: fetches
export default async function LikeSection({ postId }: { postId: string }) {
  const likes = await db.like.count({ where: { postId } });
  return <LikeButton postId={postId} initialLikes={likes} />;
}
```
```tsx
// Client Component: interactive, receives plain data as props
"use client";
export default function LikeButton({ postId, initialLikes }: Props) { ... }
```
This is the server-inside-client pattern from topic 22, in reverse: the Server Component fetches, the Client Component handles clicks.

**Child fetching vs. page fetching (summary of topic 77):**

| | Child fetches | Page fetches and passes down |
|---|---|---|
| **Props needed** | A small id | The full data |
| **Reusable on other pages?** | ✅ Easily | Only if the parent supplies the same shape |
| **Loads independently?** | ✅ With `Suspense` | ❌ Page waits for everything |
| **Duplicate queries?** | Possible (use `cache()`) | Rare |

**Show a loading state for a slow child with `Suspense`:**
```tsx
import { Suspense } from "react";

<h1>{slug}</h1>
<Suspense fallback={<p>Loading posts...</p>}>
  <PostList slug={slug} />
</Suspense>
```
**Output:**
```
Instantly:   javascript
             Loading posts...
A moment later: javascript
                [ the real post list streams in ]
```
The heading appears right away, and only the slow section waits.

**The big gotcha: waterfalls (sequential fetching).** If a parent awaits something **before** rendering the child, the child's query doesn't start until the parent finishes:
```tsx
// ❌ Waterfall: child can't start until the parent's query is done
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const topic = await db.topic.findUnique({ where: { slug } }); // wait...
  return <PostList slug={slug} />;                              // ...then this starts its own query
}
```
```
Time →  [ parent query ][ child query ] = slow
```
Fixes:
```tsx
// ✅ Fix 1: wrap the child in Suspense so it streams without blocking the parent
// ✅ Fix 2: if the parent doesn't actually need the data, don't fetch it there
// ✅ Fix 3: start both queries together with Promise.all (when both are needed in the parent)
const [topic, posts] = await Promise.all([getTopic(slug), getPosts(slug)]);
```
```
Time →  [ parent query ]
        [ child query  ]   ← runs at the same time = faster
```

**Share a query between parent and child with `cache()`:** if the page *and* a child both need the same topic, wrap the query once so it only hits the database one time per request (topic 77):
```tsx
// lib/queries/topics.ts
import { cache } from "react";

export const getTopicBySlug = cache(async (slug: string) => {
  return db.topic.findUnique({ where: { slug } });
});
```

> ⚠️ **Warning:** Only **Server Components** can be `async` and query the database. Putting `"use client"` on a component that does `await db...` causes an error, and would also risk shipping database code to the browser.

> ⚠️ **Warning:** Fetching in **many small children** can create **N+1 queries**: a list renders 50 items, and each item fetches its own author, making 51 queries. For lists, fetch the related data **once** with `include` (as `PostList` does with `user`) instead of per item.

> ⚠️ **Warning:** Child fetching still obeys caching rules (topics 33 to 39). After a mutation, `revalidatePath` must cover the **page** the child lives on, or the child will show stale data.

> ⚠️ **Warning:** Always handle the **empty case** (`posts.length === 0`) inside the child. A component that fetches for itself is responsible for what it shows when there's nothing to show.

> 🏆 **Golden Rule:** Pass **identifiers down, not data**. Let each Server Component ask the database for exactly what it displays, use `include`/`select` to avoid per-item queries, wrap slow children in `Suspense`, and use `cache()` when two components need the same record.


## ⭐ 79. Recommended Data Fetching

**What it does:** Pulls topics 77 and 78 together into **one recommended pattern**: write your database queries as small functions in a dedicated folder, derive their types automatically, and let the **page** choose which query a reusable component should run.
**Why it is used:** Fetching inside components works, but it scatters queries across the app. This pattern keeps queries in **one place**, keeps components **reusable**, and keeps types **correct** without writing them by hand.
**When to use it:** Any time the same kind of list or record appears on more than one page (posts on a topic page, on a search page, on a profile page).



**How the derived type works, piece by piece:**

| Piece | Meaning |
|---|---|
| `typeof fetchPostsByTopicSlug` | The function itself, as a type |
| `ReturnType<...>` | What that function returns: `Promise<Post[]>` (with the included fields) |
| `Awaited<...>` | Unwraps the `Promise`, leaving the plain array |
| `[number]` | Takes **one element** of that array, giving a single post's type |



| Passing data (`posts={posts}`) | Passing a function (`fetchData={...}`) |
|---|---|
| The page must `await` first, so it **blocks** | The page returns immediately, the child fetches |
| Can't use `Suspense` to stream the list | ✅ Wrap the list in `Suspense` and it streams in |
| Simple | Slightly more indirection, but more flexible |



| Recommendation | Why |
|---|---|
| Put queries in `db/queries/*.ts` | One place to find, change, and review every query |
| Derive types with `Awaited<ReturnType<...>>[number]` | Types always match the real query, with zero manual typing |
| Make display components **reusable**: take a `fetchData` function | One component serves many pages |
| Let the **page** choose the query | Pages know the context (which topic, which search term) |
| Use `include` / `select` in the query | Avoids one query per list item (the N+1 problem, topic 78) |
| Wrap slow components in `Suspense` | Fast parts of the page appear immediately |
| Use `Promise.all` for independent queries in the same place | Queries run in parallel, not one after another |
| Use `cache()` for queries shared by several components | One database hit per request |
| Revalidate after mutations (topic 53) | Fetched data stays fresh after creates, edits, and deletes |

> ⚠️ **Warning:** **Only pass `fetchData` from a Server Component to another Server Component.** A function can't be sent to a **Client Component** (`"use client"`), because functions aren't serializable. If a Client Component needs data, fetch it in a Server Component and pass the **plain result** as props.

> ⚠️ **Warning:** Don't put the `"use server"` directive in query files. That directive turns exported functions into publicly callable **Server Actions**. Queries are internal helpers and should stay private to the server.

> ⚠️ **Warning:** Keep queries **read-only** in `db/queries/`. Creates, updates, and deletes belong in **Server Actions** (`actions/`), which validate input and check authentication (topics 73 to 76).

> ⚠️ **Warning:** Each query function runs **every time it is called**. `cache()` only dedupes inside one request. It does not replace Next.js caching or `revalidatePath` (topics 36 and 53).

> 🏆 **Golden Rule:** **Queries live in one folder, types are derived from them, components stay generic, and pages choose what to show.** If you change the data a list needs, you edit one query file and the types follow automatically.


## 🧑‍🍳 80. Define in Parent, Fetch in Child

**What it does:** The **parent** (the page) decides *which* query to run and wraps it in a small function. The **child** (a reusable component) receives that function and is the one that actually calls it and awaits the result.
**Why it is used:** The page knows the context (which topic, which search term), and the child knows how to display the data. Splitting "what to fetch" from "when to fetch" gives you reusable components, and it lets the page return immediately so `Suspense` can stream the child in.
**When to use it:** Any reusable list or detail component that appears on several pages with different data sources.

**Analogy:** A manager hands a cook a **ticket** that says "make the soup of the day." The manager decided *what* to make, but the cook does the actual cooking, and the manager is free to greet the next customer instead of standing at the stove.

**The three ways to split the work:**

| Pattern | Who defines the query | Who runs it | Result |
|---|---|---|---|
| **Define and fetch in parent** | Page | Page | Page blocks until the data is ready, child just displays |
| **Define and fetch in child** | Child | Child | Child is self-contained but tied to one query |
| **Define in parent, fetch in child** ⭐ | Page | Child | Reusable child, and the page doesn't block |

**Step 1: The child accepts a function, not data:**
```tsx
// components/posts/PostList.tsx
import type { PostWithData } from "@/db/queries/posts";

interface PostListProps {
  fetchData: () => Promise<PostWithData[]>;
}

export default async function PostList({ fetchData }: PostListProps) {
  const posts = await fetchData();   // ← the child runs the query

  return (
    <div>
      {posts.map((post) => (
        <h3 key={post.id}>{post.title}</h3>
      ))}
    </div>
  );
}
```

**Step 2: Each page defines the query it wants:**
```tsx
// app/topics/[slug]/page.tsx
import { Suspense } from "react";
import PostList from "@/components/posts/PostList";
import { fetchPostsByTopicSlug } from "@/db/queries/posts";

export default async function TopicShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<p>Loading posts...</p>}>
      <PostList fetchData={() => fetchPostsByTopicSlug(slug)} />
    </Suspense>
  );
}
```
```tsx
// app/page.tsx (no arguments needed, so pass the function itself)
<PostList fetchData={fetchTopPosts} />
```
**Output:**
```
/topics/javascript
  → page returns instantly, "Loading posts..." shows
  → PostList calls fetchPostsByTopicSlug("javascript") and streams the posts in

/
  → PostList calls fetchTopPosts() and shows the top 5 posts
```

**The closure trick: `() => fetchPostsByTopicSlug(slug)`**
The arrow function **remembers `slug`** from the page. The child just calls `fetchData()` with no arguments and never needs to know a slug exists.

| What you write | What it means |
|---|---|
| `fetchData={fetchTopPosts}` | Pass the function **itself** (no parentheses). The child calls it later |
| `fetchData={() => fetchPostsByTopicSlug(slug)}` | Wrap it in an arrow so it has the `slug` baked in |
| `fetchData={fetchPostsByTopicSlug(slug)}` ❌ | **Calls it immediately** and passes a Promise, which doesn't match the `() => Promise` type |

**Why not just fetch in the parent and pass the result?**
```tsx
// ❌ The page awaits first, so nothing renders until the query finishes
const posts = await fetchPostsByTopicSlug(slug);
return <PostList posts={posts} />;
```
```
Time →  [ page waits for query ][ page renders ]   = user stares at a blank page
```
```tsx
// ✅ The page returns right away, the child waits inside Suspense
return (
  <Suspense fallback={<p>Loading...</p>}>
    <PostList fetchData={() => fetchPostsByTopicSlug(slug)} />
  </Suspense>
);
```
```
Time →  [ page renders instantly ]
                 [ child query runs, streams in ]
```

**When this pattern is NOT the right choice:**

| Situation | Better choice |
|---|---|
| Only **one** page ever shows this component | Fetch inside the child directly, it's simpler |
| The **parent also needs** the data (for a heading, a `notFound()` check) | Fetch in the parent, use `cache()` so the child doesn't repeat the query (topic 77) |
| The child is a **Client Component** | Fetch in a Server Component and pass the plain result as props |

> ⚠️ **Warning:** **Functions can't be passed to Client Components.** `fetchData` only works when both the page and `PostList` are **Server Components**. If the child has `"use client"`, you'll get a serialization error.

> ⚠️ **Warning:** Passing the function **with parentheses** (`fetchData={fetchTopPosts()}`) runs the query in the parent and hands over a Promise, which breaks the types and defeats the whole point.

> ⚠️ **Warning:** The child owns its own **empty and error states**. The page can't check `posts.length` because it never sees the data.

> 🏆 **Golden Rule:** The parent says **what**, the child does **how and when**. The page passes a function that already knows its arguments, and the child just calls it.

---

## 🏷️ 81. Alternative Type Names and Query Definitions

**What it does:** Shows other good ways to **name** the types your queries produce, **derive** those types, and **organize** the query functions themselves. Topic 79 showed one recommended approach, but several valid alternatives exist, each with different trade-offs.
**Why it is useful:** You'll see all of these styles in tutorials and real codebases. Knowing the options lets you recognize them and pick the one that suits your project's size.
**When to use it:** When topic 79's pattern starts to feel repetitive (the same `include` copied into three queries), or when type names stop being descriptive.

**Analogy:** The same recipe can be written as a numbered list, a paragraph, or a photo guide. The dish doesn't change, only how easy it is to follow and update.

### Part A: Choosing type names

**Name types by their purpose or their shape, and stay consistent.**

| Style | Example | Good for |
|---|---|---|
| By shape | `PostWithData` | Short and generic, fine for small apps |
| By what it includes | `PostWithTopicAndUser` | Very explicit, but long and it changes when the query changes |
| By purpose | `PostListItem`, `PostSummary` | Describes **where it's used**, stays stable as fields change |
| By detail level | `PostDetail` (full) vs `PostPreview` (card) | Apps with both list cards and full pages |

**Output (the same type under different names):**
```
PostWithData   = Post + { topic, user, _count }
PostListItem   = Post + { topic, user, _count }   ← same shape, clearer purpose
```

> **Tip:** `PostListItem` is usually the best default. When you later add a `PostDetail` type with comments included, the names make the difference obvious.

### Part B: Alternative ways to derive the type

**Option 1: infer it from the function (topic 79)**
```tsx
export type PostListItem = Awaited<ReturnType<typeof fetchPostsByTopicSlug>>[number];
```
Zero extra code, but each query has its own separate type.

**Option 2: share one `include` and use Prisma's payload helper**
```tsx
// db/queries/posts.ts
import { Prisma } from "@prisma/client";
import { db } from "@/db";

// One definition of "what a list item contains"
const postListInclude = {
  topic: { select: { slug: true } },
  user: { select: { name: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

// The type comes from that same definition
export type PostListItem = Prisma.PostGetPayload<{
  include: typeof postListInclude;
}>;

// Every query reuses it, so they can never disagree
export function fetchPostsByTopicSlug(slug: string): Promise<PostListItem[]> {
  return db.post.findMany({
    where: { topic: { slug } },
    include: postListInclude,
  });
}

export function fetchTopPosts(): Promise<PostListItem[]> {
  return db.post.findMany({
    orderBy: [{ comments: { _count: "desc" } }],
    include: postListInclude,
    take: 5,
  });
}
```
**Output:**
```
fetchPostsByTopicSlug → PostListItem[]
fetchTopPosts         → PostListItem[]   ← identical shape, defined once
```
This removes the copy-pasted `include` block from topic 79. Change `postListInclude` once and **every query and the type update together**.

**Option 3: write the type by hand**
```tsx
export type PostListItem = Post & {
  topic: { slug: string };
  user: { name: string | null };
  _count: { comments: number };
};
```
Simplest to read, but it can **drift** out of date if you change the query and forget the type.

**Comparing the options:**

| Option | Stays in sync automatically? | Reuses one `include`? | Complexity |
|---|---|---|---|
| 1. `Awaited<ReturnType<...>>[number]` | ✅ Yes | ❌ No | Low |
| 2. `Prisma.PostGetPayload` + shared `include` | ✅ Yes | ✅ Yes | Medium |
| 3. Hand-written type | ❌ No | ❌ No | Lowest |

> ⚠️ **Warning:** Use **`satisfies Prisma.PostInclude`**, not a type annotation (`const postListInclude: Prisma.PostInclude = {...}`). An annotation **widens** the type, so Prisma no longer knows which fields you included and the payload type loses them. `satisfies` checks the object is valid **while keeping its exact shape**.

> ⚠️ **Version note:** Older Prisma tutorials use `Prisma.validator<Prisma.PostInclude>()({...})` for the same job. `satisfies` (TypeScript 4.9+) is the simpler modern equivalent. Also, with newer Prisma versions (including 7) the client may be generated into a custom folder, so import `Prisma` from **that generated path** if `@prisma/client` doesn't export it. Check the [Prisma docs](https://www.prisma.io/docs) for your version.

### Part C: Alternative ways to define the queries

**Style 1: one exported function per query (topic 79)**
```tsx
export function fetchTopPosts() { ... }
export function fetchPostsBySearchTerm(term: string) { ... }
```
Easy to import only what you need.

**Style 2: arrow-function constants**
```tsx
export const fetchTopPosts = () =>
  db.post.findMany({ include: postListInclude, take: 5 });
```
Shorter for one-liners. Functionally the same.

**Style 3: group queries in one object**
```tsx
export const postQueries = {
  byTopicSlug: (slug: string) =>
    db.post.findMany({ where: { topic: { slug } }, include: postListInclude }),
  top: () =>
    db.post.findMany({ orderBy: [{ comments: { _count: "desc" } }], include: postListInclude, take: 5 }),
  search: (term: string) =>
    db.post.findMany({ where: { title: { contains: term } }, include: postListInclude }),
};

// Usage
<PostList fetchData={() => postQueries.byTopicSlug(slug)} />
<PostList fetchData={postQueries.top} />
```
Reads nicely (`postQueries.top`) and groups related queries, but you import the whole object.

**Style 4: one file per entity vs. one file per query**

| Layout | Example | Best for |
|---|---|---|
| One file per **entity** | `queries/posts.ts`, `queries/topics.ts` | Most apps, easy to find things |
| One file per **query** | `queries/posts/fetch-top-posts.ts` | Very large codebases |
| A single `queries.ts` | Everything together | Tiny demos only |

**Naming the functions:**

| Prefix | Reads as | Notes |
|---|---|---|
| `fetch...` | `fetchTopPosts()` | Used throughout these notes |
| `get...` | `getTopPosts()` | Equally common, just pick one |
| `find...` | `findPostById()` | Often matches Prisma's own `findUnique`/`findMany` |

Pick **one prefix** and use it everywhere. Avoid starting names with `use` (like `usePosts`), because React treats `use...` names as hooks.

> ⚠️ **Warning:** Query files must **not** start with `"use server"`. That directive turns every exported function into a publicly callable Server Action. Queries are internal helpers, and mutations belong in `actions/` (topics 73 to 76).

> ⚠️ **Warning:** Whatever style you choose, give list-returning functions an explicit return type (`Promise<PostListItem[]>`). It makes mismatches show up **in the query file**, not later in a component.

> 🏆 **Golden Rule:** Pick **one** naming style, **one** way to derive types, and **one** query layout, then use them everywhere. Consistency matters more than which option you choose. When duplication starts to hurt, move to a **shared `include`** with `satisfies` and `PostGetPayload`.