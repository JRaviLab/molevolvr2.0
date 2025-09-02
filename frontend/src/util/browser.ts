import { UAParser } from "ua-parser-js";

export const userAgent = new UAParser(window.navigator.userAgent).getResult();

/**
 * only use these functions as last resort, e.g. for browser-specific bug work
 * arounds
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent#why_feature_detection_is_better_than_browser_detection
 */

export const isFirefox = userAgent.browser.name
  ?.toLowerCase()
  .includes("firefox");

export const isSafari = userAgent.browser.name
  ?.toLowerCase()
  .includes("safari");

/** https://github.com/faisalman/ua-parser-js/issues/182 */
export const isDesktop = !userAgent.device.type;
