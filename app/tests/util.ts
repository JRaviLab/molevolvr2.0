import test from "@playwright/test";

/** wait ms */
export const sleep = async (ms = 0) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, ms));

/** pass browser console logs to cli logs */
export const log = () => {
  if (process.env.RUNNER_DEBUG)
    test.beforeEach(({ page }) =>
      page.on("console", (msg) => console.log(msg.text())),
    );
};
