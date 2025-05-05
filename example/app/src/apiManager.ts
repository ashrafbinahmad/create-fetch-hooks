import { useApi } from "@ashrafbinahmad/use-api";

export const { useGet, useDelete, usePost, usePut } = useApi(
  // baser api url
  "http://apibaseurlhere/",
  // headers
  {
    Authontication: `bearer ${localStorage.getItem("token")}`,
  }
);
