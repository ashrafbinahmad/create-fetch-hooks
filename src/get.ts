import { refreshToken } from "./refreshToken";
import { FetchError } from "./types/FetchError";
import { mergeHeaders } from "./utils/mergeHeader";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";

export type GetOptions<ResponseType> = {
  onSuccess?: (res: ResponseType) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  dontRequestIfUrlIncludeNullOrUndefined?: boolean;
  accessTokenLocalStorageKey?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal | null | undefined;

  callRefreshToken?: () => {
    on: number[]; // response codes to trigger refresh
    body: Record<string, string>; // user-defined refresh body
    endpoint: string; // endpoint to call for refresh
    saveAccessTokenFromResponse?: (res: any) => void; // how to extract new token
  };
  retryCount?: number; // Number of retry attempts for 403 errors
  retryDelay?: number; // Delay between retries in milliseconds
};

export async function get<ResponseType>(
  baseApiUrl: string,
  url: string,
  options?: GetOptions<ResponseType>
) {
  let responseCode: number | undefined;
  const cleanedUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);
  const maxRetries = options?.retryCount ?? (options?.callRefreshToken ? 1 : 0); // Default to 0 retries if not specified
  const retryDelay = options?.retryDelay ?? 0; // Default to 1 second delay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(cleanedUrl, {
        method: "GET",
        headers: mergeHeaders(options?.headers, {
          Authorization: `Bearer ${localStorage.getItem(
            options?.accessTokenLocalStorageKey || ""
          )}`,
          test2: Math.floor(Math.random() * 9000).toString(),
        }),
        signal: options?.signal,
      });
      responseCode = response.status;

      if (!response.ok) {
        const error = new FetchError(
          `HTTP error! Status: ${response.status}`,
          response,
          response.status
        );

        // If 403 and retries remain, wait and retry
        const refreshTokenConfig = options?.callRefreshToken?.();
        if (
          refreshTokenConfig?.on.includes(response.status) &&
          attempt < maxRetries
        ) {
          // await new Promise((resolve) => {

          await new Promise((resolve) => setTimeout(resolve, retryDelay));

          await refreshToken(
            baseApiUrl,
            refreshTokenConfig.endpoint,
            refreshTokenConfig.body,
            refreshTokenConfig.saveAccessTokenFromResponse,
          );
          continue; // Retry the request
        }

        throw error;
      }

      const res = await response.json();
      options?.onSuccess?.(res);
      return; // Exit on success
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        const fetchErr =
          err instanceof FetchError ? err : new FetchError(err.message);
        if (attempt === maxRetries) {
          // Only call onError on the final attempt
          options?.onError?.(fetchErr);
          if (fetchErr.status !== undefined) {
            responseCode = fetchErr.status || undefined;
          }
        }
      }
    } finally {
      if (attempt === maxRetries) {
        // Call onResponseGot only on the final attempt
        options?.onResponseGot?.(
          cleanedUrl,
          removeMultipleSlashes(cleanedUrl.replace(baseApiUrl, "/")).split(
            "?"
          )[0],
          responseCode
        );
      }
    }
  }
}
