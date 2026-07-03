import type { ComponentProps, ReactNode } from "react";
import type { Filename, Tabular } from "@/util/download";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDebounce, useElementSize, useFullscreen } from "@reactuses/core";
import { clamp } from "lodash";
import { Maximize, Printer } from "lucide-react";
import Button from "@/components/Button";
import Download from "@/components/Download";
import Frame from "@/components/Frame";
import { isSafari } from "@/util/browser";
import { getViewBoxFit } from "@/util/dom";
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

  /** props on svg */
  svgProps?: ComponentProps<"svg">;
} & Omit<ComponentProps<typeof Frame>, "children">;

type ChildrenProps = {
  /** chart container width */
  width: number;
  /** available (usually page) width */
  parentWidth: number;
};

/** generic chart wrapper */
export default function Chart({
  title,
  filename,
  tabular,
  text,
  json,
  controls = [[]],
  children,
  svgProps = {},
  ...props
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<SVGTextElement>(null);

  const theme = useTheme();

  const { fontSize, truncateWidth } = useTextSize();

  /** sizes */
  let [width] = useElementSize(containerRef);
  let [parentWidth] = useElementSize(() => containerRef.current?.parentElement);

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
    ignores.forEach((element) => (element.style.display = "none"));

    /** get bbox of contents */
    let { x, y, w, h } = getViewBoxFit(svgRef.current);

    /** restore fit ignore elements */
    ignores.forEach((element) => (element.style.display = ""));

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

  const { printing, print } = usePrint();

  /** chart content */
  const chart = (
    <Frame ref={containerRef} {...props}>
      <svg ref={svgRef} dominantBaseline="central" {...svgProps}>
        {/* title */}
        {title && (
          <text
            ref={titleRef}
            textAnchor="middle"
            dominantBaseline="hanging"
            fill={theme["--color-black"]}
            style={{ fontWeight: theme["--bold"] }}
            data-fit-ignore
          />
        )}

        {typeof children === "function"
          ? children({ width, parentWidth })
          : children}
      </svg>
    </Frame>
  );

  if (printing) return createPortal(chart, document.body);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {chart}

      {/* controls */}
      <div className="controls">
        {controls?.map((row, index) => (
          <div key={index}>{row}</div>
        ))}

        <div className="gap-2">
          {/* download */}
          <Download
            filename={filename}
            raster={containerRef}
            vector={svgRef}
            tabular={tabular}
            text={text}
            json={json}
          >
            <Button tooltip="Print as pdf" onClick={() => print(filename)}>
              <Printer />
              PDF
            </Button>
          </Download>

          {/* fullscreen */}
          <Button
            design="hollow"
            tooltip="Full screen"
            onClick={toggleFullscreen}
          >
            <Maximize />
          </Button>
        </div>
      </div>
    </div>
  );
}
