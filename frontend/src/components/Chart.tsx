import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
  FaTableCellsLarge,
} from "react-icons/fa6";
import { PiBracketsCurlyBold } from "react-icons/pi";
import { TbPrompt } from "react-icons/tb";
import clsx from "clsx";
import type { Promisable } from "type-fest";
import { useElementSize } from "@reactuses/core";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import { root } from "@/main";
import { getViewBoxFit, rootFontSize } from "@/util/dom";
import {
  downloadCsv,
  downloadJpg,
  downloadJson,
  downloadPng,
  downloadSvg,
  downloadTsv,
  downloadTxt,
  type Filename,
  type Tabular,
} from "@/util/download";
import classes from "./Chart.module.css";

type Props = {
  /** download filename */
  filename: Filename;

  /** code to run before and after raster download */
  rasterEffect?: () => Promisable<() => Promisable<void>>;
  /** code to run before and after print */
  printEffect?: () => Promisable<() => Promisable<void>>;
  /** csv/tsv data */
  tabular?: { data: Tabular; filename?: string }[];
  /** text string */
  text?: string;
  /** json data */
  json?: unknown;

  /** extra control groups */
  controls?: ReactNode[];

  /** svg content */
  children: ReactNode;
};

const defaultContext = {
  svgRef: { current: null } as RefObject<SVGSVGElement | null>,
  width: 100,
  fontSize: 16,
};

/** context passed to children */
export const ChartContext = createContext(defaultContext);

/** container padding */
const padding = 20;

/** generic chart wrapper */
const Chart = ({
  filename,
  rasterEffect,
  printEffect,
  tabular,
  text,
  json,
  controls,
  children,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  /** available width */
  const [containerWidth] = useElementSize(containerRef.current);
  const [parentWidth] = useElementSize(containerRef.current?.parentElement);

  /** prevent scrollbar flashing */
  const width =
    Math.min(parentWidth || containerWidth, window.innerWidth) -
    2 * padding -
    1;

  /** document font size */
  const fontSize = rootFontSize();

  /** context passed to children */
  const contextValue: typeof defaultContext = {
    svgRef,
    width,
    fontSize,
  };

  useEffect(() => {
    if (!svgRef.current) return;

    /** get bbox of contents */
    const { x, y, w, h } = getViewBoxFit(svgRef.current);
    /** fit view to contents */
    svgRef.current.setAttribute("viewBox", [x, y, w, h].join(" "));
    /** make svg units match document */
    svgRef.current.style.width = w + "px";
    svgRef.current.style.height = h + "px";
  });

  /** printing state */
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    (async () => {
      if (printing) {
        /** hide rest of app */
        root.style.display = "none";

        const post = await printEffect?.();

        /** open print dialog */
        window.print();

        /** cleanup */
        setPrinting(false);
        await post?.();
      } else root.style.display = "";
    })();
  }, [printing, printEffect]);

  /** chart content */
  const chart = (
    <div
      ref={containerRef}
      className={clsx("card", classes.container, printing && classes.printing)}
      style={{ padding }}
    >
      <ChartContext.Provider value={contextValue}>
        <svg ref={svgRef} className={classes.svg}>
          {children}
        </svg>
      </ChartContext.Provider>
    </div>
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
          {/* download */}
          <Popover
            content={
              <Flex direction="column" hAlign="stretch" gap="sm">
                <Button
                  icon={<FaRegImage />}
                  text="PNG"
                  onClick={async () => {
                    if (!containerRef.current) return;
                    const post = await rasterEffect?.();
                    downloadPng(containerRef.current, filename);
                    await post?.();
                  }}
                  tooltip="High-resolution image"
                />
                <Button
                  icon={<FaRegImage />}
                  text="JPEG"
                  onClick={async () => {
                    if (!containerRef.current) return;
                    const post = await rasterEffect?.();
                    downloadJpg(containerRef.current, filename);
                    await post?.();
                  }}
                  tooltip="Compressed image"
                />
                <Button
                  icon={<FaBezierCurve />}
                  text="SVG"
                  onClick={() => {
                    if (!svgRef.current) return;
                    downloadSvg(svgRef.current, filename);
                  }}
                  tooltip="Vector image"
                />
                <Button
                  icon={<FaFilePdf />}
                  text="PDF"
                  onClick={async () => {
                    if (!containerRef.current) return;
                    setPrinting(true);
                  }}
                  tooltip="Print as pdf"
                />
                {tabular && (
                  <>
                    <Button
                      icon={<FaTableCellsLarge />}
                      text="TSV"
                      onClick={() => downloadTsv(tabular, filename)}
                      tooltip="Tab-separated data"
                    />
                    <Button
                      icon={<FaTableCellsLarge />}
                      text="CSV"
                      onClick={() => downloadCsv(tabular, filename)}
                      tooltip="Tab-separated data"
                    />
                  </>
                )}
                {!!text && (
                  <Button
                    icon={<TbPrompt />}
                    text="Text"
                    onClick={() => downloadTxt(text, filename)}
                    tooltip="Raw text data"
                  />
                )}
                {!!json && (
                  <Button
                    icon={<PiBracketsCurlyBold />}
                    text="JSON"
                    onClick={() => downloadJson(json, filename)}
                    tooltip="JSON data"
                  />
                )}
              </Flex>
            }
          >
            <Button icon={<FaDownload />} design="hollow" tooltip="Download" />
          </Popover>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Chart;
