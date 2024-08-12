import { sleep } from "@/util/misc";

/** base api url */
export const api = import.meta.env.VITE_API;

/** general request */
export async function request<Response>(
  /** request url */
  url: string | URL,
  /** url parameters */
  params: Record<string, string | string[]> = {},
  /** fetch options */
  options: RequestInit = {},
  /** parse response mode */
  parse: "json" | "text" = "json",
) {
  /** artificial delay for testing loading spinners */
  await sleep(0);
  /** make url object */
  url = new URL(url);
  /** construct params */
  for (const [key, value] of Object.entries(params))
    for (const param of [value].flat()) url.searchParams.append(key, param);
  /** construct request */
  const request = new Request(url, options);
  console.debug(`📞 Request ${url}`, { params, options, request });
  /** make request */
  const response = await fetch(request);
  /** capture error for throwing later */
  let error = "";
  /** check status code */
  if (!response.ok) error = "Response not OK";
  /** parse response */
  let parsed: Response | undefined;
  try {
    parsed =
      parse === "text"
        ? await response.clone().text()
        : await response.clone().json();
  } catch (e) {
    error = `Couldn't parse response as ${parse}`;
  }
  console.debug(`📣 Response ${url}`, { response, parsed });
  /** throw error after details have been logged */
  if (error || parsed === undefined) throw Error(error);
  return parsed;
}
