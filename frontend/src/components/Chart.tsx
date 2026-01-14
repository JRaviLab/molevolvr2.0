import { useEffect, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import { FaBorderTopLeft, FaExpand, FaPrint } from "react-icons/fa6";
import clsx from "clsx";
import { clamp } from "lodash";
import { useDebounce, useElementSize, useFullscreen } from "@reactuses/core";
import Button from "@/components/Button";
import Download from "@/components/Download";
import Tooltip from "@/components/Tooltip";
import { isSafari } from "@/util/browser";
import { getViewBoxFit } from "@/util/dom";
import type { Filename, Tabular } from "@/util/download";
import { usePrint, useTextSize, useTheme } from "@/util/hooks";

type Props = {
  /** title text */
  title?: string;
  /** download filename */
  filename: Filename;

  /** csv/tsv data */
  tabular?: { data: Tabular; filename?: string }[];
  /** text string */
  text?: string;
  /** json data */
  json?: unknown;

  /** extra control groups */
  controls?: ReactNode[];

  /** svg content. use data-fit-ignore to ignore element from fit calc. */
  children: ReactNode | ((props: ChildrenProps) => ReactNode);

  /** container click */
  onClick?: ComponentProps<"div">["onClick"];

  containerProps?: ComponentProps<"div">;
  svgProps?: ComponentProps<"svg">;
};

export type ChildrenProps = {
  /** chart container width */
  width: number;
  /** available (usually page) width */
  parentWidth: number;
};

/** generic chart wrapper */
const Chart = ({
  title,
  filename,
  tabular,
  text,
  json,
  controls,
  children,
  onClick,
  containerProps: { className: containerClassName, ...containerProps } = {},
  svgProps = {},
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<SVGTextElement>(null);

  /** reactive CSS vars */
  const theme = useTheme();

  const { fontSize, truncateWidth } = useTextSize();

  /** sizes */
  let [width] = useElementSize(containerRef.current);
  let [parentWidth] = useElementSize(containerRef.current?.parentElement);

  /** avoid too-frequent layout changes and flashing scrollbar */
  width = useDebounce(width, 50);
  parentWidth = useDebounce(parentWidth, 50);

  /** limit width */
  width = clamp(width, 10, 10000);
  parentWidth = clamp(parentWidth, 10, 10000);

  /** after every render, "prepare" svg */
  useEffect(() => {
    if (!svgRef.current) return;

    /** ignore certain elements in fitting */
    const ignores =
      svgRef.current.querySelectorAll<SVGGraphicsElement>("[data-fit-ignore]");
    ignores.forEach((el) => (el.style.display = "none"));

    /** get bbox of contents */
    let { x, y, w, h } = getViewBoxFit(svgRef.current);

    /** restore fit ignore elements */
    ignores.forEach((el) => (el.style.display = ""));

    /** chart title */
    if (title && titleRef.current) {
      /** make room */
      const titleSpace = 3 * fontSize;
      y -= titleSpace;
      h += titleSpace;
      /** position */
      titleRef.current.setAttribute("y", String(y));
      titleRef.current.setAttribute("x", String(x + w / 2));
      /** content */
      titleRef.current.innerHTML = truncateWidth(title, Math.max(w, width));
    }

    /** debug view box */
    // const debug =
    //   svgRef.current.querySelector<SVGRectElement>("." + classes.debug!) ||
    //   document.createElementNS("http://www.w3.org/2000/svg", "rect");
    // debug.classList.add(classes.debug!);
    // debug.setAttribute("x", String(x));
    // debug.setAttribute("y", String(y));
    // debug.setAttribute("width", String(w));
    // debug.setAttribute("height", String(h));
    // svgRef.current.insertBefore(debug, svgRef.current.firstChild!);

    /** fit view to contents */
    svgRef.current.setAttribute("viewBox", [x, y, w, h].join(" "));
    /** make svg units match document */
    svgRef.current.style.width = w + "px";
    svgRef.current.style.height = h + "px";

    /** fix safari bug where dominant baseline does not inherit */
    if (isSafari) {
      for (const text of svgRef.current.querySelectorAll(
        "text, tspan, textPath",
      )) {
        const parent = text.closest("[dominant-baseline]");
        if (!parent) continue;
        const value = parent.getAttribute("dominant-baseline");
        if (!value) continue;
        if (text.getAttribute("dominant-baseline")) continue;
        text.setAttribute("dominant-baseline", value);
      }
    }
  });

  /** fullscreen */
  const [, { toggleFullscreen }] = useFullscreen(containerRef);

  const { printing, print } = usePrint(filename);

  /** chart content */
  const chart = (
    // rely on component consumer handling keyboard appropriately
    // eslint-disable-next-line
    <div
      ref={containerRef}
      className={clsx(
        "relative grid max-w-full resize place-items-center overflow-auto p-4 [&:is([style*='width'],[style*='height'])>.reset-handle]:grid",
        printing
          ? "aspect-auto h-screen max-h-none min-h-0 w-auto max-w-none min-w-0 resize-none overflow-visible rounded-none border-0 bg-white p-0 shadow-none"
          : "card",
        containerClassName,
      )}
      // https://github.com/dequelabs/axe-core/issues/4566
      // eslint-disable-next-line
      tabIndex={0}
      onClick={onClick}
      {...containerProps}
    >
      <svg ref={svgRef} dominantBaseline="central" {...svgProps}>
        {/* title */}
        {title && (
          <text
            ref={titleRef}
            textAnchor="middle"
            dominantBaseline="hanging"
            fill={theme["--black"]}
            style={{ fontWeight: theme["--bold"] }}
            data-fit-ignore
          />
        )}

        {typeof children === "function"
          ? children({ width, parentWidth })
          : children}
      </svg>

      {/* reset handle */}
      <div className="reset-handle sticky right-2 bottom-2 hidden size-0 place-self-end">
        <Tooltip content="Reset size">
          <button
            className="size-4"
            onClick={() => {
              /** reset resize */
              const target = containerRef.current;
              if (!target) return;
              target.style.width = String(containerProps.style?.width ?? "");
              target.style.height = "";
            }}
          >
            <FaBorderTopLeft />
          </button>
        </Tooltip>
      </div>
    </div>
  );

  if (printing) return createPortal(chart, document.body);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {chart}

      {/* controls */}
      <div className="flex flex-col gap-4">
        {controls?.map((row, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {row}
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* fullscreen */}
          <Button
            icon={<FaExpand />}
            design="hollow"
            tooltip="Full screen"
            onClick={toggleFullscreen}
          />

          {/* download */}
          <Download
            filename={filename}
            raster={containerRef}
            vector={svgRef}
            tabular={tabular}
            text={text}
            json={json}
          >
            <Button
              icon={<FaPrint />}
              text="PDF"
              onClick={print}
              tooltip="Print as pdf"
            />
          </Download>
        </div>
      </div>
    </div>
  );
};

export default Chart;
