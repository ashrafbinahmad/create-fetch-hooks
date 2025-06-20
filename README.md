
<img src="./images/logo.png" alt="Logo" width="100"/> <br/>

# 🎞 Create Fetch Hooks – Custom API Hook Factory

Easily generate `React` hooks and HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) with unified error handling, headers support, response tracking, token refresh, and enhanced developer experience.

---

## ✨ What is this?

This utility provides:

✅ React Hooks: `useGet`, `usePost`, `usePut`, `useDelete`  
✅ Direct HTTP methods: `httpClient.get`, `httpClient.post`, `httpClient.put`, `httpClient.del`  
✅ Cache management with `FetchCacheProvider`  
✅ Automatic token refresh with customizable logic  

It simplifies working with REST APIs in a type-safe, scalable way with built-in support for authentication and caching.

---

## 🚀 Quick Setup

Initialize the hooks and HTTP client with a base URL and optional configuration, including token refresh logic:

```ts
export const {
  useGet,
  useDelete,
  usePost,
  usePut,
  httpClient,
  FetchCacheProvider,
} = createFetchHooks(
  "http://localhost:3000/", // API base url
  //Optional - Required if you want auto refresh tokens:
  {
    accessTokenLocalStorageKey: "accessToken",
    callRefreshToken() {
      return {
        on: [403], // The response code to be tracked to refresh token
        body: { refreshToken: localStorage.getItem("refreshToken") || "" }, // refresh token body
        endpoint: "/refresh", // The refresh token end point
        saveAccessTokenFromResponse: async function (res) {
          localStorage.setItem("accessToken", res?.accessToken); 
        },
      };
    },
  }
);
```

Wrap your app with `FetchCacheProvider` to enable caching:

```tsx
// Optional - Required if you want cache (eg: Need not to wait if already loaded when returning to the page, it will load from cache)
import { FetchCacheProvider } from "create-fetch-hooks";

function App() {
  return (
    <FetchCacheProvider>
      <YourApp />
    </FetchCacheProvider>
  );
}
```

---

## 💡 Why use this over other libraries?

| Feature                             | create-fetch-hooks | Axios | React Query |
|-------------------------------------|--------------------|-------|-------------|
| Fully typed with generics           | ✅                 | ⚠️    | ✅          |
| React-friendly hooks                | ✅                 | ❌    | ✅          |
| Custom `onResponse` tracking        | ✅                 | ❌    | ❌          |
| Optional debounce for `useGet`      | ✅                 | ❌    | ⚠️ Plugin   |
| Unified header injection            | ✅                 | ⚠️    | ⚠️          |
| Minimalistic, no extra deps         | ✅                 | ❌    | ❌          |
| Convert to `FormData` in `POST/PUT` | ✅                 | ❌    | ⚠️ Manual   |
| Works without any context provider - Required if caching needed  | ✅                 | ❌    | ❌          |
| Token refresh support               | ✅                 | ⚠️    | ⚠️ Manual   |
| Cache management with `FetchCacheProvider` | ✅          | ❌    | ✅          |

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


## 🧙‍♂️ Hook Return Types

| Hook        | Return                             |
|-------------|------------------------------------|
| `useGet`    | `{ data, error, loading, reload }` |
| `usePost`   | `{ error, loading, postData }`     |
| `usePut`    | `{ error, loading, putData }`      |
| `useDelete` | `{ error, loading, deleteData }`   |

---

## 🌍 Real-World Usage Example

**📁 /hooks/api.ts**

```ts
import { createFetchHooks } from "create-fetch-hooks";

export const {
  useGet,
  usePost,
  usePut,
  useDelete,
  httpClient,
  FetchCacheProvider,
} = createFetchHooks("https://api.example.com", {
  accessTokenLocalStorageKey: "accessToken",
  callRefreshToken() {
    return {
      on: [403],
      body: { refreshToken: localStorage.getItem("refreshToken") || "" },
      endpoint: "/refresh",
      saveAccessTokenFromResponse: async (res) => {
        localStorage.setItem("accessToken", res?.accessToken);
      },
    };
  },
  onResponse(url, endpoint, responseCode) {
    if (endpoint === "/me" && responseCode === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  },
});
```

**📁 /components/UserList.tsx**

```tsx
import { useGet } from "../hooks/api";

interface User {
  id: number;
  name: string;
}

const UserList = () => {
  const { data: users, loading, error, reload } = useGet<User[]>("/users");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error occurred: {error.message}</p>;

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

**📁 /App.tsx**

```tsx
import { FetchCacheProvider } from "../hooks/api";
import UserList from "./components/UserList";

function App() {
  return (
    <FetchCacheProvider>
      <UserList />
    </FetchCacheProvider>
  );
}

export default App;
```

---

## 📜 Docs

All options and return types are strongly typed with TypeScript. Key configuration options include:

- `setHeaders`: Function to dynamically generate headers for each request.
- `accessTokenLocalStorageKey`: Key for retrieving access token from localStorage.
- `callRefreshToken`: Configures token refresh logic, including response codes, endpoint, body, and token storage.
- `onResponse`: Callback for handling responses globally.
- `onSuccess`, `onError`, `onResponseGot`: Callbacks for specific hooks.
- `convertToFormData`, `removeIfValueIsNullOrUndefined`: Options for POST/PUT data handling.
- `debounce`, `dontRequestIfUrlIncludeNullOrUndefined`: Options for GET requests.

Check the source code and full examples on GitHub for detailed usage.

---

## 📌 Links

- 🔗 NPM: [create-fetch-hooks](https://www.npmjs.com/package/create-fetch-hooks)
- 🐙 GitHub: [ashrafbinahmad/create-fetch-hooks](https://github.com/ashrafbinahmad/create-fetch-hooks)

If you find this package helpful, **please ⭐ the repo on GitHub!** It really helps! 🙏

---

## 📜 License

MIT