import {
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useElementSize } from "@reactuses/core";
import { getSvgTransform, getViewBoxFit } from "@/util/dom";
import { rootFontSize } from "@/util/hooks";
import { sleep } from "@/util/misc";

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
 * - text should be automatically truncated if it exceeds its specified width
 * - should never result in infinite/multiple renders
 */

const Svg = ({ children, ...props }: Props) => {
  const ref = useRef<SVGSVGElement>(null);
  console.log("render");

  let [width, height] = useElementSize(ref);
  width = Math.round(width);
  height = Math.round(height);

  useLayoutEffect(() => {
    (async () => {
      updateFontSize(ref.current);
      await sleep();
      updateViewBox(ref.current);
    })();
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
  const fontSize = rootFontSize() * getSvgTransform(svg).h;
  svg.style.fontSize = fontSize + "px";
};

const updateViewBox = (svg: SVGSVGElement | null) => {
  if (!svg) return;
  const view = getViewBoxFit(svg);
  svg.setAttribute("viewBox", [view.x, view.y, view.w, view.h].join(" "));
  svg.style.width = view.w + "px";
  svg.style.aspectRatio = `${view.w} / ${view.h}`;
  svg.style.maxWidth = `min(${view.w}px, 100%)`;
  svg.style.maxHeight = `min(${view.h}px, 100%)`;
};
