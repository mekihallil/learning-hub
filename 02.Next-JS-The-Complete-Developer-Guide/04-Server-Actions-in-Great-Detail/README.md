## 🔄 24. Server Actions in Client Components

**What it does:** Shows that Server Actions aren't limited to plain HTML forms in Server Components — you can also call them from inside a Client Component (e.g., triggered by `onClick`, not just `<form action={...}>`).
**Why it is used:** Sometimes you need a button, dropdown, or custom interaction (not a plain form submit) to trigger a server-side mutation — Server Actions still work here, just called a bit differently.
**When to use it:** Any interactive UI element inside a Client Component that needs to trigger a database change — delete buttons, toggle switches, "like" buttons, etc.

**Analogy:** A `<form action={...}>` is like dropping a request into a mailbox — simple, one-way. Calling a Server Action from a Client Component's `onClick` is like picking up the phone yourself and calling the kitchen directly, whenever you decide to.



## 📂 25. Server Actions in a Separate File

**What it does:** Keeps all your Server Actions organized in one dedicated file (e.g., `app/actions.ts`) instead of scattering them across page and component files.
**Why it is used:** Easier to find, reuse, and test. It also keeps your components focused on UI, while actions.ts focuses purely on server logic.
**When to use it:** Basically always, once you have more than one Server Action — treat it the same way you'd treat a `utils.ts` or `api.ts` file.
