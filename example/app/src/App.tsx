import { useEffect, useState } from "react";
import { createFetchHooks } from "../../../src/index";

const { useGet, usePost, usePut, useDelete } = createFetchHooks(
  "http://localhost:3000",
  {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    onResponseGot(url, endpoint, responseCode) {
      console.log(url, endpoint, responseCode);
      localStorage.removeItem("token");
    },
  }
);

type Product = { id?: number; name: string; price: number };
type ProductCreationResponse = { message: string };
type ProductUpdationResponse = { message: string };

function App() {
  const [searchText, setSearchText] = useState("");
  const [debounceTime, setDebounceTime] = useState(0);
  const [page] = useState(1);

  useEffect(() => {
    setDebounceTime(0);
  }, [page]);

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
  } = usePut<Product, ProductUpdationResponse>(`/products/1`, {
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
      <p>{productsData?.name}</p>

      <button onClick={() => reloadProducts()}>Reload Products</button>
      <button onClick={() => postData({ name: "New Product", price: 100 })}>
        Create Product
      </button>
      <button onClick={() => putData({ name: "Updated Product", price: 150 })}>
        Update Product
      </button>
      <button onClick={() => deleteData(5)}>Delete Product</button>

      <p>{loading || creating || updating || deleting ? "Loading" : ""}</p>
      <p>{productsError?.message}</p>
      <p>{createError?.message}</p>
      <p>{updateError?.message}</p>
      <p>{deleteError?.message}</p>
    </div>
  );
}

export default App;
