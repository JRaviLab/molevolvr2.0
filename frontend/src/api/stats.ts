import type { Stats } from "./types";
import { api, request } from "./";

/** get homepage stats */
export const getStats = async () => {
  const response = await request<Stats>(`${api}/stats`);
  return response;
};
