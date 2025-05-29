import { createFetchHooks } from "../../../src/index";

export const {
  useGet,
  useDelete,
  usePost,
  usePut,
  httpClient,
  FetchCacheProvider,
} = createFetchHooks(
  "http://localhost:3000/",
  {
    accessTokenLocalStorageKey: "accessToken",
    callRefreshToken() {
      return {
        on: [403],
        body: { refreshToken: localStorage.getItem("refreshToken") || "" },
        endpoint: "/refresh",
        saveAccessTokenFromResponse: async function (res) {
          localStorage.setItem("accessToken", res?.accessToken);
          
        },
      };
    },
  }
);
