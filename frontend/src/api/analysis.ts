import type { Analysis } from "./types";
import { api, request } from "./";

/** get analysis details */
export const getAnalysis = async (id: Analysis["id"]) => {
  const response = await request<Analysis>(`${api}/analysis/${id}`);
  return response;
};
