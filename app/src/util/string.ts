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
export const formatNumber = (value: number | undefined, compact = false) => {
  if (value === undefined) return "-";
  if (Math.abs(value) < 0.01 && value) return value.toExponential(1);
  const options: Intl.NumberFormatOptions = {};
  if (compact) options.notation = "compact";
  if (Math.abs(value) > 1) options.maximumFractionDigits = 2;
  if (Math.abs(value) < 1) options.maximumSignificantDigits = 2;
  return value.toLocaleString(undefined, options).toLowerCase();
};

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

/** make label (e.g. aria label) from html string */
export const makeLabel = (string: string) =>
  (
    new DOMParser().parseFromString(string, "text/html").body.textContent || ""
  ).replaceAll(/\s+/g, " ");
