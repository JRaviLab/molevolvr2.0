import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { scaleLinear, select, zoom, zoomIdentity } from "d3";
import type { D3ZoomEvent } from "d3";
import { clamp, inRange, mapValues, range } from "lodash";
import Chart from "@/components/Chart";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import type { Filename } from "@/util/download";
import { useTextSize, useTheme } from "@/util/hooks";
import classes from "./IPR.module.css";

/** label size */
const labelWidth = 150;
/** row height */
const rowHeight = 20;
/** gap between rows */
const rowGap = 5;

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
  /** map of feature types to colors */
  const colorMap = useColorMap(
    tracks
      .map((track) => track.features.map((feature) => feature.type ?? ""))
      .flat(),
    "mode",
  );

  /** reactive CSS vars */
  const theme = useTheme();

  const { fontSize, truncateWidth } = useTextSize();

  /** unique id for clip path */
  const clipId = useId();

  /** zoom transform */
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

  /** clamp tick position near start/end */
  const clampTick = useCallback(
    (x: number, width: number, string: string) => {
      /** approximate half-width of string */
      const padding = (fontSize * string.length) / 3;
      return clamp(x, padding, width - padding);
    },
    [fontSize],
  );

  return (
    <Chart
      title={title}
      filename={[...filename, "ipr"]}
      containerProps={{ className: "full" }}
    >
      {({ width }) => {
        /** info from chart wrapper */

        /** width of main sequence view area */
        width = Math.max(width - labelWidth, labelWidth);

        /** transform sequence index to svg x position */
        const scaleX = transform.rescaleX(
          scaleLinear().domain([0, sequence.length]).range([0, width]),
        );

        /** seq char width */
        const charWidth = scaleX(1) - scaleX(0);

        /** start/end positions in view */
        let startPosition = Math.floor(scaleX.invert(0));
        let endPosition = Math.ceil(scaleX.invert(width));
        startPosition = clamp(startPosition, 0, sequence.length);
        endPosition = clamp(endPosition, 0, sequence.length);

        /** skip position labels based on zoom */
        const skip =
          [1, 5, 10, 20, 50, 100].find(
            (skip) => skip * charWidth > 1.5 * rowHeight,
          ) ?? 1;

        /** position ticks */
        const ticks = range(startPosition, endPosition).filter(
          (position) => position % skip === 0,
        );

        /** remove ticks if too close to start/end labels */
        if (skip > 1) {
          const first = ticks.at(0);
          const last = ticks.at(-1);
          if (first !== undefined)
            if (first === startPosition || scaleX(first + 0.5) < 2 * fontSize)
              ticks.shift();
          if (last !== undefined)
            if (
              last === endPosition ||
              width - scaleX(last + 0.5) < 2 * fontSize
            )
              ticks.pop();
        }

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

        return (
          <>
            {/* labels col */}
            <g
              textAnchor="end"
              dominantBaseline="central"
              transform={`translate(${-rowHeight}, 0)`}
            >
              <g fill={theme["--gray"]}>
                <text x={0} y={-1.5 * (rowHeight + rowGap)}>
                  Sequence
                </text>
                <text x={0} y={-0.5 * (rowHeight + rowGap)}>
                  Position
                </text>
              </g>
              <g fill={theme["--black"]} dominantBaseline="central">
                {tracks.map((track, trackIndex) => (
                  <Tooltip key={trackIndex} content={track.label}>
                    <text
                      x={0}
                      y={(trackIndex + 0.5) * (rowHeight + rowGap)}
                      tabIndex={0}
                      role="graphics-symbol"
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
                if (el) {
                  const selection = select(el);
                  /** attach zoom handler to this element */
                  zoomBehavior(selection);
                  /** prevent scroll overflow */
                  selection.on("wheel", (event) => event.preventDefault());
                }
              }}
              className={classes.area}
            >
              {/* background */}
              <Tooltip content="Scroll/pinch to zoom, drag to move">
                <rect
                  x={0}
                  y={-2 * (rowHeight + rowGap)}
                  width={width}
                  height={(2 + tracks.length) * (rowHeight + rowGap)}
                  fill={theme["--white"]}
                  stroke={theme["--light-gray"]}
                  tabIndex={0}
                  role="graphics-symbol"
                />
              </Tooltip>
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
                  className={classes["no-mouse"]}
                  transform={`translate(0, ${-1.5 * (rowHeight + rowGap)})`}
                >
                  {sequence.split("").map((char, index) => (
                    <g
                      key={index}
                      transform={`translate(${scaleX(index + 0.5)}, 0)`}
                    >
                      <rect
                        x={-charWidth / 2}
                        y={-rowHeight / 2}
                        width={charWidth}
                        height={rowHeight}
                        fill={theme["--light-gray"]}
                        opacity={index % 2 === 0 ? 0.25 : 0.5}
                      />
                      <text
                        x={0}
                        y={0}
                        fill={theme["--black"]}
                        transform={`scale(${clamp(charWidth / fontSize, 0, 1)})`}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {char}
                      </text>
                    </g>
                  ))}
                </g>

                {/* ticks row */}
                <g
                  className={classes["no-mouse"]}
                  fill={theme["--black"]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`translate(0, ${-0.5 * (rowHeight + rowGap)})`}
                >
                  {ticks.map((position) => (
                    <text
                      key={position}
                      x={clampTick(
                        scaleX(position + 0.5),
                        width,
                        String(position + 1),
                      )}
                      y={0}
                    >
                      {position + 1}
                    </text>
                  ))}
                  {skip > 1 && (
                    <>
                      <text
                        x={clampTick(0, width, String(startPosition + 1))}
                        y={0}
                      >
                        {startPosition + 1}
                      </text>
                      <text
                        x={clampTick(width, width, String(endPosition))}
                        y={0}
                      >
                        {endPosition}
                      </text>
                    </>
                  )}
                </g>

                {/* tracks */}
                <g>
                  {tracks.map((track, trackIndex) => (
                    <g
                      key={trackIndex}
                      transform={`translate(0, ${trackIndex * (rowHeight + rowGap)})`}
                    >
                      {track.features.map(
                        ({ id, label, type, start, end }, featureIndex) => {
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
                                tabIndex={0}
                                role="graphics-symbol"
                                dominantBaseline="central"
                              >
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
                                    fill={theme["--black"]}
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
