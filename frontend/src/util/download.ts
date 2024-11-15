import { stringify } from "csv-stringify/browser/esm/sync";

type Filename = string | string[];

/** download url as file */
const download = (
  /** url to download */
  url: string,
  /** single filename string or filename "parts" */
  filename: Filename,
  /** extension, without dot */
  ext: string,
) => {
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

/** make url from blob */
export const getUrl = (
  /** blob data to download */
  data: BlobPart,
  /** mime type */
  type: string,
) =>
  typeof data === "string" && data.startsWith("data:")
    ? data
    : window.URL.createObjectURL(new Blob([data], { type }));

/** download table data as csv */
export const downloadCsv = (data: unknown[], filename: Filename) =>
  download(
    getUrl(stringify(data, { header: true }), "text/csv;charset=utf-8"),
    filename,
    "csv",
  );

/** download table data as tsv */
export const downloadTsv = (data: unknown[], filename: Filename) =>
  download(
    getUrl(
      stringify(data, { header: true, delimiter: "\t" }),
      "text/tab-separated-values",
    ),
    filename,
    "tsv",
  );

/** download data as json */
export const downloadJson = (data: unknown, filename: Filename) =>
  download(getUrl(JSON.stringify(data), "application/json"), filename, "json");

/** download blob as png */
export const downloadPng = (data: BlobPart, filename: Filename) =>
  download(getUrl(data, "image/png"), filename, "png");

/** download blob as jpg */
export const downloadJpg = (data: BlobPart, filename: Filename) =>
  download(getUrl(data, "image/jpeg"), filename, "jpg");

/** download svg element source code */
export const downloadSvg = (
  /** root svg element */
  element: SVGSVGElement,
  filename: Filename,
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
  download(getUrl(clone.outerHTML, "image/svg+xml"), filename, "svg");
};
