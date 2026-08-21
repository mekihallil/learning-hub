## ⚛️ 12. Create Next.js App

**What it does:** Scaffolds a brand-new Next.js project with all the folders, configs, and dependencies set up for you.
**Why it is used:** Saves you from manually wiring up React, routing, and build tools from scratch.
**When to use it:** The very first step, before writing any app code.

```bash
npx create-next-app@latest snippets
cd snippets
npm run dev

✔ Would you like to use TypeScript? … Yes
✔ Would you like to use Tailwind CSS? … Yes
Success! Created snippets at /Users/you/snippets

▲ Next.js 14.2.0

Local: http://localhost:3000

**Practical example:** Run this once to start any new Next.js project, answer the setup prompts (TypeScript, ESLint, Tailwind), then start building pages inside the `app/` folder.

> 🏆 **Golden Rule:** Always use `npx create-next-app@latest` (not an old cached version) so you get the newest stable setup.

---

## ✏️ 13. Changing Data with Mutation

**What it does:** Sends data changes (create, update, delete) from your app to the database or server — commonly done in Next.js with **Server Actions** or API routes.
**Why it is used:** Reading data (fetching) and changing data (mutating) are different operations — mutations need extra care because they alter real records.
**When to use it:** Any form submission, button click, or user action that should update stored data (e.g., "Save," "Delete," "Like").

**Analogy:** Fetching data is like reading a library book. Mutating data is like writing in it — you need permission and you need to be careful, because it changes the original.

```tsx
// app/snippets/new/page.ts
"use server";

export async function createPost(formData) {
  const title = formData.get("title");
  const code = formData.get("code");
  await db.post.create({ data: { title } });
}
```

**Practical example — using it in a form:**
```jsx
<form action={createPost}>
  <input name="title" placeholder="Post title" />
  <input name="code" placeholder="Post code" />
  <button type="submit">create</button>
</form>
```