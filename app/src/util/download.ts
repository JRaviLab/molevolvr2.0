import { stringify } from "csv-stringify/browser/esm/sync";

/** download blob as file */
export const download = (
  data: BlobPart,
  filename: string | string[],
  type: string,
  ext: string,
) => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    [filename]
      .flat()
      .join("_")
      .replace(/[^ A-Za-z0-9_-]/g, " ")
      .replace(/\s+/g, "-") +
    "." +
    ext;
  link.click();
  window.URL.revokeObjectURL(url);
};

/** download table data as csv */
export const downloadCsv = (data: unknown[], filename: string | string[]) =>
  download(stringify(data), filename, "text/csv;charset=utf-8", "csv");
