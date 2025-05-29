import { useCallback, useEffect, useState } from "react";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";
import { FetchError } from "./types/FetchError";
import { get } from "./get";
import { useFetchCache } from "./FetchCacheProvider";

export type UseGetOptions<ResponseType> = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  debounce?: number;
  dontRequestIfUrlIncludeNullOrUndefined?: boolean;
  headers?: Record<string, string>;
  accessTokenLocalStorageKey?: string;
  callRefreshToken?: () => {
    on: number[]; // response codes to trigger refresh
    body: Record<string, string>; // user-defined refresh body
    endpoint: string; // endpoint to call for refresh
    saveAccessTokenFromResponse?: (res: any) => void; // how to extract new token
  };
};

export function useGet<T>(
  baseApiUrl: string,
  url: string,
  options?: UseGetOptions<T>
) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<FetchError | undefined>();
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  const cache = useFetchCache(); // ✅ get cache context

  const reload = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  const cleanUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);

  useEffect(() => {
    if (!url) return;
    if (
      options?.dontRequestIfUrlIncludeNullOrUndefined &&
      (cleanUrl.includes("undefined") || cleanUrl.includes("null"))
    ) {
      return;
    }

    const controller = new AbortController();
    const debounceDelay = options?.debounce ?? 0;

    const timeout = setTimeout(() => {
      const fetchData = async () => {
        if (cache?.has(cleanUrl)) {
          const cached = cache.get(cleanUrl);
          setData(cached);
          // setLoading(false);
          // options?.onSuccess?.(cached);
          // return;
        }

        setLoading(true);

        get<T>(baseApiUrl, url, {
          dontRequestIfUrlIncludeNullOrUndefined:
            options?.dontRequestIfUrlIncludeNullOrUndefined,
          headers: options?.headers,
          signal: controller.signal,
          onSuccess(res) {
            setData(res);
            setError(undefined);
            options?.onSuccess?.(res);
            cache?.set(cleanUrl, res);
          },
          onError(err) {
            setError(err);
            setData(undefined);
            options?.onError?.(err);
          },
          onResponseGot(url, endpoint, responseCode) {
            setLoading(false);
            options?.onResponseGot?.(url, endpoint, responseCode);
          },
          accessTokenLocalStorageKey: options?.accessTokenLocalStorageKey,
          callRefreshToken: options?.callRefreshToken,
        });
      };

      fetchData();
    }, debounceDelay);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [cleanUrl, trigger, options?.debounce]);

  return { data, error, loading, reload };
}
