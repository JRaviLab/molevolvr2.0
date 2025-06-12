import seedrandom from "seedrandom";

/** get current url from address bar or 404 redirect */
const redirect = sessionStorage.redirectPath;
const { origin, href } = window.location;
const url = redirect ? origin + redirect : href;

/** seed for all Math.random calls in app */
export const seed = new URL(url).searchParams.get("seed") || String(Date.now());

/** seed all Math.random calls in app */
seedrandom(seed, { global: true });
