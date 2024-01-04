/** pretty log collection of things as object */
export const groupLog = (label: string, object: Record<string, unknown>) => {
  if (import.meta.env.MODE === "test") return;
  console.groupCollapsed(label);
  for (const [key, value] of Object.entries(object)) {
    console.info("%c" + key, "font-weight: bold");
    console.info(value);
  }
  console.groupEnd();
};
