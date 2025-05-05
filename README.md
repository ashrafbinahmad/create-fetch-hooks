# use-api

A lightweight and flexible React hook library for managing API requests with support for GET, POST, PUT, and DELETE operations. Simplifies API interactions with features like debouncing, error handling, and FormData conversion.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [Setup](#setup)
  - [GET Request](#get-request)
  - [POST Request](#post-request)
  - [PUT Request](#put-request)
  - [DELETE Request](#delete-request)
- [Configuration Options](#configuration-options)
- [Example](#example)
- [License](#license)

## Installation

Install the package via npm:

```bash
npm install @ashraflabs/use-api
```

## Features

- **Simple Hooks**: Intuitive `useGet`, `usePost`, `usePut`, and `useDelete` hooks for REST API operations.
- **Debouncing**: Prevent excessive API calls with configurable debounce delays.
- **Error Handling**: Built-in error handling with customizable callbacks.
- **FormData Support**: Automatically convert data to `FormData` for file uploads.
- **Null/Undefined Protection**: Prevent invalid API requests with null or undefined values in URLs.
- **TypeScript Support**: Fully typed for better developer experience.

## Usage

### Setup

Initialize the `useApi` hook with your base API URL and headers:

```typescript
import { useApi } from "@ashraflabs/use-api";

export const { useGet, useDelete, usePost, usePut } = useApi(
  "http://apibaseurlhere/", // ✅ Base URL
  {
    headers: {
      Authontication: `bearer ${localStorage.getItem("token")}`, // ✅ Optional headers
    },
    onRequestDone: (url, endpoint, responseCode) => {
      if (endpoint === "/me" && responseCode === 400) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    },
  }
);
```

### GET Request

Fetch data from an endpoint with optional debouncing and callbacks:

```typescript
const {
  data, // Response data
  error, // Error object
  loading, // Loading state
  reload, // Function to refetch data
} = useGet<Product>(
  `/products?query=${searchText}`, // Endpoint
  {
    onDataGet(data) {
      // ✅ Success callback
    },
    onErrorResponse(error) {
      // ❌ Error callback
    },
    debounce: 300, // ⏱ Delay in ms when URL changes, default is 0
    preventIncludeNullOrUndefined: true, // 🚫 Skip if URL includes `null` or `undefined`
  }
);
```

### POST Request

Create resources with support for FormData and error handling:

```typescript
const {
  postData, // Function to send POST request
  error, // Error object
  loading, // Loading state
} = usePost<Product, ProductCreationResponse>("/products", {
  onResponse(res) {
    // ✅ Success callback
  },
  onErrorResponse(error) {
    // ❌ Error callback
  },
  convertToFormData: true, // 🗂️ Automatically convert to FormData
  removeIfValueIsNullOrUndefined: true, // 🚫 Prevent invalid requests
});

// Usage
postData({ name: "New Product", price: 100 });
```

### PUT Request

Update resources with similar configuration options:

```typescript
const {
  putData, // Function to send PUT request
  error, // Error object
  loading, // Loading state
} = usePut<Product, ProductUpdationResponse>(`/products/${productId}`, {
  onResponse(res) {
    // ✅ Success callback
    console.log("Product updated:", res);
  },
  onErrorResponse(error) {
    // ❌ Error callback
    console.error("Update error:", error);
  },
  convertToFormData: true, // Convert payload to FormData
  removeIfValueIsNullOrUndefined: true, // Skip invalid requests
});

// Usage
putData({ name: "Updated Product", price: 150 });
```

### DELETE Request

Delete resources with customizable callbacks:

```typescript
const {
  deleteData, // Function to send DELETE request
  error, // Error object
  loading, // Loading state
} = useDelete("/products/1", {
  onResponse(res) {
    // ✅ Success callback
    console.log("Product deleted:", res);
  },
  onErrorResponse(error) {
    // ❌ Error callback
    console.error("Deletion error:", error);
  },
});

// Usage
deleteData();
```

## Configuration Options

Each hook accepts an optional configuration object with the following properties:

| Option                           | Type       | Description                                                  |
| -------------------------------- | ---------- | ------------------------------------------------------------ |
| `debounce`                       | `number`   | Delay in milliseconds before sending the request (GET only). |
| `onDataGet`                      | `function` | Callback for successful GET response.                        |
| `onResponse`                     | `function` | Callback for successful POST, PUT, or DELETE response.       |
| `onErrorResponse`                | `function` | Callback for error responses.                                |
| `convertToFormData`              | `boolean`  | Convert payload to `FormData` for POST and PUT requests.     |
| `removeIfValueIsNullOrUndefined` | `boolean`  | Prevent requests if URL contains `null` or `undefined`.      |
| `preventIncludeNullOrUndefined`  | `boolean`  | Prevent GET requests if URL contains `null` or `undefined`.  |

## Example

Below is a complete example demonstrating a product management app:

```javascript
import { useEffect, useState } from "react";
import { useApi } from "@ashraflabs/use-api";

const { useGet, usePost, usePut, useDelete } = useApi(
  "http://someapi.base",
  {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    onRequestDone(url, endpoint, responseCode) {
      console.log(url, endpoint, responseCode);
      if (endpoint === "/me" && responseCode === 400) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    },
  }
);

type Product = { id: number; name: string; price: number };
type ProductCreationResponse = { message: string };
type ProductUpdationResponse = { message: string };

function App() {
  const [searchText, setSearchText] = useState("");
  const [debounceTime, setDebounceTime] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setDebounceTime(0);
  }, [page]);

  // GET: Fetch products
  const { data, error, loading, reload } = useGet<Product>(
    `/products?query=${searchText}`,
    {
      debounce: debounceTime,
      onResponse(data) {
        console.log("Products:", data);

      },
      preventIncludeNullOrUndefined: true,
    }
  );

  // POST: Create product
  const { postData, error: createError, loading: creating } = usePost<
    Product,
    ProductCreationResponse
  >("/products", {
    convertToFormData: true,
    onResponse(res) {
      console.log(res.message);
    },
  });

  // PUT: Update product
  const { putData, error: updateError, loading: updating } = usePut<
    Product,
    ProductUpdationResponse
  >(`/products/1`, {
    convertToFormData: true,
    onResponse(res) {
      console.log(res.message);
    },
  });

  // DELETE: Delete product
  const { deleteData, error: deleteError, loading: deleting } = useDelete(
    "/products",
    {
      onResponse(res) {
        console.log("Deleted");
      },
    }
  );

  return (
    <div>
      <input
        type="text"
        value={searchText}
        onChange={(e) => {
          setDebounceTime(300);
          setSearchText(e.target.value);
        }}
      />
      <button onClick={() => postData({ name: "New Product", price: 100 })}>
        Create Product
      </button>
      <button onClick={() => putData({ name: "Updated Product", price: 150 })}>
        Update Product
      </button>
      <button onClick={() => deleteData(5 /* request is sent like DELETE http://base.api/products/5 */)}>Delete Product</button>
    </div>
  );
}

export default App;
```

## License

MIT License. See [LICENSE](LICENSE) for details.
