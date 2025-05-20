import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaDownload, FaFilePdf, FaRegImage } from "react-icons/fa6";
import clsx from "clsx";
import {
  drag,
  scaleLinear,
  select,
  zoom,
  zoomIdentity,
  zoomTransform,
  type D3DragEvent,
  type D3ZoomEvent,
} from "d3";
import { clamp, inRange, mapValues, range, truncate } from "lodash";
import { useElementSize } from "@reactuses/core";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Legend from "@/components/Legend";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { printElement } from "@/util/dom";
import { downloadJpg, downloadPng } from "@/util/download";
import { rootFontSize, useSvgTransform, useTheme } from "@/util/hooks";
import classes from "./IPR.module.css";

/** track of features */
type Track = {
  label?: string;
  features: Feature[];
};

type Feature = {
  /** unique id */
  id: string;
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** starting position of feature in sequence (1-indexed) */
  start: number;
  /** ending position of feature in sequence (1-indexed) */
  end: number;
};

type Props = { sequence: string; tracks: Track[] };

const controlTooltip = "Scroll/pinch to zoom, drag to pan";

const IPR = ({ sequence, tracks }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  /** collection of svg refs */
  const svgRefs = useRef(new Set<SVGSVGElement>());
  const scrollRef = useRef<SVGSVGElement>(null);

  /** reactive CSS vars */
  const theme = useTheme();

  /** map of feature types to colors */
  const colorMap = useColorMap(
    tracks
      .map((track) => track.features.map((feature) => feature.type ?? ""))
      .flat(),
    "mode",
  );

  /** common pan/zoom */
  const [transform, setTransform] = useState(zoomIdentity);

  /** dimensions of first non-overflow svg (all widths should be same) */
  let [width, height] = useElementSize([...svgRefs.current][1]);

  /** set min value to avoid temporary divide by 0 errors */
  width ||= 100;
  height ||= 30;

  /** dimensions of scrollbar */
  const [, scrollHeight] = useElementSize(scrollRef);

  /** make svg font size relative to height, which is based on css font size */
  const fontSize = useSvgTransform(
    [...svgRefs.current][0]!,
    1,
    rootFontSize(),
  ).h;

  /** view box for all svgs */
  const viewBox = [0, 0, width, height].join(" ");

  /** transform sequence index to svg x position */
  const scaleX = transform.rescaleX(
    scaleLinear([0, sequence.length]).range([0, 1]),
  );

  /** width of cells in svg units */
  const cellSize = scaleX(1) - scaleX(0);

  /** start/end positions in view */
  let startPosition = Math.floor(scaleX.invert(0));
  let endPosition = Math.ceil(scaleX.invert(width));
  startPosition = clamp(startPosition, 0, sequence.length);
  endPosition = clamp(endPosition, 0, sequence.length);

  /** skip position labels based on zoom */
  const skip =
    [1, 5, 10, 20, 50, 100].find((skip) => skip * cellSize > height * 1.5) ?? 1;

  /** position ticks */
  const ticks = range(startPosition, endPosition).filter(
    (position) => position % skip === 0,
  );

  /** remove ticks if too close to start/end labels */
  if (skip > 1) {
    const first = ticks.at(0);
    const last = ticks.at(-1);
    if (first !== undefined)
      if (first === startPosition || scaleX(first + 0.5) < fontSize * 2)
        ticks.shift();
    if (last !== undefined)
      if (last === endPosition || width - scaleX(last + 0.5) < fontSize * 2)
        ticks.pop();
  }

  type Extent = [[number, number], [number, number]];

  /** range */
  const extent: Extent = useMemo(
    () => [
      [0, 0],
      [width, height],
    ],
    [width, height],
  );

  /** translate limit */
  const translateExtent: Extent = useMemo(
    () => [
      [0, 0],
      [sequence.length, 0],
    ],
    [sequence.length],
  );

  /** scale limit */
  const scaleExtent: [number, number] = useMemo(
    () => [
      /** min zoom out, chars fill width */
      width / sequence.length,
      /** max zoom in, by # of chars in view */
      width / 3,
    ],
    [width, sequence.length],
  );

  /** svg pan/zoom behavior */
  const zoomBehavior = useMemo(
    () =>
      zoom<SVGSVGElement, unknown>()
        .extent(extent)
        .translateExtent(translateExtent)
        .scaleExtent(scaleExtent)
        .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
          /** update all transforms */
          for (const el of [...svgRefs.current])
            if (zoomTransform(el).toString() !== event.transform.toString())
              /** check if not already equal to avoid infinite recursion */
              event.target.transform(select(el), event.transform);

          /** update common transform */
          setTransform((transform) =>
            event.transform.toString() === transform.toString()
              ? transform
              : event.transform,
          );
        }),
    [extent, translateExtent, scaleExtent],
  );

  /** zoom out as much as possible, fitting to contents */
  const reset = useCallback(() => {
    /** update all transforms */
    for (const el of [...svgRefs.current]) zoomBehavior.scaleTo(select(el), 0);
  }, [zoomBehavior]);

  /** reset on init */
  useEffect(() => {
    reset();
  }, [reset, extent, translateExtent, scaleExtent]);

  /** ref func for each svg */
  const svgRef = (el: SVGSVGElement | null) => {
    /** on mount */
    if (el) {
      /** attach zoom handler to this element */
      zoomBehavior(select(el));
      /** add to ref collection */
      svgRefs.current.add(el);
      /** add listeners */
      el.addEventListener("wheel", (event) => event.preventDefault());
      el.addEventListener("dblclick", reset);
    }
    return () => {
      /** remove from ref collection on unmount/cleanup */
      if (el) svgRefs.current.delete(el);
    };
  };

  /** scroll bar numbers */
  const scrollRatio = width / sequence.length;
  const scrollLeft = scrollRatio * transform.invertX(0);
  const scrollRight = scrollRatio * transform.invertX(width);
  const scrollX = (scrollRight + scrollLeft) / 2;
  let scrollSpan = scrollRight - scrollLeft;
  scrollSpan = clamp(scrollSpan, scrollHeight, Infinity);

  type Drag = D3DragEvent<SVGSVGElement, unknown, unknown>;

  /** start click position, as % of scroll bar */
  const dragOffset = useRef(0);

  const onDrag = useCallback(
    ({ x }: Drag) => {
      /** update all transforms */
      for (const el of [...svgRefs.current]) {
        zoomBehavior.translateTo(
          select(el),
          x / scrollRatio,
          0,
          /** offset translate based on start click position */
          [width * dragOffset.current, 0],
        );
      }
    },
    [zoomBehavior, scrollRatio, width],
  );

  const onDragStart = useCallback(
    (event: Drag) => {
      /** if clicked on track */
      if (event.sourceEvent.target.matches(":first-child"))
        /** put bar midpoint at click position */
        dragOffset.current = 0.5;
      else
        /** if clicked on bar */
        /** scroll based on relative drag */
        dragOffset.current = (event.x - scrollLeft) / scrollSpan;

      /** immediately update transforms */
      onDrag(event);
    },
    [scrollLeft, scrollSpan, onDrag],
  );

  /** scrollbar drag behavior */
  const dragBehavior = useMemo(
    () =>
      drag<SVGSVGElement, unknown>()
        .container(function () {
          return this;
        })
        .on("start", onDragStart)
        .on("drag", onDrag),
    [onDragStart, onDrag],
  );

  return (
    <Flex direction="column" gap="lg" full>
      <Flex ref={containerRef} direction="column" full>
        <div className={classes.grid}>
          {/* position */}
          <div className={classes["top-label"]}>Position</div>
          <Tooltip content={controlTooltip}>
            <svg
              ref={svgRef}
              viewBox={viewBox}
              className={classes.row}
              style={{ overflow: "visible" }}
            >
              <g
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize }}
                fill={theme["--black"]}
              >
                {ticks.map((position) => (
                  <text
                    key={position}
                    x={clamp(scaleX(position + 0.5), 0, width)}
                    y={height / 2}
                  >
                    {position + 1}
                  </text>
                ))}

                {skip > 1 && (
                  <>
                    <text x={0} y={height / 2}>
                      {startPosition + 1}
                    </text>
                    <text x={width} y={height / 2}>
                      {endPosition}
                    </text>
                  </>
                )}
              </g>
            </svg>
          </Tooltip>

          {/* sequence */}
          <div className={classes["top-label"]}>Sequence</div>
          <Tooltip content={controlTooltip}>
            <svg ref={svgRef} viewBox={viewBox} className={classes.row}>
              <g
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize }}
              >
                {sequence.split("").map((char, index) => (
                  <g
                    key={index}
                    transform={`translate(${scaleX(index + 0.5)},
                  ${height / 2})`}
                  >
                    <rect
                      x={-cellSize / 2}
                      y={-height / 2}
                      width={cellSize}
                      height={height}
                      fill={theme["--deep"]}
                      opacity={index % 2 === 0 ? 0.1 : 0.2}
                    />
                    <text
                      x={0}
                      y={0}
                      fill={theme["--black"]}
                      transform={`scale(${clamp(cellSize / fontSize, 0, 1)})`}
                    >
                      {char}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </Tooltip>

          {/* tracks */}
          {tracks.map((track, index) => (
            <Fragment key={index}>
              <Tooltip content={track.label}>
                <div
                  className={clsx("truncate", classes["track-label"])}
                  tabIndex={0}
                  role="button"
                >
                  {track.label ?? "-"}
                </div>
              </Tooltip>

              <svg ref={svgRef} viewBox={viewBox} className={classes.row}>
                <g
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize }}
                >
                  {track.features.map(
                    ({ id, label, type, start, end }, index) => {
                      /** x in view */
                      const drawX = clamp(scaleX(start - 1), 0, width);
                      /** width in view */
                      const drawWidth =
                        clamp(scaleX(end), 0, width) -
                        clamp(scaleX(start - 1), 0, width);
                      /** mid in view */
                      const drawMidX = drawX + drawWidth / 2;

                      return (
                        <Tooltip
                          key={index}
                          content={
                            <div className="mini-table">
                              <span>Name</span>
                              <span>{label ?? id}</span>
                              <span>Type</span>
                              <span>{type}</span>
                              <span>Range</span>
                              <span>
                                {start}-{end}
                              </span>
                            </div>
                          }
                        >
                          <g
                            className={classes.track}
                            tabIndex={0}
                            role="button"
                          >
                            <rect
                              x={drawX}
                              y={0}
                              width={drawWidth}
                              height={height}
                              fill={colorMap[type ?? ""]}
                            />
                            {inRange(drawMidX, fontSize, width - fontSize) && (
                              <text
                                x={drawMidX}
                                y={height / 2}
                                fill={theme["--black"]}
                              >
                                {truncate(label ?? id, {
                                  length: (drawWidth / height) * 3,
                                })}
                              </text>
                            )}
                          </g>
                        </Tooltip>
                      );
                    },
                  )}
                </g>
              </svg>
            </Fragment>
          ))}
          {/* scrollbar */}
          <div></div>
          <svg
            ref={(el) => {
              if (el) dragBehavior(select(el));
              scrollRef.current = el;
            }}
            className={classes.scrollbar}
            viewBox={[0, 0, width, scrollHeight].join(" ")}
          >
            <rect
              x={0}
              y={0}
              width={width}
              height={scrollHeight}
              fill={theme["--off-white"]}
            />
            <rect
              x={scrollX - scrollSpan / 2}
              y={0}
              width={scrollSpan}
              height={scrollHeight}
              rx={scrollHeight / 2}
              ry={scrollHeight / 2}
              fill={theme["--gray"]}
            />
          </svg>
        </div>

        <Legend entries={mapValues(colorMap, (color) => ({ color }))} />
      </Flex>

      {/* controls */}
      <Flex>
        <Popover
          content={
            <Flex direction="column" hAlign="stretch" gap="xs">
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={() =>
                  containerRef.current &&
                  downloadPng(containerRef.current, "ipr")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  containerRef.current &&
                  downloadJpg(containerRef.current, "ipr")
                }
                tooltip="Compressed image"
              />
              <Button
                icon={<FaFilePdf />}
                text="PDF"
                onClick={() =>
                  containerRef.current && printElement(containerRef.current)
                }
                tooltip="Print as pdf"
              />
            </Flex>
          }
        >
          <Button
            icon={<FaDownload />}
            design="hollow"
            tooltip="Download chart"
          />
        </Popover>
      </Flex>
    </Flex>
  );
};

export default IPR;
