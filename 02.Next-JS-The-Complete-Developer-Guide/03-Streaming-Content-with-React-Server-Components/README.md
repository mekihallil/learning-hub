## 🛠️ 15. Introducing Server Actions

**What it does:** Lets you write functions that run **only on the server**, but call them directly from your components/forms — no separate API route needed.
**Why it is used:** Normally, if a client wants to change data, you'd build an API endpoint (`/snippets/new`) and fetch it. Server Actions skip that boilerplate — you write one function, mark it `"use server"`, and call it like a normal function.
**When to use it:** Any form submission or data mutation (create, update, delete) where you don't need a public reusable API.

**Analogy:** It's like having a direct phone line to the kitchen instead of writing your order on paper, walking it to a waiter, who walks it to the kitchen. Same result, way fewer steps.


## 🔬 16. A Deeper Dive into Server

**What it does:** Explains *where* your code actually executes in Next.js — the server (Node.js environment) vs the browser (client environment).
**Why it is used:** Code that touches databases, secrets, or file systems must run on the server — never send that logic to the browser, or you expose sensitive data.
**When to use it:** Understanding this matters every time you decide "should this run on the server or the client?"

**Analogy:** The server is the restaurant's kitchen — customers never see what happens there, they just get the finished plate. The client (browser) is the dining table — it only sees the result.


## 🧩 17. Server Components and Client Components

**What it does:** Next.js (App Router) has two types of components:
- **Server Components** (default) — render on the server, can directly fetch data, never ship JS to the browser.
- **Client Components** — render in the browser, needed for interactivity (`useState`, `onClick`, `useEffect`).

**Why it is used:** Server Components make your app faster (less JS shipped to the browser) and more secure (data-fetching logic stays hidden). Client Components handle things only the browser can do — clicks, state, animations.

**When to use it:**
- Use **Server Component** (default, no directive needed) for static content, data display, SEO-heavy pages.
- Use **Client Component** (`"use client"` at the top) when you need interactivity.

**Analogy:** Server Components are like a printed menu — fixed content, delivered ready-made. Client Components are like the waiter taking your live order — interactive and responsive in the moment.

```tsx
// app/page.tsx — Server Component (default)
export default async function Page() {
  const posts = await db.post.findMany();
  return <div>{posts.length} posts found</div>;
}
```

```tsx
// components/LikeButton.tsx — Client Component
"use client";
import { useState } from "react";

export default function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>👍 {likes}</button>;
}
```

## 📡 18. Fetching Data with Server Components

**What it does:** Lets you `fetch` or query a database directly inside a Server Component using `async/await` — no `useEffect`, no loading state management needed.
**Why it is used:** Simplifies data fetching massively compared to older React patterns — the data is ready *before* the page even renders.
**When to use it:** Any page or component that needs to display data from a database or API on load.

**Analogy:** Instead of ordering food and waiting anxiously at the table (client-side fetching with loading spinners), the food arrives already cooked and plated the moment you sit down.


## 🚧 19. Custom Not Found Pages

**What it does:** Lets you create a custom "404 - Page Not Found" screen instead of the default blank Next.js error page.
**Why it is used:** A branded, helpful 404 page keeps users on your site (with navigation links) instead of them just leaving.
**When to use it:** Automatically shown when a route doesn't exist, or manually triggered when data isn't found (e.g., a post ID that doesn't exist).
