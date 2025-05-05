import { FetchError } from "./types/FetchError";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";
import { FormDataType } from "./types/FormDataType";
import { dataToFormData } from "./utils/dataToFormData";

export type PutOptions<Response> = {
  onSuccess?: (res: Response) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  convertToFormData?: boolean;
  removeIfValueIsNullOrUndefined?: boolean;
  headers?: Record<string, string>;
};

export async function put<PutDataType, ResponseType>(
  baseApiUrl: string,
  url: string,
  dataToPut: PutDataType,
  options?: PutOptions<ResponseType>
) {
  const cleanedUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);
  let responseCode: number | string | undefined;
  try {
    let payload: PutDataType | FormData | { [k: string]: unknown } = dataToPut;

    if (options?.convertToFormData) {
      payload = dataToFormData(
        dataToPut as FormDataType,
        options.removeIfValueIsNullOrUndefined ?? false
      );
    } else if (options?.removeIfValueIsNullOrUndefined) {
      payload = Object.fromEntries(
        Object.entries(dataToPut as Record<string, unknown>).filter(
          ([, value]) => value !== null && value !== undefined
        )
      );
    }

    const response = await fetch(cleanedUrl, {
      method: "PUT",
      headers: {
        ...(options?.headers || {}),
        ...(payload instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
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
      cleanedUrl,
      removeMultipleSlashes(cleanedUrl.replace(baseApiUrl, "/")).split("?")[0],
      responseCode
    );
  }
}
