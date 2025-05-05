import { FormDataType } from "../types/FormDataType";

/**
 * Converts an object to FormData, handling various data types including arrays and files.
 * @template T The type of the input data, extending FormDataType.
 * @param data The object to convert to FormData.
 * @param removeNulls If true, excludes null or undefined values; otherwise, includes them as empty strings.
 * @returns A FormData object containing the converted key-value pairs.
 * @example
 * const data = { name: "Test", image: new File(["content"], "test.png") };
 * const formData = dataToFormData(data);
 */
export function dataToFormData<T extends FormDataType>(
  data: T,
  removeNulls: boolean = false
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      if (removeNulls) return;
      formData.append(key, "");
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v, index) => {
        if (v === null || v === undefined) return;
        const val = v instanceof Blob || v instanceof File
          ? v
          : v instanceof Uint8Array
          ? new Blob([v])
          : String(v);
        if (key === "image_data" || key === "video_data") {
          formData.append(key, val);
        } else {
          formData.append(`${key}[${index}]`, val);
        }
      });
    } else {
      const val = value instanceof Blob || value instanceof File
        ? value
        : value instanceof Uint8Array
        ? new Blob([value])
        : String(value);
      formData.append(key, val);
    }
  });

  return formData;
}