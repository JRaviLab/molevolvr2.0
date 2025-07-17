import seedrandom from "seedrandom";
import { url } from "@/util/url";

/** seed for all Math.random calls in app */
export const seed = url.searchParams.get("seed") || String(Date.now());

/** seed all Math.random calls in app */
seedrandom(seed, { global: true });
