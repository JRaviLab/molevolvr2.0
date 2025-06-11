import seedrandom from "seedrandom";

/** seed for all Math.random calls in app */
export const seed =
  new URL(window.location.href).searchParams.get("seed") || String(Date.now());

/** seed all Math.random calls in app */
seedrandom(seed, { global: true });
