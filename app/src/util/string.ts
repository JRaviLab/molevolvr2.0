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
export const formatNumber = (value: number | undefined, compact = false) =>
  value === undefined
    ? null
    : value.toLocaleString(undefined, {
        notation: compact ? "compact" : undefined,
        maximumFractionDigits: Math.abs(value) < 1 ? 2 : undefined,
      });

/** parse date string with fallback */
export const parseDate = (date: string | Date | undefined) => {
  if (!date) return null;
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) throw Error("");
    return new Date(date);
  } catch (error) {
    return null;
  }
};

/** format date to string */
export const formatDate = (date: string | Date | undefined) => {
  const parsed = parseDate(date);
  if (parsed)
    return parsed.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  return null;
};
