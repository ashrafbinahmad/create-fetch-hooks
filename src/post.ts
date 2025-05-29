import { refreshToken } from "./refreshToken";
import { FetchError } from "./types/FetchError";
import { dataToFormData } from "./utils/dataToFormData";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";
import { FormDataType } from "./types/FormDataType";
import { mergeHeaders } from "./utils/mergeHeader";

export type PostOptions<ResponseType> = {
  onSuccess?: (res: ResponseType) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  convertToFormData?: boolean;
  removeIfValueIsNullOrUndefined?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal | null | undefined;
  accessTokenLocalStorageKey?: string;
  callRefreshToken?: () => {
    on: number[]; // response codes to trigger refresh
    body: Record<string, string>; // user-defined refresh body
    endpoint: string; // endpoint to call for refresh
    saveAccessTokenFromResponse?: (res: any) => void; // how to extract new token
  };
  retryCount?: number; // Number of retry attempts for 403 errors
  retryDelay?: number; // Delay between retries in milliseconds
};

export async function post<PostDataType, ResponseType>(
  baseApiUrl: string,
  url: string,
  dataToPost: PostDataType,
  options?: PostOptions<ResponseType>
) {
  const cleanedUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);
  const maxRetries = options?.retryCount ?? (options?.callRefreshToken ? 1 : 0);
  const retryDelay = options?.retryDelay ?? 0;
  let responseCode: number | string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let payload: PostDataType | FormData | { [k: string]: unknown } = dataToPost;

      if (options?.convertToFormData) {
        payload = dataToFormData(
          dataToPost as FormDataType,
          options?.removeIfValueIsNullOrUndefined ?? false
        );
      } else if (options?.removeIfValueIsNullOrUndefined) {
        payload = Object.fromEntries(
          Object.entries(dataToPost as Record<string, unknown>).filter(
            ([, value]) => value !== null && value !== undefined
          )
        );
      }

      const response = await fetch(cleanedUrl, {
        method: "POST",
        headers: mergeHeaders(options?.headers, {
          Authorization: `Bearer ${localStorage.getItem(
            options?.accessTokenLocalStorageKey || ""
          )}`,
          ...(payload instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        }),
        signal: options?.signal,
        body: payload instanceof FormData ? payload : JSON.stringify(payload),
      });
      responseCode = response.status;

      if (!response.ok) {
        const error = new FetchError(
          `HTTP error! Status: ${response.status}`,
          response,
          response.status
        );

        const refreshTokenConfig = options?.callRefreshToken?.();
        if (
          refreshTokenConfig?.on.includes(response.status) &&
          attempt < maxRetries
        ) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          await refreshToken(
            baseApiUrl,
            refreshTokenConfig.endpoint,
            refreshTokenConfig.body,
            refreshTokenConfig.saveAccessTokenFromResponse
          );
          continue; // Retry the request
        }

        throw error;
      }

      const res = await response.json();
      options?.onSuccess?.(res);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        const fetchErr =
          err instanceof FetchError ? err : new FetchError(err.message);
        if (attempt === maxRetries) {
          options?.onError?.(fetchErr);
          if (fetchErr.status !== undefined) {
            responseCode = fetchErr.status || undefined;
          }
        }
      }
    } finally {
      if (attempt === maxRetries) {
        options?.onResponseGot?.(
          cleanedUrl,
          removeMultipleSlashes(cleanedUrl.replace(baseApiUrl, "/")).split("?")[0],
          responseCode
        );
      }
    }
  }
}