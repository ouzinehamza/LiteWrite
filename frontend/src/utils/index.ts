export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}

export const url = (url: string) => {
  const result = url.startsWith('/')
    ? `${import.meta.env.VITE_SERVER_URL as string}${url}`
    : url;

  return result;
};

export const stripQuotes = (str: string) => {
  return str.trim().replace(/^["']|["']$/g, '');
};

type FormDataValue =
  | string
  | number
  | boolean
  | File
  | Blob
  | Date
  | null
  | undefined;

type NestedObject = {
  [key: string]: FormDataValue | NestedObject;
};

export function appendFormData(
  formData: FormData,
  data: NestedObject,
  parentKey: string = ''
): void {
  Object.entries(data).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof Date) {
      formData.append(fullKey, value.toISOString());
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(fullKey, value);
    } else if (typeof value === 'object' && value !== null) {
      appendFormData(formData, value as NestedObject, fullKey);
    } else {
      formData.append(fullKey, String(value ?? ''));
    }
  });
}

export const cssAppliedContent = (body: string) => `
    <div>
      <style>
        h1, h2, h3, h4, h5, h6 {
          font-size: revert;
          font-weight: revert;
        }
      </style>
      ${body}
    <div>
    `;
