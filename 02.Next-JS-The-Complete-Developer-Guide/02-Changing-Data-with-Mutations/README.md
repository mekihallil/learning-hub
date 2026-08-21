## ✏️ 12. Changing Data with Mutation

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