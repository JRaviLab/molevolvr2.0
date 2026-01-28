import type { HttpResponseResolver } from "msw";
import { random } from "lodash";
import { http, HttpResponse } from "msw";
import { sleep } from "@/util/misc";
import analyses from "./analyses.json";
import stats from "./stats.json";

/** non-mocked/handled request */
const nonMocked: HttpResponseResolver = ({ request }) => {
  console.debug("Non-mocked request", new URL(request.url).pathname);
};

/** artificial delay to test loading spinners */
const delay = () => sleep(random(1000, 3000));

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  http.get("*/stats", async () => {
    await delay();
    return HttpResponse.json(stats);
  }),

  http.get("*/analysis/:id", async ({ params }) => {
    await delay();
    const id = String(params.id);
    const lookup = analyses.find((analysis) => analysis.id === id);
    if (!lookup) return new HttpResponse(null, { status: 404 });
    else return HttpResponse.json(lookup);
  }),

  http.post("*molevolvr-issue*.run.app", async ({ request }) => {
    await delay();
    if ((await request.clone().text()).includes("fake error"))
      return new HttpResponse(null, { status: 500 });
    return HttpResponse.json({
      html_url: import.meta.env.VITE_REPO + "/issues/12345",
    });
  }),

  /** any other request */
  http.get(/.*/, nonMocked),
  http.post(/.*/, nonMocked),
];
