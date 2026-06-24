/** get redirect details (see 404.html) */
export const getRedirect = (clear = true) => {
  /** load redirect storage items */
  const redirectPath = window.sessionStorage.redirectPath || "";
  const redirectState = JSON.parse(
    window.sessionStorage.redirectState || "null",
  );
  /** remove/consume redirect storage items */
  if (clear) {
    window.sessionStorage.removeItem("redirectPath");
    window.sessionStorage.removeItem("redirectState");
  }
  return { redirectPath, redirectState };
};

/** url from address bar */
const { origin, href } = window.location;

const { redirectPath } = getRedirect(false);

/** url at app load time (not reactive) */
export const url = new URL(
  /** from address bar or redirect */
  redirectPath ? origin + redirectPath : href,
);
