/**
 * Type for objects that can be converted to FormData, supporting various data types.
 */
export type FormDataType = Record<
  string,
  string | number | boolean | Blob | File | Uint8Array | null | undefined | Array<string | number | boolean | Blob | File | Uint8Array | null | undefined>
>;