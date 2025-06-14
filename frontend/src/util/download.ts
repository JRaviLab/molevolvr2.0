import { stringify } from "csv-stringify/browser/esm/sync";
import { toJpeg, toPng } from "html-to-image";
import { getTheme } from "@/util/dom";

export type Filename = (string | undefined)[];

/** assemble and clean full filename */
export const getFilename = (filename: Filename) =>
  [
    /** always start filename with app name */
    String(import.meta.env.VITE_TITLE),
    /** other filename parts */
    ...filename.filter((part) => part !== undefined),
  ]
    .map((part) =>
      part
        /** make path safe */
        .replace(/[^A-Za-z0-9]+/g, "-")
        /** remove leading/trailing dashes */
        .replace(/(^-+)|(-+$)/g, ""),
    )
    .filter((part) => part.trim())
    .join("_");

/** download url as file */
const download = (
  /** url to download */
  url: string,
  /** single filename string or filename "parts" */
  filename: Filename,
  /** extension, without dot */
  ext: string,
) => {
  let download = getFilename(filename);

  /** add extension */
  if (!download.endsWith("." + ext)) download += "." + ext;

  /** trigger download */
  const link = document.createElement("a");
  link.href = url;
  link.download = download;
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

/** download string as text file */
export const downloadTxt = (data: string, filename: Filename) =>
  download(getUrl(data, "text/plain;charset=utf-8"), filename, "txt");

/** tabular data format. array of objects or array of arrays. */
export type Tabular = (Record<string, unknown> | unknown[])[];

/** stringify csv/tsv data */
const getCsv = (data: Tabular, delimiter = ",") =>
  stringify(data, {
    /** whether data is array of objects or array of arrays */
    header: !Array.isArray(data[0]),
    delimiter,
  });

/** download tabular data as csv */
export const downloadCsv = (data: Tabular, filename: Filename) =>
  download(getUrl(getCsv(data), "text/csv;charset=utf-8"), filename, "csv");

/** download tabular data as tsv */
export const downloadTsv = (data: Tabular, filename: Filename) =>
  download(
    getUrl(getCsv(data, "\t"), "text/tab-separated-values"),
    filename,
    "tsv",
  );

/** download data as json */
export const downloadJson = (data: unknown, filename: Filename) =>
  download(getUrl(JSON.stringify(data), "application/json"), filename, "json");

/** download element as png */
export const downloadPng = async (element: Element, filename: Filename) => {
  try {
    // @ts-expect-error typing says lib funcs don't support svg elements, but in practice it does
    const blob = await toPng(element, { backgroundColor: "transparent" });
    download(getUrl(blob, "image/png"), filename, "png");
  } catch (error) {
    console.error(error);
  }
};

/** download blob as jpg */
export const downloadJpg = async (element: Element, filename: Filename) => {
  try {
    // @ts-expect-error typing says lib funcs don't support svg elements, but in practice it does
    const blob = await toJpeg(element, {
      backgroundColor: getTheme()["--white"],
    });
    download(getUrl(blob, "image/jpeg"), filename, "jpg");
  } catch (error) {
    console.error(error);
  }
};

/** download svg element source code */
export const downloadSvg = (
  /** root svg element */
  element: SVGSVGElement,
  filename: Filename,
  /** html attributes to add to root svg element */
  addAttrs: Record<string, string> = { style: "font-family: sans-serif;" },
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
  for (const element of [clone, ...clone.querySelectorAll("*")])
    for (const removeAttr of removeAttrs)
      for (const { name } of [...element.attributes])
        if (name.match(removeAttr)) element.removeAttribute(name);

  /** download clone source as svg file */
  download(getUrl(clone.outerHTML, "image/svg+xml"), filename, "svg");
};
