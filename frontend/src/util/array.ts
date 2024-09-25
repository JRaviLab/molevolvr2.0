import { formatNumber } from "./string";

/** remove entries from middle of array to limit array length */
export const carve = (array: string[], limit: number) => {
  const reduce = array.length - limit;
  if (reduce <= 0) return array;
  const start = Math.ceil(array.length / 2 - reduce / 2);
  const end = Math.ceil(array.length / 2 + reduce / 2);
  return array
    .slice(0, start)
    .concat([`... ${formatNumber(reduce)} more ...`])
    .concat(array.slice(end));
};
