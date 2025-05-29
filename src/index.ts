import { useGet, UseGetOptions } from "./useGet";
import { usePost, UsePostOptions } from "./usePost";
import { usePut, UsePutOptions } from "./usePut";
import { useDelete, UseDeleteOptions } from "./useDelete";
import { get, GetOptions } from "./get";
import { post, PostOptions } from "./post";
import { put, PutOptions } from "./put";
import { del } from "./del";
import { FetchCacheProvider } from "./FetchCacheProvider";
import { mergeHeaders } from "./utils/mergeHeader";

export type CreateFetchHooksOptions = {
  staticHeaders?: Record<string, string>;
  accessTokenLocalStorageKey?: string;
  callRefreshToken?: () => {
    on: number[]; // response codes to trigger refresh
    body: Record<string, string>; // user-defined refresh body
    endpoint: string; // endpoint to call for refresh
    saveAccessTokenFromResponse?: (res?: any) => void; // how to extract new token
  };
  setHeaders?: () => Record<string, string>;
  onResponse?: (
    url: string,
    endpoint: string,
    responseCode: number | string | undefined
  ) => void;
};
export function createFetchHooks(
  baseApiUrl: string,
  baseOptions?: CreateFetchHooksOptions
) {
  return {
    FetchCacheProvider,
    useGet: <T>(url: string, options?: UseGetOptions<T>) => {
      const dynamicHeaders = baseOptions?.setHeaders?.();
      const headers = mergeHeaders(baseOptions?.staticHeaders, {
        ...dynamicHeaders,
        Authorization: `Bearer ${localStorage.getItem(
          baseOptions?.accessTokenLocalStorageKey || ""
        )}`,
      });
      return useGet<T>(baseApiUrl, url, {
        ...options,
        headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponse?.(url, endpoint, responseCode);
        },
        accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
        callRefreshToken: baseOptions?.callRefreshToken,
      });
    },
    usePost: <PostDataType, ResponseType>(
      url: string,
      options?: UsePostOptions<ResponseType>
    ) => {
      const dynamicHeaders = baseOptions?.setHeaders?.();
      const headers = mergeHeaders(baseOptions?.staticHeaders, {
        ...dynamicHeaders,
        Authorization: `Bearer ${localStorage.getItem(
          baseOptions?.accessTokenLocalStorageKey || ""
        )}`,
      });
      return usePost<PostDataType, ResponseType>(baseApiUrl, url, {
        ...options,
        headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponse?.(url, endpoint, responseCode);
        },
        accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
        callRefreshToken: baseOptions?.callRefreshToken,
      });
    },
    usePut: <PutDataType, ResponseType>(
      url: string,
      options?: UsePutOptions<ResponseType>
    ) => {
      const dynamicHeaders = baseOptions?.setHeaders?.();
      const headers = mergeHeaders(baseOptions?.staticHeaders, {
        ...dynamicHeaders,
        Authorization: `Bearer ${localStorage.getItem(
          baseOptions?.accessTokenLocalStorageKey || ""
        )}`,
      });
      return usePut<PutDataType, ResponseType>(baseApiUrl, url, {
        ...options,
        headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponse?.(url, endpoint, responseCode);
        },
        accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
        callRefreshToken: baseOptions?.callRefreshToken,
      });
    },
    useDelete: <ResponseType>(
      url: string,
      options?: UseDeleteOptions<ResponseType>
    ) => {
      const dynamicHeaders = baseOptions?.setHeaders?.();
      const headers = mergeHeaders(baseOptions?.staticHeaders, {
        ...dynamicHeaders,
        Authorization: `Bearer ${localStorage.getItem(
          baseOptions?.accessTokenLocalStorageKey || ""
        )}`,
      });
      return useDelete<ResponseType>(baseApiUrl, url, {
        ...options,
        headers,
        onResponseGot(url, endpoint, responseCode) {
          baseOptions?.onResponse?.(url, endpoint, responseCode);
        },
        accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
        callRefreshToken: baseOptions?.callRefreshToken,
      });
    },
    httpClient: {
      get: <ResponseType>(url: string, options?: GetOptions<ResponseType>) => {
        const dynamicHeaders = baseOptions?.setHeaders?.();
        const headers = mergeHeaders(baseOptions?.staticHeaders, {
          ...dynamicHeaders,
          Authorization: `Bearer ${localStorage.getItem(
            baseOptions?.accessTokenLocalStorageKey || ""
          )}`,
        });
        return get<ResponseType>(baseApiUrl, url, {
          ...options,
          headers,
          accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
          callRefreshToken: baseOptions?.callRefreshToken,
        });
      },
      post: <PostDataType, ResponseType>(
        url: string,
        postData: PostDataType,
        options?: PostOptions<ResponseType>
      ) => {
        const dynamicHeaders = baseOptions?.setHeaders?.();
        const headers = mergeHeaders(baseOptions?.staticHeaders, {
          ...dynamicHeaders,
          Authorization: `Bearer ${localStorage.getItem(
            baseOptions?.accessTokenLocalStorageKey || ""
          )}`,
        });
        return post<PostDataType, ResponseType>(baseApiUrl, url, postData, {
          ...options,
          headers,
          accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
          callRefreshToken: baseOptions?.callRefreshToken,
        });
      },
      put: <PutDataType, ResponseType>(
        url: string,
        dataToPut: PutDataType,
        options?: PutOptions<ResponseType>
      ) => {
        const dynamicHeaders = baseOptions?.setHeaders?.();
        const headers = mergeHeaders(baseOptions?.staticHeaders, {
          ...dynamicHeaders,
          Authorization: `Bearer ${localStorage.getItem(
            baseOptions?.accessTokenLocalStorageKey || ""
          )}`,
        });
        return put<PutDataType, ResponseType>(baseApiUrl, url, dataToPut, {
          ...options,
          headers,
          accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
          callRefreshToken: baseOptions?.callRefreshToken,
        });
      },
      del: <ResponseType>(url: string, options?: PutOptions<ResponseType>) => {
        const dynamicHeaders = baseOptions?.setHeaders?.();
        const headers = mergeHeaders(baseOptions?.staticHeaders, {
          ...dynamicHeaders,
          Authorization: `Bearer ${localStorage.getItem(
            baseOptions?.accessTokenLocalStorageKey || ""
          )}`,
        });
        return del<ResponseType>(baseApiUrl, url, {
          ...options,
          headers,
          accessTokenLocalStorageKey: baseOptions?.accessTokenLocalStorageKey,
          callRefreshToken: baseOptions?.callRefreshToken,
        });
      },
    },
  };
}
