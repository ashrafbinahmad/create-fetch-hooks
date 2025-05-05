import { FetchError } from "./types/FetchError";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";

export type UseDeleteOptions<Response> = {
  onSuccess?: (res: Response) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  headers?: Record<string, string>;
};

export async function del<ResponseType>(
  baseApiUrl: string,
  url: string,
  options?: UseDeleteOptions<ResponseType>
) {
  const cleanUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);

  const cleanedUrl = removeMultipleSlashes(`${cleanUrl}`);
  let responseCode: number | string | undefined;
  try {
    const response = await fetch(cleanedUrl, {
      method: "DELETE",
      headers: {
        ...(options?.headers || {}),
      },
    });
    responseCode = response.status;

    if (!response.ok) {
      throw new FetchError(
        `HTTP error! Status: ${response.status}`,
        response,
        response.status
      );
    }

    const res = await response.json();
    options?.onSuccess?.(res);
    return res;
  } catch (err: unknown) {
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
      cleanUrl,
      removeMultipleSlashes(cleanUrl.replace(baseApiUrl, "/")).split("?")[0],
      responseCode
    );
  }
}
