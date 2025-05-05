// import { useState } from "react";
import { FetchError } from "./types/FetchError";
import { dataToFormData } from "./utils/dataToFormData";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";
import { FormDataType } from "./types/FormDataType";

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
};

export async function post<PostDataType, ResponseType>(
  baseApiUrl: string,
  url: string,
  dataToPost: PostDataType,
  options?: PostOptions<ResponseType>
) {
  const cleanedUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);
  let responseCode: number | string | undefined;
  try {
    let payload: PostDataType | FormData | { [k: string]: unknown } =
      dataToPost;

    if (options?.convertToFormData) {
      payload = dataToFormData(
        dataToPost as FormDataType,
        options.removeIfValueIsNullOrUndefined ?? false
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
