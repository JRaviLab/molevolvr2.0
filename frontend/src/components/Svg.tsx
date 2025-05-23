import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { clamp } from "lodash";
import { useElementSize } from "@reactuses/core";
import { getSvgTransform, getViewBoxFit } from "@/util/dom";
import { rootFontSize } from "@/util/hooks";

type Props = {
  children: ReactNode;
} & ComponentProps<"svg">;

/**
 * wrapper to make writing svgs easier
 *
 * - coordinates should 1:1 match dom px (unless svg has to shrink to fix inside
 *   available space)
 * - except for text, size should always match document font size
 * - viewbox should always fit to content, so no clipping
 * - should never exceed container size or content size
 * - when container has no specified size, should expand up to content size or max
 *   container size
 * - size should maintain aspect ratio of content
 * - should never result in infinite/multiple renders
 * - text should be automatically truncated if it exceeds its specified width?
 */

const Svg = ({ children, ...props }: Props) => {
  const ref = useRef<SVGSVGElement>(null);
  console.log("render");

  const [width, height] = useElementSize(ref);

  useEffect(() => {
    for (let i = 0; i < 10; i++) {
      updateFontSize(ref.current);
      if (updateViewBox(ref.current)) break;
    }
  }, [width, height, children]);

  return (
    <svg ref={ref} {...props}>
      {children}
    </svg>
  );
};

export default Svg;

const updateFontSize = (svg: SVGSVGElement | null) => {
  if (!svg) return;
  let scale = getSvgTransform(svg).h;
  scale = clamp(scale, 1, 3);
  const fontSize = rootFontSize() * scale;
  svg.style.fontSize = fontSize + "px";
};

const updateViewBox = (svg: SVGSVGElement | null) => {
  if (!svg) return;
  const current = svg.getAttribute("viewBox")?.split(" ").map(Number);
  const view = getViewBoxFit(svg);
  const _new = [view.x, view.y, view.w, view.h];
  if (current?.every((c, i) => Math.abs(c - _new[i]!) < 0.00001)) return true;
  svg.setAttribute("viewBox", _new.join(" "));
  svg.style.width = view.w + "px";
  svg.style.aspectRatio = `${view.w} / ${view.h}`;
  svg.style.maxWidth = `min(${view.w}px, 100%)`;
  svg.style.maxHeight = `min(${view.h}px, 100%)`;
};
