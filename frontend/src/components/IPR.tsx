import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { drag, scaleLinear, select, zoom, zoomIdentity } from "d3";
import type { D3DragEvent, D3ZoomEvent } from "d3";
import { clamp, inRange, mapValues, range } from "lodash";
import Chart from "@/components/Chart";
import Help from "@/components/Help";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import type { Filename } from "@/util/download";
import { useTextSize, useTheme } from "@/util/hooks";

/** label size */
const labelWidth = 150;
/** row height */
const rowHeight = 20;
/** gap between rows */
const rowGap = 5;
/** height of scrollbar */
const scrollHeight = 7;

type Props = {
  /** title text */
  title?: string;
  /** download filename */
  filename?: Filename;
  /** sequence chars */
  sequence: string;
  /** track data */
  tracks: Track[];
};

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

/** interproscan result visualization */
const IPR = ({ title, filename = [], sequence, tracks }: Props) => {
  const zoomRef = useRef<SVGGElement>(null);
  const dragRef = useRef<SVGGElement>(null);

  /** map of feature types to colors */
  const colorMap = useColorMap(
    tracks
      .map((track) => track.features.map((feature) => feature.type ?? ""))
      .flat(),
    "mode",
  );

  const theme = useTheme();

  const { fontSize, getWidth, truncateWidth } = useTextSize();

  /** unique id for clip path */
  const clipId = useId();

  /** reactive zoom transform */
  const [transform, setTransform] = useState(zoomIdentity);

  /** pan/zoom behavior */
  const zoomBehavior = useMemo(
    () =>
      zoom<SVGGElement, unknown>().on(
        "zoom",
        (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
          setTransform(event.transform);
        },
      ),
    [],
  );

  /** update zoom limit */
  useEffect(() => {
    zoomBehavior.scaleExtent([
      /** min zoom out, chars fill width */
      1,
      /** max zoom in, by # of chars in view */
      sequence.length / 3,
    ]);
  }, [zoomBehavior, sequence.length]);

  type Drag = D3DragEvent<SVGSVGElement, unknown, unknown>;

  const onDrag = useCallback(
    ({ x }: Drag) => {
      if (!zoomRef.current) return;
      /** update zoom transform */
      zoomBehavior.translateTo(select(zoomRef.current), x, 0);
    },
    [zoomBehavior],
  );

  /** scrollbar drag behavior */
  const dragBehavior = useMemo(
    () =>
      drag<SVGGElement, unknown>()
        .container(function () {
          return this;
        })
        .on("start", onDrag)
        .on("drag", onDrag),
    [onDrag],
  );

  const prevWidth = useRef(0);

  return (
    <Chart
      title={title}
      filename={[...filename, "ipr"]}
      containerProps={{ className: "w-full" }}
      controls={[
        <Help
          tooltip={
            <>
              On main chart area:
              <br />
              &nbsp;• Scroll to zoom
              <br />
              &nbsp;• Drag to move
              <br />
              &nbsp;• Double click to reset
            </>
          }
        />,
      ]}
    >
      {({ width }) => {
        /** width of main sequence view area */
        width = Math.max(width - labelWidth - 2 * rowHeight, labelWidth);

        /** transform sequence index to svg x position */
        const scaleX = transform.rescaleX(
          scaleLinear().domain([0, sequence.length]).range([0, width]),
        );

        /** seq char cell width */
        const cellWidth = scaleX(1) - scaleX(0);

        /** start/end positions in view */
        let startPosition = Math.floor(scaleX.invert(0));
        let endPosition = Math.ceil(scaleX.invert(width));
        startPosition = clamp(startPosition, 0, sequence.length);
        endPosition = clamp(endPosition, 0, sequence.length);

        /** skip position ticks based on zoom */
        const skip =
          [1, 2, 5, 10, 20, 50, 100].find(
            /** find first skip where cells width exceeds a few font chars */
            (skip) => skip * cellWidth > 4 * fontSize,
          ) ?? 1;

        /** position ticks */
        const ticks = range(startPosition, endPosition)
          .filter(
            (position) =>
              /** skip by multiple */
              position % skip === 0 ||
              /** always include start/end */
              position === startPosition ||
              position === endPosition - 1,
          )
          /** compute tick props */
          .map((position) => {
            const text = String(position + 1);
            const w = getWidth(text);
            let x = scaleX(position + 0.5);
            x = clamp(x, w / 2, width - w / 2);
            return { position, text, x, w };
          });

        /** remove one of two overlapping ticks */
        const removeOverlapping = (ai: number, bi: number, ri: number) => {
          const a = ticks.at(ai);
          const b = ticks.at(bi);
          if (a && b && ticks.length > 2 && a.x + a.w / 2 >= b.x - b.w / 2)
            ticks.splice(ri, 1);
        };
        /** if second tick overlaps first, remove second */
        removeOverlapping(0, 1, 1);
        /** if penultimate tick overlaps last, remove penultimate */
        removeOverlapping(-2, -1, -2);

        /** update pan limit */
        zoomBehavior
          .extent([
            [0, 0],
            [width, 1],
          ])
          .translateExtent([
            [0, 0],
            [width, 1],
          ]);

        /** scroll bar numbers */
        const scrollLeft = transform.invertX(0);
        const scrollRight = transform.invertX(width);
        const scrollX = (scrollRight + scrollLeft) / 2;
        let scrollSpan = scrollRight - scrollLeft;
        scrollSpan = clamp(scrollSpan, scrollHeight, Infinity);

        return (
          <>
            {/* labels col */}
            <g textAnchor="end" transform={`translate(${-rowHeight}, 0)`}>
              <g fill={theme["--color-gray"]}>
                <text x={0} y={-1.5 * (rowHeight + rowGap)}>
                  Sequence
                </text>
                <text x={0} y={-0.5 * (rowHeight + rowGap)}>
                  Position
                </text>
              </g>
              <g fill={theme["--color-black"]}>
                {tracks.map((track, trackIndex) => (
                  <Tooltip key={trackIndex} content={track.label}>
                    <text
                      x={0}
                      y={(trackIndex + 0.5) * (rowHeight + rowGap)}
                      tabIndex={0}
                    >
                      {truncateWidth(track.label ?? "-", labelWidth)}
                    </text>
                  </Tooltip>
                ))}
              </g>
            </g>

            {/* main content area */}
            <g
              ref={(el) => {
                zoomRef.current = el;

                if (el) {
                  /** attach zoom behavior */
                  const selection = select(el);
                  zoomBehavior(selection);

                  /** prevent scroll overflow */
                  selection.on("wheel", (event) => event.preventDefault());

                  /** reset zoom */
                  const reset = () => {
                    zoomBehavior.transform(selection, zoomIdentity);
                    setTransform(zoomIdentity);
                  };
                  selection.on("dblclick.zoom", (event) => {
                    event.preventDefault();
                    reset();
                  });
                  if (prevWidth.current !== width) reset();
                  prevWidth.current = width;
                }

                return () => {
                  zoomRef.current = null;
                };
              }}
              className="cursor-grab"
            >
              {/* background */}
              <rect
                x={0}
                y={-2 * (rowHeight + rowGap)}
                width={width}
                height={(2 + tracks.length) * (rowHeight + rowGap)}
                fill={theme["--color-white"]}
                stroke={theme["--color-light-gray"]}
              />
              <clipPath id={clipId}>
                <rect
                  x={0}
                  y={-2 * (rowHeight + rowGap)}
                  width={width}
                  height={(2 + tracks.length) * (rowHeight + rowGap)}
                />
              </clipPath>

              {/* main content view */}
              <g clipPath={`url(#${clipId})`} data-fit-ignore>
                {/* sequence row */}
                <g
                  className="pointer-events-none"
                  transform={`translate(0, ${-1.5 * (rowHeight + rowGap)})`}
                >
                  {/* only draw sequence chars in view */}
                  {range(startPosition, endPosition).map((position) => (
                    <g
                      key={position}
                      transform={`translate(${scaleX(position + 0.5)}, 0)`}
                    >
                      <rect
                        x={-cellWidth / 2}
                        y={-rowHeight / 2}
                        width={cellWidth}
                        height={rowHeight}
                        fill={theme["--color-light-gray"]}
                        opacity={position % 2 === 0 ? 0.25 : 0.5}
                      />
                      <text
                        x={0}
                        y={0}
                        fill={theme["--color-black"]}
                        transform={`scale(${clamp(cellWidth / fontSize, 0, 1)})`}
                        textAnchor="middle"
                      >
                        {sequence[position]}
                      </text>
                    </g>
                  ))}
                </g>

                {/* ticks row */}
                <g
                  className="pointer-events-none"
                  fill={theme["--color-black"]}
                  textAnchor="middle"
                  transform={`translate(0, ${-0.5 * (rowHeight + rowGap)})`}
                >
                  {ticks.map(({ position, text, x }) => (
                    <text key={position} x={x} y={0}>
                      {text}
                    </text>
                  ))}
                </g>

                {/* track rows */}
                <g>
                  {tracks.map((track, trackIndex) => (
                    <g
                      key={trackIndex}
                      transform={`translate(0, ${trackIndex * (rowHeight + rowGap)})`}
                    >
                      {track.features.map(
                        ({ id, label, type, start, end }, featureIndex) => {
                          /** don't draw features outside view */
                          if (end < startPosition + 1 || start > endPosition)
                            return null;

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
                              key={featureIndex}
                              content={
                                <dl>
                                  <dt>Name</dt>
                                  <dd>{label ?? id}</dd>
                                  <dt>Type</dt>
                                  <dd>{type}</dd>
                                  <dt>Range</dt>
                                  <dd>
                                    {start}-{end}
                                  </dd>
                                </dl>
                              }
                            >
                              <g tabIndex={0} role="graphics-symbol">
                                <rect
                                  x={drawX}
                                  y={0}
                                  width={drawWidth}
                                  height={rowHeight}
                                  fill={colorMap[type ?? ""]}
                                />
                                {inRange(
                                  drawMidX,
                                  fontSize,
                                  width - fontSize,
                                ) && (
                                  <text
                                    x={drawMidX}
                                    y={rowHeight / 2}
                                    fill={theme["--color-black"]}
                                    textAnchor="middle"
                                  >
                                    {truncateWidth(label ?? id, drawWidth)}
                                  </text>
                                )}
                              </g>
                            </Tooltip>
                          );
                        },
                      )}
                    </g>
                  ))}
                </g>
              </g>

              {/* scrollbar */}
              <g
                ref={(el) => {
                  dragRef.current = el;

                  if (el)
                    /** attach drag behavior */
                    dragBehavior(select(el));

                  return () => {
                    dragRef.current = el;
                  };
                }}
                transform={`translate(0, ${tracks.length * (rowHeight + rowGap)})`}
              >
                <rect
                  x={0}
                  y={0}
                  width={width}
                  height={scrollHeight}
                  fill={theme["--color-off-white"]}
                />
                <rect
                  x={scrollX - scrollSpan / 2}
                  y={0}
                  width={scrollSpan}
                  height={scrollHeight}
                  rx={scrollHeight / 2}
                  ry={scrollHeight / 2}
                  fill={theme["--color-gray"]}
                />
              </g>
            </g>

            <Legend
              x={-labelWidth - 2 * rowHeight}
              y={(1 + tracks.length) * (rowHeight + rowGap)}
              w={width + labelWidth}
              entries={mapValues(colorMap, (color) => ({ color }))}
            />
          </>
        );
      }}
    </Chart>
  );
};

export default IPR;
