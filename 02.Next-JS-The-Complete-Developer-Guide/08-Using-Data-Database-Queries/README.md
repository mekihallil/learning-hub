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