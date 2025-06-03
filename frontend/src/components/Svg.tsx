import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { flushSync } from "react-dom";
import clsx from "clsx";
import { clamp, zip } from "lodash";
import { useElementSize, useEventListener } from "@reactuses/core";
import {
  getSvgTransform,
  getViewBoxFit,
  truncateWidth,
  type ViewBox,
} from "@/util/dom";
import { rootFontSize } from "@/util/hooks";
import { sleep } from "@/util/misc";
import classes from "./Svg.module.css";

type Props = {
  ref?: RefObject<SVGSVGElement | null>;
  /** class on svg */
  className?: string;
  /**
   * svg contents. use class "fit-ignore" on element to ignore in fitting calc,
   * e.g. for things like clip-path that don't work with getBBox.
   */
  children: ReactNode;
} & Omit<ComponentProps<"svg">, "children">;

const SVGContext = createContext({ fontSize: 16 });

/**
 * wrapper to make writing SVGs easier. goals:
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
 * - should provide a way to ignore certain elements in bbox fitting calc
 * - should never result in infinite/many renders
 */
const Svg = ({ ref: _ref, className, children, ...props }: Props) => {
  /** internal ref */
  const ref = useRef<SVGSVGElement>(null);
  /** external ref */
  if (_ref?.current) ref.current = _ref.current;

  /** document size of svg */
  const [width, height] = useElementSize(ref);

  /** scale factor to transform document units to svg units */
  const [scale, setScale] = useState<ReturnType<typeof getSvgTransform>>({
    w: 1,
    h: 1,
  });

  /** prevent extreme scales */
  scale.w = clamp(scale.w, 0.1, 10);
  scale.h = clamp(scale.h, 0.1, 10);

  /** scale font to match document */
  const fontSize = rootFontSize() * scale.h;

  /** view box, fitted to content */
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });

  /** did update just run */
  const justUpdated = useRef(0);

  const update = useCallback(() => {
    if (!ref.current) return;

    /** if just ran, don't run again (hard protection against infinite loop) */
    if (justUpdated.current) return;

    /**
     * temporarily hide elements that we don't wish to include in bbox calc
     * https://stackoverflow.com/questions/10430518/getting-a-display-bounding-box-for-a-clipped-object/79644309#79644309
     */
    ref.current.classList.add(classes.fitting!);

    /** re-render component and children immediately based on state changes */
    flushSync(() => {
      if (!ref.current) return;

      /** fitted view box from previous iteration */
      let prevViewBox: ViewBox | Record<string, never> = {};

      /** iteratively fit & scale, which should converge to stable values */
      for (let i = 0; i < 3; i++) {
        /** get view box fitted to content */
        const viewBox = getViewBoxFit(ref.current);

        /** if converged closely, stop iterating */
        if (
          zip(Object.values(viewBox), Object.values(prevViewBox)).every(
            ([a = Infinity, b = Infinity]) => Math.abs(b - a) < 1,
          )
        )
          break;

        /** update view box */
        setViewBox(viewBox);
        /** update scale factor */
        setScale(getSvgTransform(ref.current));

        prevViewBox = viewBox;
      }
    });

    /** re-show hidden elements */
    ref.current.classList.remove(classes.fitting!);

    /** prevent consecutive synchronous updates */
    window.clearTimeout(justUpdated.current);
    justUpdated.current = window.setTimeout(() => (justUpdated.current = 0), 0);
  }, [ref]);

  /** when contents or document size of svg change */
  useLayoutEffect(() => {
    sleep().then(update);
  }, [update, width, height, children]);

  /** when document done loading */
  useEventListener("load", update, window);
  /** when fonts done loading */
  useEventListener("loadingdone", update, document.fonts);

  return (
    <>
      <SVGContext.Provider value={{ fontSize }}>
        <svg
          ref={ref}
          viewBox={Object.values(viewBox).join(" ")}
          className={clsx(classes.svg, className)}
          style={{
            /** ensure proper sizing based on content */
            width: viewBox.w + "px",
            aspectRatio: `${viewBox.w} / ${viewBox.h}`,
            maxWidth: `min(${viewBox.w}px, 100%)`,
            maxHeight: `min(${viewBox.h}px, 100%)`,

            fontSize,
          }}
          {...props}
        >
          {children}
        </svg>
      </SVGContext.Provider>

      {/* debug */}
      {/* <pre>
        {JSON.stringify({ width, height, viewBox, scale, fontSize }, null, 2)}
      </pre> */}
    </>
  );
};

export default Svg;

type TruncateProps = {
  children: string;
} & (
  | ({ tag: "text"; width: number } & ComponentProps<"text">)
  | ({ tag: "textPath"; href: string } & ComponentProps<"textPath">)
);

/** automatically truncate text */
export const Truncate = ({
  tag: Tag,
  width,
  href,
  children,
  ...props
}: TruncateProps) => {
  /** width limit */
  const [limit, setLimit] = useState(Infinity);

  /** font size from parent svg */
  const { fontSize } = useContext(SVGContext);

  useLayoutEffect(() => {
    /** get limit from text path length */
    if (href) {
      setLimit(
        document.querySelector<SVGPathElement>(href)?.getTotalLength() ||
          Infinity,
      );
      return;
    }

    /** get limit from width attr */
    const _width = Number(width);
    if (_width) {
      setLimit(_width);
      return;
    }
  }, [width, href]);

  children = truncateWidth(children, fontSize, limit);

  return (
    // @ts-expect-error ts not smart enough here
    <Tag {...props} href={href}>
      {children}
    </Tag>
  );
};
