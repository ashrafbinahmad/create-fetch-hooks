import { post } from "./post";

export const refreshToken = async (
  baseApiUrl: string,
  url: string,
  body: Record<string, string>,
  setAccessTokenFn?: (res: any) => void
) => {
  console.log("Calling refresh token...");
  setAccessTokenFn?.(await post(baseApiUrl, url, body));
};
