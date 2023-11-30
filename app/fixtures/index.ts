import { http, HttpResponse, passthrough } from "msw";
import { api } from "@/api";
import analyses from "./analyses.json";
import stats from "./stats.json";

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  http.get(api + "/stats", () => HttpResponse.json(stats)),

  http.get(api + "/analysis/:id", ({ params }) => {
    const id = String(params.id);
    const lookup = analyses.find((analysis) => analysis.id === id);
    if (!lookup) return new HttpResponse(null, { status: 404 });
    else return HttpResponse.json(lookup);
  }),

  /** any other request */
  http.get(/.*/, ({ request }) => {
    const { pathname } = new URL(request.url);
    /** only clutter log if not an asset like .jpg or .woff2 */
    if (!pathname.match(/\.[A-Za-z0-9]{2,5}$/))
      console.warn("Non-mocked request", pathname);
    return passthrough();
  }),
];
