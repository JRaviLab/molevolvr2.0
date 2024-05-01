import { http, HttpResponse, passthrough } from "msw";
import type { HttpResponseResolver } from "msw";
import analyses from "./analyses.json";
import stats from "./stats.json";

const nonMocked: HttpResponseResolver = ({ request }) => {
  console.debug("Non-mocked request", new URL(request.url).pathname);
  return passthrough();
};

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  http.get("*/stats", () => HttpResponse.json(stats)),

  http.get("*/analysis/:id", ({ params }) => {
    const id = String(params.id);
    const lookup = analyses.find((analysis) => analysis.id === id);
    if (!lookup) return new HttpResponse(null, { status: 404 });
    else return HttpResponse.json(lookup);
  }),

  /** any other request */
  http.get(/.*/, nonMocked),
  http.post(/.*/, nonMocked),
];
