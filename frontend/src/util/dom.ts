import { cloneElement, type ReactElement, type ReactNode } from "react";
import { deepMap, onlyText } from "react-children-utilities";
import { debounce, truncate } from "lodash";
import { sleep } from "@/util/misc";

/** get document root styles */
const getRootStyles = () => window.getComputedStyle(document.documentElement);

/** document root styles */
let rootStyles = getRootStyles();

/** document root font size */
export let rootFontSize = 16;
export let rootFontFamily = "";

/** update root styles values */
export const updateRootStyles = () => {
  rootStyles = getRootStyles();
  rootFontSize = parseFloat(rootStyles.fontSize);
  rootFontFamily = rootStyles.fontFamily;
};

/** update root styles on certain events */
window.addEventListener("load", updateRootStyles);
window.document.fonts.addEventListener("loadingdone", updateRootStyles);

/** https://stackoverflow.com/a/78994961/2180570 */
export const getTheme = () =>
  Object.fromEntries(
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
      .map((variable) => [variable, rootStyles.getPropertyValue(variable)]),
  );

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

/** https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn */
let isSmoothScrolling = false;

/** scroll to element, optionally by selector */
export const scrollTo = async (
  selector?: string | Element | null,
  options: ScrollIntoViewOptions = { behavior: "smooth" },
) => {
  /** don't interfere with smooth scroll bug */
  if (isSmoothScrolling) return;

  /** wait for element to appear */
  const element =
    typeof selector === "string" ? await waitFor(selector) : selector;
  if (!element) return;

  /** wait for layout shifts */
  await sleep(100);

  /** scroll to element */
  element.scrollIntoView(options);

  if (options.behavior === "smooth") {
    /** set smooth scrolling flag */
    isSmoothScrolling = true;

    /** unset smooth scrolling flag once done */
    const unset = debounce(() => {
      isSmoothScrolling = false;
      window.removeEventListener("scroll", unset, true);
    }, 100);
    window.addEventListener("scroll", unset, true);
  }
};

/** get text content of react node */
export const renderText = (node: ReactNode) =>
  onlyText(
    deepMap(node, (child) =>
      /** check react fiber structure */
      typeof child === "object" &&
      child !== null &&
      "type" in child &&
      child.type &&
      typeof child.props === "object" &&
      child.props !== null &&
      "children" in child.props &&
      typeof child.props.children === "string"
        ? cloneElement(child as ReactElement<{ children: string }>, {
            ...child.props,
            /**
             * if children is string, add padding on either side to separate
             * elements
             */
            children: ` ${child.props.children} `,
          })
        : child,
    ),
  )
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
  for (const element of elements.reverse())
    if (element.getBoundingClientRect()?.top < offset + 10) return element;
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

/** fit view box to contents of svg */
export const fitViewBox = (svg?: SVGSVGElement | null) => {
  if (!svg) return { x: 0, y: 0, width: 100, height: 100 };
  const { x, y, width, height } = svg.getBBox();
  const viewBox = [x, y, width, height].join(" ");
  svg.setAttribute("viewBox", viewBox);
  return { x, y, width, height };
};
/** open browser print dialog with just one element shown */
export const printElement = async (element: Element) => {
  /** remember scroll position */
  const oldScroll = element.getBoundingClientRect().top;
  /** make element fullscreen/print ready */
  element.classList.add("print-element");
  /** wait for any layout shift */
  await sleep(100);
  /** trigger print dialog */
  window.print();
  /** restore element styles */
  element.classList.remove("print-element");
  /** restore scroll */
  await sleep(100);
  const newScroll = element.getBoundingClientRect().top;
  window.scrollBy({ top: newScroll - oldScroll, behavior: "instant" });
};

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
export const getTextWidth = (
  text: string,
  size = rootFontSize,
  family = rootFontFamily,
) => {
  ctx.font = `${size}px ${family}`;
  return ctx.measureText(text).width;
};

/** truncate text based on actual rendered width */
export const truncateWidth = (text: string, limit: number, size?: number) => {
  /** reduce string length until text width under width limit */
  for (let slice = text.length; slice > 0; slice--) {
    const truncated = truncate(text, { length: slice });
    /**
     * can't use getComputedTextLength w/ svgs because, for textPath, too slow
     * on chrome, and ff returns length clipped to path.
     */
    const length = getTextWidth(truncated, size);
    if (length <= limit) return truncated;
  }

  return text;
};
