import type { ReactNode } from "react";
import { deepMap, onlyText } from "react-children-utilities";
import { sleep, waitFor } from "@/util/misc";

/** https://stackoverflow.com/a/78994961/2180570 */
export const getTheme = () => {
  const styles = window.getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Array.from(document.styleSheets)
      .flatMap((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules);
        } catch (error) {
          return [];
        }
      })
      .filter((cssRule) => cssRule instanceof CSSStyleRule)
      .flatMap((cssRule) => Array.from(cssRule.style))
      .filter((style) => style.startsWith("--"))
      .map((variable) => [variable, styles.getPropertyValue(variable)]),
  );
};

/** scroll to element, optionally by selector */
export const scrollTo = async (
  selector?: string | Element | null,
  options: ScrollIntoViewOptions = { behavior: "smooth" },
) => {
  if (!selector) return;

  /** wait for element to appear */
  const element =
    typeof selector === "string"
      ? await waitFor(() => document.querySelector(selector))
      : selector;
  if (!element) return;

  /** scroll to element */
  elementOrSection(element).scrollIntoView(options);
};

/** get text content of react node */
export const renderText = (node: ReactNode) =>
  /** map all children to text */
  deepMap(node, (node) => ` ${onlyText(node)} `)
    .join("")
    /** collapse spaces */
    .replaceAll(/\s+/g, " ")
    .trim();
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
 * this function in situ becomes much more of pain).
 */

/** find index of first element "in view". model behavior off of wikiwand.com. */
export const firstInView = (elements: HTMLElement[]) => {
  const offset = parseInt(
    window.getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  for (let index = elements.length - 1; index >= 0; index--)
    if (
      elementOrSection(elements[index]!).getBoundingClientRect()?.top <
      offset + 5
    )
      return index;

  return 0;
};
/** shrink width to wrapped text https://stackoverflow.com/questions/14596213 */
export const shrinkWrap = (
  element: HTMLElement | null,
  startChild = 0,
  endChild = -1,
) => {
  if (!element) return;
  const start = [...element.childNodes].at(startChild);
  const end = [...element.childNodes].at(endChild);
  if (!start || !end) return;
  element.style.width = "";
  const range = document.createRange();
  range.setStartBefore(start);
  range.setEndAfter(end);
  const style = window.getComputedStyle(element);
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const { width } = range.getBoundingClientRect();
  element.style.width = width + paddingLeft + paddingRight + "px";
};

/**
 * is element covering anything "important" (above anything besides a
 * "background" element)
 */
export const isCovering = (
  element: HTMLElement | undefined | null,
  background = "section",
) => {
  if (!element) return;

  /** don't consider covering if user interacting with element */
  if (element.matches(":hover, :focus-within")) return;

  /** density of points to check */
  const gap = 20;

  const { left, top, width, height } = element.getBoundingClientRect() ?? {};

  /** check a grid of points under element */
  for (let x = left + gap; x < width - gap; x += gap) {
    for (let y = top + gap; y < height - gap; y += gap) {
      const covering = document
        /** get elements under point */
        .elementsFromPoint(x, y)
        /** only count elements "under" this one */
        .filter((el) => el !== element && !element.contains(el))
        /** top-most */
        .shift();

      /** is "important" element */
      if (!covering?.matches(background)) return covering;
    }
  }

  return false;
};

/** get svg scale factor */
export const getSvgTransform = (svg: SVGSVGElement) => {
  /** convert to svg coords */
  const matrix = (svg.getScreenCTM() || new SVGMatrix()).inverse();
  /** https://www.w3.org/TR/css-transforms-1/#decomposing-a-2d-matrix */
  return {
    w: Math.sqrt(matrix.a ** 2 + matrix.b ** 2),
    h: Math.sqrt(matrix.c ** 2 + matrix.d ** 2),
  };
};

/** get bounding box of svg contents */
export const getViewBoxFit = (svg: SVGGraphicsElement) => {
  const { x, y, width, height } = svg.getBBox();
  return { x, y, w: width, h: height };
};

export type ViewBox = ReturnType<typeof getViewBoxFit>;

/** scroll page so that mouse stays at same position in document */
export const preserveScroll = async (element: Element) => {
  const oldY = element.getBoundingClientRect().top;
  await sleep(0);
  const newY = element.getBoundingClientRect().top;
  window.scrollBy({ top: newY - oldY, behavior: "instant" });
};

/** objects for text measurement */
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

/**
 * compute actual rendered width of text based on font size
 * https://stackoverflow.com/a/72148318/2180570
 */
export const getWidth = (text: string, size: number, family: string) => {
  ctx.font = `${size}px ${family}`;
  return ctx.measureText(text).width;
};

/** truncate text based on actual rendered width */
export const truncateWidth = (
  text: string,
  limit: number,
  size: number,
  family: string,
) => {
  /** ensure nominal width */
  limit = Math.max(limit, getWidth("...", size, family) + 1);
  /** reduce string length until text width under width limit */
  for (let slice = text.length; slice >= 0; slice--) {
    const truncated = text.slice(0, slice) + (slice < text.length ? "..." : "");
    const length = getWidth(truncated, size, family);
    if (length <= limit) return truncated;
  }
  return "...";
};

/** get coordinates of element relative to document */
export const getDocBbox = (element: Element) => {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return {
    top: top + window.scrollY,
    bottom: bottom + window.scrollY,
    left: left + window.scrollX,
    right: right + window.scrollX,
  };
};

/** glow element */
export const glow = (element: Element) =>
  elementOrSection(element).animate(
    [
      { boxShadow: "inset 0 0 40px var(--accent)", offset: 0 },
      { boxShadow: "inset 0 0 40px transparent", offset: 1 },
    ],
    { duration: 2000 },
  );

/** if element is first child of section, change element to section itself */
export const elementOrSection = <El extends Element>(element: El) => {
  const parent = element.parentElement;
  return parent && element.matches("section > :first-child")
    ? (parent as HTMLElement)
    : element;
};
