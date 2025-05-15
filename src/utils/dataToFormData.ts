// export type FormDataValue =
//   | string
//   | Blob
//   | Blob[]
//   | string[]
//   | File
//   | File[]
//   | Uint8Array
//   | Uint8Array[]
//   | null
//   | undefined
//   | FormDataValueObject
//   | FormDataValue[];

export interface FormDataValueObject {
  [key: string]: any;
}

export type FormDataType = Record<string, any>;

export function dataToFormData<T extends FormDataType>(
  data: T,
  removeNulls: boolean = false,
  parentKey: string | null = null,
  formData: FormData = new FormData()
): FormData {
  Object.entries(data).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      if (!removeNulls) {
        formData.append(fullKey, "");
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v, index) => {
        if (v === null || v === undefined) return;

        const arrayKey = `${fullKey}[${index}]`;

        if (
          typeof v === "object" &&
          !(v instanceof Blob) &&
          !(v instanceof File) &&
          !(v instanceof Uint8Array)
        ) {
          dataToFormData(
            v as FormDataValueObject,
            removeNulls,
            arrayKey,
            formData
          );
        } else {
          const isBlob = v instanceof Blob;
          const isFile = v instanceof File;
          const isUint8Array = v instanceof Uint8Array;

          const val =
            isBlob || isFile
              ? v
              : isUint8Array
              ? new Blob([new Uint8Array(value)])
              : String(v);

          formData.append(arrayKey, val);
        }
      });
    } else if (
      typeof value === "object" &&
      !(value instanceof Blob) &&
      !(value instanceof File) &&
      !(value instanceof Uint8Array)
    ) {
      dataToFormData(
        value as FormDataValueObject,
        removeNulls,
        fullKey,
        formData
      );
    } else {
      const isBlob = value instanceof Blob;
      const isFile = value instanceof File;
      const isUint8Array = value instanceof Uint8Array;

      const val =
        isBlob || isFile
          ? value
          : isUint8Array
          ? new Blob([new Uint8Array(value)])
          : String(value);

      formData.append(fullKey, val);
    }
  });

  return formData;
}
