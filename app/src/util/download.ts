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
      .replace(/\s+/g, "-")
      .replace(new RegExp("." + ext), "") +
    "." +
    ext;
  link.click();
  window.URL.revokeObjectURL(url);
};

/** download table data as csv */
export const downloadCsv = (data: unknown[], filename: string | string[]) =>
  download(stringify(data), filename, "text/csv;charset=utf-8", "csv");

/** download data as json */
export const downloadJson = (data: unknown, filename: string | string[]) =>
  download(JSON.stringify(data), filename, "application/json", "json");

/** download svg element source code */
export const downloadSvg = (
  element: SVGSVGElement,
  filename: string | string[],
  addAttrs: Record<string, string> = {},
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
