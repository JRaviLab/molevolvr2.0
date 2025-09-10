import type { Endpoints } from "@octokit/types";
import { request } from "@/api";

/** cloud func */
const url = "https://molevolvr-issue-158418777815.us-central1.run.app";

/** response type for creating new issue */
type Response =
  Endpoints["POST /repos/{owner}/{repo}/issues"]["response"]["data"];

/** see /cloud/issue */
type Body = {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels: string[];
};

/** create issue in repo */
export const createIssue = async (body: Body) => {
  const created = await request<Response>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return { link: created.html_url };
};
