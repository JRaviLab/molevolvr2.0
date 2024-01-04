/** wait ms */
export const sleep = async (ms = 0) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, ms));
