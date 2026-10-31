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