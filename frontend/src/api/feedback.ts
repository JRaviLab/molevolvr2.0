import type { Endpoints } from "@octokit/types";
import { request } from "@/api";

/** cloud func */
const api = "https://molevolvr-feedback-158418777815.us-central1.run.app";

/** response type for creating new issue */
type Response =
  Endpoints["POST /repos/{owner}/{repo}/issues"]["response"]["data"];

/** feedback form */
export const submitFeedback = async (title: string, body: string) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const created = await request<Response>(
    api,
    {},
    { method: "POST", headers, body: JSON.stringify({ title, body }) },
  );
  return { link: created.html_url };
};
