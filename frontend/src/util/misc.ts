/** wait ms */
export const sleep = async (ms = 0) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** now shorthand */
const now = () => window.performance.now();

/** wait for func to return, checking periodically */
export const waitFor = async <Return>(
  func: () => Return,
): Promise<Return | undefined> => {
  /** custom exponential backoff */
  const waits = [
    0, 1, 5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 3000,
  ];
  while (waits.length) {
    const result = func();
    if (result !== undefined && result !== null) return result;
    await sleep(waits.shift());
  }
};

/** wait for func to return stable value */
export const waitForStable = async <Return>(
  func: () => Return,
  /** wait until func returns same value for at least this long */
  wait = 1000,
  /** check value every this many ms */
  interval = 2,
  /** hard limit on number of checks */
  tries = 1000,
): Promise<Return | undefined> => {
  let lastChanged = now();
  let prevResult: Return | undefined;
  for (; tries > 0; tries--) {
    const result = func();
    if (result !== prevResult) lastChanged = now();
    prevResult = result;
    if (result !== undefined && now() - lastChanged > wait) return result;
    await sleep(interval);
  }
};
