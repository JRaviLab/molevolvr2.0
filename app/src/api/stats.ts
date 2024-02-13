import { api, request } from "./";
import type { Stats } from "./types";

/** get homepage stats */
export const getStats = async () => {
  const response = await request<Stats>(`${api}/stats`);
  return response;
};
