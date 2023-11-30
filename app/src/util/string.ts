/** shorten url text */
export const shortenUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.hostname + url.pathname;
  } catch (error) {
    return value;
  }
};

/** format number to string */
export const formatNumber = (value: number, compact = false): string =>
  value.toLocaleString(undefined, {
    notation: compact ? "compact" : undefined,
    maximumFractionDigits: Math.abs(value) < 1 ? 2 : undefined,
  });

/** format date to string */
export const formatDate = (date: string | Date) =>
  parseDate(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

/** parse date string with fallback */
export const parseDate = (date: string | Date) => {
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) throw Error("");
    return new Date(date);
  } catch (error) {
    return new Date();
  }
};
