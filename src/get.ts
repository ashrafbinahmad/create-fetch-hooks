import { FetchError } from "./types/FetchError";
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
  headers?: Record<string, string>;
  signal?: AbortSignal | null | undefined
};
export async function get<ResponseType>(
  baseApiUrl: string,
  url: string,
  options?: GetOptions<ResponseType>
) {
  let responseCode: number | undefined;
  const cleanedUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);
  try {
    const response = await fetch(cleanedUrl, {
      method: "GET",
      headers: options?.headers,
      signal: options?.signal
    });
    response.status;
    if (!response.ok) {
      throw new FetchError(
        `HTTP error! Status: ${response.status}`,
        response,
        response.status
      );
    }

    const res = await response.json();
    options?.onSuccess?.(res);
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      const fetchErr =
        err instanceof FetchError ? err : new FetchError(err.message);
      options?.onError?.(fetchErr);
      if (fetchErr.status !== undefined) {
        responseCode = fetchErr.status || undefined;
      }
    }
  } finally {
    options?.onResponseGot?.(
      cleanedUrl,
      removeMultipleSlashes(cleanedUrl.replace(baseApiUrl, "/")).split("?")[0],
      responseCode
    );
  }
}
