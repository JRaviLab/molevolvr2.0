import { api, request } from "@/api";

/** feedback form */
export const submitFeedback = async (title: string, body: string) =>
  request<{ link: string }>(
    `${api}/feedback`,
    {},
    {
      method: "POST",
      body: JSON.stringify({ title, body }),
    },
  );
