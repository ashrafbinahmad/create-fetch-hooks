import { useState } from "react";
import { FetchError } from "./types/FetchError";
import { post } from "./post";

export type UsePostOptions<Response> = {
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
  accessTokenLocalStorageKey?: string;
  callRefreshToken?: () => {
    on: number[]; // response codes to trigger refresh
    body: Record<string, string>; // user-defined refresh body
    endpoint: string; // endpoint to call for refresh
    saveAccessTokenFromResponse?: (res: any) => void; // how to extract new token
  };
};

export function usePost<PostDataType, ResponseType>(
  baseApiUrl: string,
  url: string,
  options?: UsePostOptions<ResponseType>
) {
  const [error, setError] = useState<FetchError>();
  const [loading, setLoading] = useState(false);

  async function postData(dataToPost: PostDataType, id?: number | string) {
    setLoading(true);
    post<PostDataType, ResponseType>(
      baseApiUrl,
      `${url}/${id || ""}`,
      dataToPost,
      {
        convertToFormData: options?.convertToFormData,
        headers: options?.headers,
        removeIfValueIsNullOrUndefined: options?.removeIfValueIsNullOrUndefined,
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
      }
    );
  }

  return { error, loading, postData };
}
