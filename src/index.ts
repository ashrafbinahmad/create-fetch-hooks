import { useGet, UseGetOptions } from "./useGet";
import { usePost, UsePostOptions } from "./usePost";
import { usePut, UsePutOptions } from "./usePut";
import { useDelete, UseDeleteOptions } from "./useDelete";
import { get, GetOptions } from "./get";
import { post, PostOptions } from "./post";
import { put, PutOptions } from "./put";
import { del } from "./del";

/**
 * A factory hook that provides a set of API hooks with a shared base API URL.
 * @param baseApiUrl The base URL for all API requests (e.g., "http://localhost:5000").
 * @returns An object containing useGet, usePost, usePut, and useDelete hooks, and httpClient.
 * @example
 * const { useGet, usePost, usePut, useDelete } = useApi("http://localhost:5000");
 * const { data } = useGet<User>("/api/user");
 * const { postData } = usePost<{ name: string }, { id: string }>("/api/create");
 */
export type UseApiOptions = {
  headers?: Record<string, string>;
  onResponseGot?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
};
export function createFetchHooks(
  baseApiUrl: string,
  baseOptions?: UseApiOptions
) {
  return {
    useGet: <T>(url: string, options?: UseGetOptions<T>) =>
      useGet<T>(baseApiUrl, url, {
        ...options,
        headers: baseOptions?.headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponseGot?.(url, endpoint, responseCode);
        },
      }),
    usePost: <PostDataType, ResponseType>(
      url: string,
      options?: UsePostOptions<ResponseType>
    ) =>
      usePost<PostDataType, ResponseType>(baseApiUrl, url, {
        ...options,
        headers: baseOptions?.headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponseGot?.(url, endpoint, responseCode);
        },
      }),
    usePut: <PutDataType, ResponseType>(
      url: string,
      options?: UsePutOptions<ResponseType>
    ) =>
      usePut<PutDataType, ResponseType>(baseApiUrl, url, {
        ...options,
        headers: baseOptions?.headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponseGot?.(url, endpoint, responseCode);
        },
      }),
    useDelete: <ResponseType>(
      url: string,
      options?: UseDeleteOptions<ResponseType>
    ) =>
      useDelete<ResponseType>(baseApiUrl, url, {
        ...options,
        headers: baseOptions?.headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponseGot?.(url, endpoint, responseCode);
        },
      }),
    httpClient: {
      get: <ResponseType>(url: string, options?: GetOptions<ResponseType>) =>
        get<ResponseType>(baseApiUrl, url, options),
      post: <PostDataType, ResponseType>(
        url: string,
        postData: PostDataType,
        options?: PostOptions<ResponseType>
      ) => post<PostDataType, ResponseType>(baseApiUrl, url, postData, options),
      put: <PutDataType, ResponseType>(
        url: string,
        dataToPut: PutDataType,
        options?: PutOptions<ResponseType>
      ) => put<PutDataType, ResponseType>(baseApiUrl, url, dataToPut, options),
      del: <ResponseType>(
        url: string,
        options?: PutOptions<ResponseType>
      ) => del<ResponseType>(baseApiUrl, url, options),
    },
  };
}
