import { useEffect, useState } from "react";
import {
  useGet,
  usePost,
  useDelete,
  usePut,
  FetchCacheProvider,
} from "./apiManager";

type Product = { id?: number; name: string; price: number };
type ProductCreationResponse = { message: string };
type ProductUpdationResponse = { message: string };

function App() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <FetchCacheProvider>
        {tab === 0 ? (
          <>
            <button onClick={() => setTab(1)}>Next tab</button> <FirstTab />
          </>
        ) : (
          <button onClick={() => setTab(0)}>Go back</button>
        )}
      </FetchCacheProvider>
    </>
  );
}

export default App;

function FirstTab() {
  const [searchText, setSearchText] = useState("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [debounceTime, setDebounceTime] = useState(0);
  const [page] = useState(1);

  useEffect(() => {
    setDebounceTime(0);
  }, [page]);

  // GET: Fetch long time data
  const {
    reload: reloadLongData,
    data: longData,
    // error: longDataError,
    loading: longDataLoding,
  } = useGet<Product>(`/longtimedata`, {
    debounce: debounceTime,
    onSuccess(data) {
      console.log("Products:", data);
    },
    dontRequestIfUrlIncludeNullOrUndefined: true,
  });

  // GET: Fetch products
  const {
    reload: reloadProducts,
    data: productsData,
    error: productsError,
    loading,
  } = useGet<Product>(`/products?query=${searchText}`, {
    debounce: debounceTime,
    onSuccess(data) {
      console.log("Products:", data);
    },
    dontRequestIfUrlIncludeNullOrUndefined: true,
  });

  // POST: Login
  const {
    postData: loginPostData,
    // error: loginError,
    // loading: loggingIn,
  } = usePost<
    { username: string; password: string },
    { accessToken: string; refreshToken: string }
  >("/login", {
    onSuccess(res) {
      console.log(res);
      const { accessToken, refreshToken } = res;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
    onError(error) {
      console.log(error);
    },
  });

  // POST: Refresh token
  const {
    postData: refreshTokenPost,
    // error: loginError,
    // loading: loggingIn,
  } = usePost<{ refreshToken: string | null }, { accessToken: string }>("/refresh", {
    onSuccess(res) {
      console.log(res);
      const { accessToken } = res;
      localStorage.setItem("accessToken", accessToken);
    },
    onError(error) {
      console.log(error);
    },
  });

  // POST: Create product
  const {
    postData,
    error: createError,
    loading: creating,
  } = usePost<Product, ProductCreationResponse>("/products", {
    convertToFormData: true,
    onSuccess(res) {
      console.log(res.message);
    },
  });

  // PUT: Update product
  const {
    putData,
    error: updateError,
    loading: updating,
  } = usePut<Product, ProductUpdationResponse>(`/products`, {
    convertToFormData: true,
    onSuccess(res) {
      console.log(res.message);
    },
  });

  // DELETE: Delete product
  const {
    deleteData,
    error: deleteError,
    loading: deleting,
  } = useDelete("/products", {
    onSuccess(res) {
      console.log("Deleted", res);
    },
  });

  return (
    <>
      <div>
        <input
          aria-label="test"
          type="text"
          value={searchText}
          onChange={(e) => {
            setDebounceTime(300);
            setSearchText(e.target.value);
          }}
        />
        <input
          aria-label="test"
          type="text"
          value={username}
          placeholder="Username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <input
          aria-label="test"
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button onClick={() => loginPostData({ username, password })}>
          Login
        </button>
        <button
          onClick={() =>
            refreshTokenPost({
              refreshToken: localStorage.getItem("refreshToken"),
            })
          }
        >
          Refresh Access Token
        </button>
        <p>{productsData?.name}</p>

        <button onClick={() => reloadProducts()}>Reload Products</button>
        <button onClick={() => reloadLongData()}>Reload LongData</button>
        <button onClick={() => postData({ name: "New Product", price: 100 })}>
          Create Product
        </button>
        <button
          onClick={() => putData({ name: "Updated Product", price: 150 })}
        >
          Update Product
        </button>
        <button onClick={() => deleteData()}>Delete Product</button>

        <p>{JSON.stringify(longData)}</p>
        <p>{JSON.stringify(productsData)}</p>
        <p>{productsError?.message}</p>
        <p>{createError?.message}</p>
        <p>{updateError?.message}</p>
        <p>{deleteError?.message}</p>
        <p>
          {loading || longDataLoding || creating || updating || deleting
            ? "Loading"
            : ""}
        </p>
      </div>
    </>
  );
}
