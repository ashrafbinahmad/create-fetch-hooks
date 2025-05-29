import { useState } from "react";
import { FetchError } from "./types/FetchError";
import { removeMultipleSlashes } from "./utils/removeMultipleSlashes";
import { del } from "./del";

export type UseDeleteOptions<Response> = {
  onSuccess?: (res: Response) => void;
  onError?: (error: FetchError) => void;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
  headers?: Record<string, string>;
  accessTokenLocalStorageKey?: string;
  callRefreshToken?: () => {
    on: number[]; // response codes to trigger refresh
    body: Record<string, string>; // user-defined refresh body
    endpoint: string; // endpoint to call for refresh
    saveAccessTokenFromResponse?: (res: any) => void; // how to extract new token
  };
};

export function useDelete<ResponseType>(
  baseApiUrl: string,
  url: string,
  options?: UseDeleteOptions<ResponseType>
) {
  const [error, setError] = useState<FetchError>();
  const [loading, setLoading] = useState(false);

  const cleanUrl = removeMultipleSlashes(`${baseApiUrl}/${url}`);

  async function deleteData(id?: number | string) {
    setLoading(true);

    del<ResponseType>(baseApiUrl, `${url}/${id || ""}`, {
      headers: options?.headers,
      onSuccess(res) {
        options?.onSuccess?.(res);
      },
      onError(error) {
        setError(error);
        options?.onError?.(error);
      },
      onResponseGot(url, endpoint, responseCode) {
        setLoading(false);
        options?.onResponseGot?.(url, endpoint, responseCode);
      },
      accessTokenLocalStorageKey: options?.accessTokenLocalStorageKey,
      callRefreshToken: options?.callRefreshToken,
    });
  }

  return { error, loading, deleteData };
}
