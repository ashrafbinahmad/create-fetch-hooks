# 🎞 createFetchHooks – Your Custom API Hook Factory

A TypeScript-based utility to generate `React` hooks and HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) with unified error handling, headers support, response tracking, and enhanced developer experience.

---

## ✨ What is this?

This utility gives you both:

✅ React Hooks like `useGet`, `usePost`
✅ Direct HTTP methods like `httpClient.get`, `httpClient.post`

It simplifies working with REST APIs in a type-safe and scalable way.

---

## 💡 Why use this over other libraries?

| Feature                             | create-fetch-hooks | Axios | React Query |
| ----------------------------------- | ------------------ | ----- | ----------- |
| Fully typed with generics           | ✅                 | ⚠️    | ✅          |
| React-friendly hooks                | ✅                 | ❌    | ✅          |
| Custom `onResponseGot` tracking     | ✅                 | ❌    | ❌          |
| Optional debounce for `useGet`      | ✅                 | ❌    | ⚠️ Plugin   |
| Unified header injection            | ✅                 | ⚠️    | ⚠️          |
| Minimalistic, no extra deps         | ✅                 | ❌    | ❌          |
| Convert to `FormData` in `POST/PUT` | ✅                 | ❌    | ⚠️ Manual   |
| Works without any context provider  | ✅                 | ❌    | ❌          |

---

## 📦 Installation

```bash
npm i create-fetch-hooks
```

---

## 🔗 Importing

```ts
import { createFetchHooks } from "create-fetch-hooks";
```

---

## 🚀 Quick Setup

```ts
const { useGet, usePost, usePut, useDelete, httpClient } = createFetchHooks(
  "http://localhost:3000"
);
```

---

## 🧙‍♂️ Hook Return Types

| Hook        | Return                             |
| ----------- | ---------------------------------- |
| `useGet`    | `{ data, error, loading, reload }` |
| `usePost`   | `{ error, loading, postData }`     |
| `usePut`    | `{ error, loading, putData }`      |
| `useDelete` | `{ error, loading, deleteData }`   |

---

## 🌍 Real-World Usage Example

**📁 /hooks/api.ts**

```ts
import { createFetchHooks } from "create-fetch-hooks";

export const { useGet, usePost, usePut, useDelete, httpClient } =
  createFetchHooks("https://api.example.com", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },

    onResponseGot(url, endpoint, responseCode) {
      if (endpoint === "/me" && responseCode === 400) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    },
  });
```

**📁 /pages/UserList.tsx**

```tsx
import { useGet } from "../hooks/api";

const UserList = () => {
  const { data: users, loading, error, reload } = useGet<User[]>("/users");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error occurred</p>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
      <button onClick={reload}>Reload</button>
    </ul>
  );
};

export default UserList;
```

---

## 📜 Docs

All options and return types are strongly typed with TypeScript. You can explore available options like:

- `onSuccess`, `onError`, `onResponseGot`
- `convertToFormData`, `removeIfValueIsNullOrUndefined`
- `debounce`, `dontRequestIfUrlIncludeNullOrUndefined`

Check the source code and full examples on GitHub 🔻

---

## 📌 Links

- 🔗 NPM: [create-fetch-hooks](https://www.npmjs.com/package/create-fetch-hooks)
- 🐙 GitHub: [ashrafbinahmad/create-fetch-hooks](https://github.com/ashrafbinahmad/create-fetch-hooks)

If you find this package helpful, **please ⭐ the repo on GitHub!** It really helps! 🙏

---

## 📜 License

MIT
