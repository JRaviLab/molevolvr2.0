import { useCallback, useLayoutEffect, useRef } from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { clamp, truncate } from "lodash";
import { useElementSize, useEventListener } from "@reactuses/core";
import { getSvgTransform, getTextWidth, getViewBoxFit } from "@/util/dom";
import { rootFontSize } from "@/util/hooks";

type Props = {
  ref?: RefObject<SVGSVGElement | null>;
  children: ReactNode;
} & ComponentProps<"svg">;

/**
 * wrapper to make writing SVGs easier
 *
 * - should never exceed document container size or svg content size
 * - when container has no specified size, should expand up to content size or max
 *   container size
 * - size should maintain aspect ratio of content
 * - view box should always fit to content, to ensure no clipping
 * - unitless coordinates should 1:1 match dom px (unless svg has to shrink to fix
 *   inside available space)
 * - text size should match document font size (except at extreme scales)
 * - text should be automatically truncated if it exceeds its specified width
 * - should never result in infinite/many renders
 */
const Svg = ({ ref: _ref, children, ...props }: Props) => {
  /** internal ref */
  const ref = useRef<SVGSVGElement>(null);
  /** external ref */
  if (_ref?.current) ref.current = _ref.current;

  /** document size of svg */
  const [width, height] = useElementSize(ref);

  /** did sizing just update */
  const justUpdated = useRef(0);

  /** when children change */
  useLayoutEffect(() => {
    if (!ref.current) return;
    rememberText(ref.current);
  }, [ref, children]);

  /** update sizing */
  const update = useCallback(() => {
    if (!ref.current) return;
    /** if just ran, don't run again (hard protection against infinite loop) */
    if (justUpdated.current) return;

    /** iteratively update, which should converge to stable values */
    for (let i = 0; i < 100; i++) {
      const fontSize = updateFontSize(ref.current);
      truncateText(ref.current, fontSize);
      if (updateViewBox(ref.current))
        /** if already converged closely, stop iterating */
        break;
    }

    /** prevent consecutive synchronous updates */
    window.clearTimeout(justUpdated.current);
    justUpdated.current = window.setTimeout(() => (justUpdated.current = 0), 0);
  }, [ref]);

  /** when contents or document size of svg change */
  useLayoutEffect(() => {
    update();
  }, [update, width, height, children]);

  /** when document fonts done loading */
  useEventListener("loadingdone", update, document.fonts);

  return (
    <svg ref={ref} {...props} style={{ overflow: "visible" }}>
      {children}
    </svg>
  );
};

export default Svg;

/** set font size of root svg element to match document font size */
const updateFontSize = (svg: SVGSVGElement) => {
  let scale = getSvgTransform(svg).h;
  /** prevent extreme scales */
  scale = clamp(scale, 1, 10);
  const fontSize = rootFontSize() * scale;
  svg.style.fontSize = fontSize + "px";
  return fontSize;
};

/** update view box attr of root svg element */
const updateViewBox = (svg: SVGSVGElement) => {
  /** get current view box */
  const current = svg.getAttribute("viewBox")?.split(" ").map(Number);
  /** get view box fitted to svg contents */
  const bbox = getViewBoxFit(svg);
  const fitted = Object.values(bbox);
  /** if current view box already close to fitted view box, don't change */
  if (current?.every((c, i) => Math.abs(c - fitted[i]!) < 1)) return true;
  /** set fitted view box */
  svg.setAttribute("viewBox", fitted.join(" "));
  /** set dom sizing styles to match view box */
  svg.style.width = bbox.w + "px";
  svg.style.aspectRatio = `${bbox.w} / ${bbox.h}`;
  svg.style.maxWidth = `min(${bbox.w}px, 100%)`;
  svg.style.maxHeight = `min(${bbox.h}px, 100%)`;
};

/** get text children of svg */
const getTextElements = (svg: SVGSVGElement) =>
  [
    ...(svg.querySelectorAll<
      SVGTextElement | SVGTSpanElement | SVGTextPathElement
    >("text, tspan, textPath") ?? []),
  ].filter(
    (element) =>
      /** only truncate if element has text child node (no element children) */
      !element.children.length,
  );

/** remember full text of svg text elements */
const rememberText = (svg: SVGSVGElement) => {
  for (const element of getTextElements(svg))
    element.setAttribute("data-text", element.textContent ?? "");
};

/** truncate text content of svg text elements */
const truncateText = (svg: SVGSVGElement, fontSize: number) => {
  for (const element of getTextElements(svg)) {
    /** get original full text from data attribute */
    const text = element.getAttribute("data-text") ?? "";
    /** reset text content to be possibly limited again */
    element.textContent = text;

    /** text length limit */
    let limit = 0;

    /** get limit from text path length */
    const href = element.getAttribute("href");
    if (element instanceof SVGTextPathElement && href)
      limit =
        document.querySelector<SVGPathElement>(href)?.getTotalLength() || 0;

    /** get limit from width attr */
    const width = Number(element.getAttribute("width"));
    if (width) limit = width;

    if (!limit) continue;

    /** reduce string length until text width under width limit */
    for (let slice = text.length; slice > 0; slice--) {
      /** truncated string */
      const truncated = truncate(text, { length: slice });
      /**
       * get text length. can't use getComputedTextLength b/c, for textPath, too
       * slow on chrome, and ff returns length clipped to path.
       */
      const length = getTextWidth(truncated, fontSize);
      if (length < limit) {
        /** truncate text */
        element.textContent = truncated;
        break;
      }
    }
  }
};
