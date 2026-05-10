export type AdminSearchParamValue = string | string[] | undefined;

export type AdminSearchParams = Record<string, AdminSearchParamValue>;

export function appendSearchParamValue(params: URLSearchParams, key: string, value: AdminSearchParamValue): void {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item) {
        params.append(key, item);
      }
    });
    return;
  }

  if (value) {
    params.set(key, value);
  }
}

export function createSearchParams(searchParams: AdminSearchParams): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    appendSearchParamValue(params, key, value);
  });

  return params;
}
