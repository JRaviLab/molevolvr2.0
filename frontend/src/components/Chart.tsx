import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { createPortal } from "react-dom";
import { FaExpand } from "react-icons/fa6";
import clsx from "clsx";
import { useElementSize, useFullscreen } from "@reactuses/core";
import Button from "@/components/Button";
import Download from "@/components/Download";
import Flex from "@/components/Flex";
import { isSafari } from "@/util/browser";
import { getViewBoxFit } from "@/util/dom";
import type { Filename, Tabular } from "@/util/download";
import { useTextSize, useTheme } from "@/util/hooks";
import classes from "./Chart.module.css";

/** container padding */
const padding = 20;

type Props = {
  /** title text */
  title?: string;
  /** download filename */
  filename: Filename;
  /** full width */
  full?: boolean;

  /** csv/tsv data */
  tabular?: { data: Tabular; filename?: string }[];
  /** text string */
  text?: string;
  /** json data */
  json?: unknown;

  /** extra control groups */
  controls?: ReactNode[];

  /** svg content */
  children: ReactNode | ((props: ChildrenProps) => ReactNode);

  /** container click */
  onClick?: ComponentProps<"div">["onClick"];
};

export type ChildrenProps = {
  /** available width */
  width: number;
};

/** generic chart wrapper */
const Chart = ({
  title,
  filename,
  full,
  tabular,
  text,
  json,
  controls,
  children,
  onClick,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fitRef = useRef<SVGGElement>(null);
  const titleRef = useRef<SVGTextElement>(null);

  /** reactive CSS vars */
  const theme = useTheme();

  const { fontSize, truncateWidth } = useTextSize();

  const [containerWidth] = useElementSize(containerRef.current);
  const [parentWidth] = useElementSize(containerRef.current?.parentElement);

  /** available width */
  let width = full ? containerWidth : parentWidth;
  width -= 2 * padding - 1;
  /** ensure nominal width */
  width = Math.max(width, 10);

  useEffect(() => {
    if (!svgRef.current || !fitRef.current) return;

    /** ignore certain elements in fitting */
    const ignores =
      svgRef.current.querySelectorAll<SVGGraphicsElement>("[data-fit-ignore]");
    ignores.forEach((el) => (el.style.display = "none"));

    /** get bbox of contents */
    let { x, y, w, h } = getViewBoxFit(fitRef.current);

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
      titleRef.current.innerHTML = truncateWidth(
        title,
        Math.max(w, containerWidth),
      );
    }

    /** fit view to contents */
    svgRef.current.setAttribute("viewBox", [x, y, w, h].join(" "));
    /** make svg units match document */
    svgRef.current.style.width = w + "px";
    svgRef.current.style.height = h + "px";

    /** fix safari bug where dominant baseline does not inherit */
    if (isSafari) {
      for (const text of svgRef.current.querySelectorAll("text, tspan")) {
        const parent = text.closest("[dominant-baseline]");
        if (!parent) continue;
        const value = parent.getAttribute("dominant-baseline");
        if (!value) continue;
        if (text.getAttribute("dominant-baseline")) continue;
        text.setAttribute("dominant-baseline", value);
      }
    }
  });

  /** printing state */
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    (async () => {
      const appElement = document.getElementById("app")!;

      if (printing) {
        /** hide rest of app */
        appElement.style.display = "none";

        /** open print dialog */
        window.print();

        setPrinting(false);
      } else {
        /** re-show rest of app */
        appElement.style.display = "";
      }
    })();
  }, [printing]);

  /** fullscreen */
  const [, { toggleFullscreen }] = useFullscreen(containerRef);

  /** chart content */
  const chart = (
    <>
      {/* rely on component consumer handling keyboard appropriately */}
      {/* eslint-disable-next-line */}
      <div
        ref={containerRef}
        className={clsx(
          "card",
          classes.container,
          full && "full",
          printing && classes.printing,
        )}
        style={{ padding }}
        onClick={onClick}
        onDoubleClick={(event) => {
          /** reset resize */
          const target = event.currentTarget;
          target.style.width = "";
          target.style.height = "";
        }}
      >
        <svg ref={svgRef} className={classes.svg}>
          {/* title */}
          {title && (
            <text
              ref={titleRef}
              textAnchor="middle"
              dominantBaseline="hanging"
              fill={theme["--black"]}
              style={{ fontWeight: theme["--bold"] }}
            />
          )}

          <g ref={fitRef}>
            {typeof children === "function" ? children({ width }) : children}
          </g>
        </svg>
      </div>
    </>
  );

  /** if printing, only render chart */
  if (printing) return createPortal(chart, document.body);

  return (
    <Flex direction="column" gap="lg" full>
      {chart}

      {/* controls */}
      <Flex>
        {controls?.map((row, index) => (
          <Flex key={index} gap="sm">
            {row}
          </Flex>
        ))}

        <Flex gap="sm">
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
            print={chart}
            vector={svgRef}
            tabular={tabular}
            text={text}
            json={json}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Chart;
