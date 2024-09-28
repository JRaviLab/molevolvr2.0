import { stringify } from "csv-stringify/browser/esm/sync";

/** download blob as file */
export const download = (
  /** blob data to download */
  data: BlobPart,
  /** single filename string or filename "parts" */
  filename: string | string[],
  /** mime type */
  type: string,
  /** extension, without dot */
  ext: string,
) => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    [filename]
      .flat()
      /** join parts */
      .join("_")
      /** make path-safe */
      .replace(/[^A-Za-z0-9 -]+/g, " ")
      /** consolidate underscores */
      .replace(/_+/g, "_")
      /** consolidate dashes */
      .replace(/-+/g, "-")
      /** consolidate spaces */
      .replace(/\s+/g, " ")
      /** remove extension if already included */
      .replace(new RegExp("." + ext + "$"), "")
      .trim() +
    "." +
    ext;
  link.click();
  window.URL.revokeObjectURL(url);
};

/** download table data as csv */
export const downloadCsv = (data: unknown[], filename: string | string[]) =>
  download(
    stringify(data, { header: true }),
    filename,
    "text/csv;charset=utf-8",
    "csv",
  );

/** download table data as tsv */
export const downloadTsv = (data: unknown[], filename: string | string[]) =>
  download(
    stringify(data, { header: true, delimiter: "\t" }),
    filename,
    "text/tab-separated-values",
    "tsv",
  );

/** download data as json */
export const downloadJson = (data: unknown, filename: string | string[]) =>
  download(JSON.stringify(data), filename, "application/json", "json");

/** download blob as png */
export const downloadPng = (data: BlobPart, filename: string | string[]) =>
  download(data, filename, "image/png", "png");

/** download blob as jpg */
export const downloadJpg = (data: BlobPart, filename: string | string[]) =>
  download(data, filename, "image/jpeg", "jpg");

/** download svg element source code */
export const downloadSvg = (
  /** root svg element */
  element: SVGSVGElement,
  filename: string | string[],
  /** html attributes to add to root svg element */
  addAttrs: Record<string, string> = {},
  /** html attributes to remove from any element */
  removeAttrs: RegExp[] = [/^class$/, /^data-.*/, /^aria-.*/],
) => {
  /** make clone of node to work with and mutate */
  const clone = element.cloneNode(true) as SVGSVGElement;

  /** always ensure xmlns so svg is valid outside of html */
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  /** set attributes on top level svg element */
  for (const [key, value] of Object.entries(addAttrs))
    clone.setAttribute(key, value);

  /** remove specific attributes from all elements */
  for (const element of clone.querySelectorAll("*"))
    for (const removeAttr of removeAttrs)
      for (const { name } of [...element.attributes])
        if (name.match(removeAttr)) element.removeAttribute(name);

  /** download clone source as svg file */
  download(clone.outerHTML, filename, "image/svg+xml", "svg");
};
