import { useCallback, useEffect, useState } from "react";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";
import { FetchError } from "./types/FetchError";
import { get } from "./get";

export type UseGetOptions<ResponseType> = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  debounce?: number; // debounce delay in milliseconds
  dontRequestIfUrlIncludeNullOrUndefined?: boolean;
  headers?: Record<string, string>;
};
/**
 * A custom React hook for making GET requests using the Fetch API.
 * @template Response The type of the response data.
 * @param url The API endpoint URL (relative or absolute). The request will resend when the url change. use debounce in options to make a delay
 * @param options Optional configuration for the GET request.
 * @param options.onDataGet Callback invoked with the response data on success.
 * @param options.onErrorResponse Callback invoked with a FetchError on failure.
 * @param options.debounce Delay in milliseconds before sending the request..
 * @param options.dontRequestIfUrlIncludeNullOrUndefined If true, skips requests if the URL contains "undefined" or "null".
 * @param options.headers Custom headers for the request.
 * @param options.baseApiUrl Base URL to prepend to the endpoint.
 * @returns An object containing the response data, error, loading state, and a reload function.
 * @example
 * const { data, error, loading, reload } = useGet<User>("/api/user", {
 *   baseApiUrl: "http://localhost:5000",
 *   onDataGet: (data) => console.log(data),
 * });
 */
export function useGet<T>(
  baseApiUrl: string,
  url: string,
  options?: UseGetOptions<T>
) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<FetchError | undefined>();
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

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
        },
        onError(error) {
          setError(error);
          setData(undefined);
          options?.onError?.(error);
        },
        onResponseGot(url, endpoint, responseCode) {
          setLoading(false)
          options?.onResponseGot?.(url, endpoint, responseCode);
        },
      });
      };

      fetchData();
    }, debounceDelay);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [cleanUrl, trigger, options?.debounce, options?.headers]);

  return { data, error, loading, reload };
}
