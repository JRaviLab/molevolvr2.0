/** see 404.html */

/** load redirect storage items */
export const redirectPath = window.sessionStorage.redirectPath || "";
export const redirectState = JSON.parse(
  window.sessionStorage.redirectState || "null",
);

/** remove redirect storage items right after consuming */
window.sessionStorage.removeItem("redirectPath");
window.sessionStorage.removeItem("redirectState");

/** get url from address bar or redirect */
const { origin, href } = window.location;
/** url at app load time (not reactive) */
export const url = new URL(redirectPath ? origin + redirectPath : href);
