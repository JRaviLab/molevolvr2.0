import { createRequire } from "module";

const analyses = createRequire(import.meta.url)("@/fixtures/analyses.json");

/** page paths to test */
export const paths = [
  "/testbed",
  "/",
  "/load-analysis",
  "/new-analysis",
  "/about",
  ...analyses.map((analysis) => `/analysis/${analysis.id}`),
];
