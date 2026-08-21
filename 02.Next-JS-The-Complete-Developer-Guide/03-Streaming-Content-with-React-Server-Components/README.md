## 🛠️ 15. Introducing Server Actions

**What it does:** Lets you write functions that run **only on the server**, but call them directly from your components/forms — no separate API route needed.
**Why it is used:** Normally, if a client wants to change data, you'd build an API endpoint (`/snippets/new`) and fetch it. Server Actions skip that boilerplate — you write one function, mark it `"use server"`, and call it like a normal function.
**When to use it:** Any form submission or data mutation (create, update, delete) where you don't need a public reusable API.

**Analogy:** It's like having a direct phone line to the kitchen instead of writing your order on paper, walking it to a waiter, who walks it to the kitchen. Same result, way fewer steps.
