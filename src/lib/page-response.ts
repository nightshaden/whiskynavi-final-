export function parseDisplayPage(value: string | undefined, fallback = 1): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : fallback;
}

export function toApiPage(displayPage: number): number {
  return Math.max(0, displayPage - 1);
}

export function parseApiPage(value: string | undefined): number {
  return toApiPage(parseDisplayPage(value));
}

export function toDisplayPage(apiPage: number | null | undefined): number {
  return (apiPage ?? 0) + 1;
}
