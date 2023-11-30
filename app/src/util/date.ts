export const isValidDate = (date: string) =>
  new Date(date).toString() !== "Invalid Date";
