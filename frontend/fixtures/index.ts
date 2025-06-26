import { random } from "lodash";
import { http, HttpResponse, passthrough } from "msw";
import type { HttpResponseResolver } from "msw";
import { sleep } from "@/util/misc";
import analyses from "./analyses.json";
import stats from "./stats.json";

/** non-mocked/handled request */
const nonMocked: HttpResponseResolver = ({ request }) => {
  console.debug("Non-mocked request", new URL(request.url).pathname);
  return passthrough();
};

/** artificial delay to test loading spinners */
const delay = () => sleep(random(1000, 3000));

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  http.get("*/stats", async () => {
    await delay();
    HttpResponse.json(stats);
  }),

  http.get("*/analysis/:id", async ({ params }) => {
    await delay();
    const id = String(params.id);
    const lookup = analyses.find((analysis) => analysis.id === id);
    if (!lookup) return new HttpResponse(null, { status: 404 });
    else return HttpResponse.json(lookup);
  }),

  http.post("*/feedback", async ({ request }) => {
    await delay();
    if ((await request.clone().json()).body.includes("fake error"))
      return new HttpResponse(null, { status: 500 });
    return HttpResponse.json({ link: import.meta.env.VITE_REPO + "/issues" });
  }),

  /** any other request */
  http.get(/.*/, nonMocked),
  http.post(/.*/, nonMocked),
];
