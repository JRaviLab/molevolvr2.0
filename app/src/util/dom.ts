import type { ReactNode } from "react";
import reactToText from "react-to-text";
import { sleep } from "@/util/misc";

/** wait for element matching selector to appear, checking periodically */
export const waitFor = async <El extends Element>(
  selector: string,
): Promise<El | undefined> => {
  const waits = [
    0, 1, 5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 3000,
  ];
  while (waits.length) {
    const match = document.querySelector<El>(selector);
    if (match) return match;
    await sleep(waits.shift());
  }
};

/** scroll to element by selector */
export const scrollTo = async (
  selector?: string | Element | null,
  options?: ScrollIntoViewOptions,
) => {
  /** wait for element to appear */
  const element =
    typeof selector === "string" ? await waitFor(selector) : selector;
  if (!element) return;

  /** wait for layout shifts */
  await sleep(100);

  /** scroll to element */
  element.scrollIntoView({ behavior: "smooth", ...options });
};

/** get text content of react node */
export const renderText = (node: ReactNode) => {
  /**
   * can't use renderToString because doesn't have access to contexts app needs
   * (e.g. router), throwing many errors. impractical to work around (have to
   * provide or fake all contexts).
   *
   * https://react.dev/reference/react-dom/server/renderToString#removing-rendertostring-from-the-client-code
   *
   * alternative react suggests (createRoot, flushSync, root.render) completely
   * impractical. has same context issue, and also can't be called during
   * render/lifecycle (could be worked around by making it async, but then using
   * this function in situ becomes much more of pain)
   */

  /** try normally */
  let text = reactToText(node);
  if (text.trim()) return text.trim();

  /** https://github.com/lhansford/react-to-text/issues/332 */
  try {
    // @ts-expect-error not checking deep props
    text = reactToText(node.type.render(node.props));
  } catch (error) {
    //
  }
  if (text.trim()) return text.trim();

  return "";
};

/** find index of first element "in view". model behavior off of wikiwand.com. */
export const firstInView = (elements: HTMLElement[]) => {
  const offset = parseInt(
    window.getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  for (const element of elements.reverse())
    if (element.getBoundingClientRect()?.top < offset + 10) return element;
};

/** shrink width to wrapped text https://stackoverflow.com/questions/14596213 */
export const shrinkWrap = (element: HTMLElement | null) => {
  if (!element) return;
  const start = element.childNodes[0];
  /** radix ui tooltip puts two children at end that aren't part of text content */
  const end = [...element.childNodes].at(-3);
  if (!start || !end) return;
  const range = document.createRange();
  range.setStartBefore(start);
  range.setEndAfter(end);
  const { width } = range.getBoundingClientRect();
  element.style.width = width + "px";
  element.style.boxSizing = "content-box";
};
