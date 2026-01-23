import analyses from "../fixtures/analyses.json" with { type: "json" };

/** page paths to test */
export const paths = [
  "/testbed",
  "/",
  "/load-analysis",
  "/new-analysis",
  "/about",
  ...analyses.map((analysis) => `/analysis/${analysis.id}`),
];
