import { useCallback, useLayoutEffect, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import { clamp } from "lodash";
import { useElementSize, useEventListener } from "@reactuses/core";
import { getSvgTransform, getViewBoxFit } from "@/util/dom";
import { rootFontSize } from "@/util/hooks";

type Props = {
  children: ReactNode | (({ fontSize }: { fontSize: number }) => ReactNode);
} & ComponentProps<"svg">;

/**
 * wrapper to make writing SVGs easier
 *
 * - unitless coordinates should 1:1 match dom px (unless svg has to shrink to fix
 *   inside available space)
 * - should provide a way to size/position text/other elements to match document
 *   root font size, e.g. 1em
 * - view box should always fit to content, to ensure no clipping
 * - should never exceed document container size or svg content size
 * - when container has no specified size, should expand up to content size or max
 *   container size
 * - size should maintain aspect ratio of content
 * - should never result in infinite/multiple renders
 * - text should be automatically truncated if it exceeds its specified width?
 */
const Svg = ({ children, ...props }: Props) => {
  const ref = useRef<SVGSVGElement>(null);

  /** document size of svg */
  const [width, height] = useElementSize(ref);

  /** did sizing just update */
  const justUpdated = useRef(false);

  /** update sizing */
  const update = useCallback(() => {
    /** if just ran, don't run again (hard protection against infinite loop) */
    if (justUpdated.current) justUpdated.current = false;
    else {
      justUpdated.current = true;
      /** iteratively update, which should converge to stable values */
      for (let i = 0; i < 100; i++) {
        updateFontSize(ref.current);
        if (updateViewBox(ref.current))
          /** if already converged closely, stop iterating */
          break;
      }
    }
  }, []);

  /** when contents or document size of svg change */
  useLayoutEffect(() => {
    update();
  }, [update, width, height, children]);

  /** when document fonts done loading */
  useEventListener("loadingdone", update, document.fonts);

  return (
    <svg ref={ref} {...props}>
      {children}
    </svg>
  );
};

export default Svg;

/** set font size of root svg element to match document font size */
const updateFontSize = (svg: SVGSVGElement | null) => {
  if (!svg) return 16;
  let scale = getSvgTransform(svg).h;
  /** prevent extreme scales */
  scale = clamp(scale, 1, 10);
  const fontSize = rootFontSize() * scale;
  svg.style.fontSize = fontSize + "px";
  return fontSize;
};

/** update view box attr of root svg element */
const updateViewBox = (svg: SVGSVGElement | null) => {
  if (!svg) return;
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
