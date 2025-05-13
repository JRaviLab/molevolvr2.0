import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { scaleLinear, select, zoom, zoomIdentity, type D3ZoomEvent } from "d3";
import { clamp, mapValues, range, truncate } from "lodash";
import { useElementSize } from "@reactuses/core";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { useTheme } from "@/util/hooks";
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

const IPR = ({ sequence, tracks }: Props) => {
  /** collection of svg refs */
  const svgRefs = useRef(new Set<SVGSVGElement>());

  /** common pan/zoom */
  const [transform, setTransform] = useState(zoomIdentity);

  /** map of feature types to colors */
  const colorMap = useColorMap(
    tracks
      .map((track) => track.features.map((feature) => feature.type ?? ""))
      .flat(),
    "mode",
  );

  /** dimensions of first svg (all widths should be same) */
  let [width, height] = useElementSize([...svgRefs.current.values()][0]);

  /** set min value to avoid temporary divide by 0 errors */
  width ||= 10;
  height ||= 10;

  const fontSize = height / 2;

  /** transform sequence index to svg x position */
  const scaleX = transform.rescaleX(
    scaleLinear([0, sequence.length]).range([0, 1]),
  );

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
    () => [width / sequence.length, width / 2],
    [width, sequence.length],
  );

  /** func to attach pan/zoom handlers to elements */
  const zoomHandler = useMemo(
    () =>
      zoom<SVGSVGElement, unknown>()
        .extent(extent)
        .translateExtent(translateExtent)
        .scaleExtent(scaleExtent)
        .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
          setTransform(event.transform);
        }),
    [extent, translateExtent, scaleExtent],
  );

  /** when common transform changes */
  useEffect(() => {
    /** update each zoom handler's transform */
    for (const el of [...svgRefs.current])
      zoomHandler.transform(select(el), transform);
  }, [zoomHandler, transform]);

  /** zoom out as much as possible, fitting to contents */
  const reset = useCallback(() => {
    for (const el of [...svgRefs.current]) zoomHandler.scaleTo(select(el), 0);
  }, [zoomHandler]);

  /** must come after transform update */
  useEffect(() => {
    reset();
  }, [reset, extent, translateExtent, scaleExtent]);

  /** ref func for each svg */
  const svgRef = (el: SVGSVGElement | null) => {
    /** on mount */
    if (el) {
      /** attach zoom handler to this element */
      zoomHandler(select(el));
      /** add to ref collection */
      svgRefs.current.add(el);
      /** add non-passive listeners */
      el.addEventListener("wheel", (event) => event.preventDefault());
      el.addEventListener("dblclick", reset);
    }
    return () => {
      /** remove from ref collection on unmount/cleanup */
      if (el) svgRefs.current.delete(el);
    };
  };

  /** reactive CSS vars */
  const theme = useTheme();

  /** width of cells in svg units */
  const cellSize = scaleX(1) - scaleX(0);

  /** skip position labels based on zoom */
  const skip =
    [1, 5, 10, 20, 50, 100].find((skip) => skip * cellSize > height * 1.5) ?? 1;

  return (
    <>
      <div className={classes.grid}>
        {/* position */}
        <div className={classes["top-label"]}>Position</div>
        <svg
          ref={svgRef}
          viewBox={[0, 0, width, height].join(" ")}
          className={classes.row}
        >
          <g
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize }}
          >
            {range(0, sequence.length, skip).map((index) => (
              <Fragment key={index}>
                <text
                  x={scaleX(index + 0.5)}
                  y={height / 2}
                  fill={theme["--black"]}
                >
                  {index + 1}
                </text>
              </Fragment>
            ))}
          </g>
        </svg>

        {/* sequence */}
        <div className={classes["top-label"]}>Sequence</div>
        <svg
          ref={svgRef}
          viewBox={[0, 0, width, height].join(" ")}
          className={classes.row}
        >
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

            <svg
              ref={svgRef}
              viewBox={[0, 0, width, height].join(" ")}
              className={classes.row}
            >
              <g
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: height / 2 }}
              >
                {track.features.map(
                  ({ id, label, type, start, end }, index) => {
                    /** x in view */
                    const drawX = clamp(scaleX(start - 1), 0, width);
                    /** width in view */
                    const drawWidth =
                      clamp(scaleX(end), 0, width) -
                      clamp(scaleX(start - 1), 0, width);

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
                        <g className={classes.track} tabIndex={0} role="button">
                          <rect
                            x={drawX}
                            y={0}
                            width={drawWidth}
                            height={height}
                            fill={colorMap[type ?? ""]}
                          />
                          <text
                            x={drawX + drawWidth / 2}
                            y={height / 2}
                            fill={theme["--black"]}
                          >
                            {truncate(label ?? id, {
                              length: (drawWidth / height) * 3,
                            })}
                          </text>
                        </g>
                      </Tooltip>
                    );
                  },
                )}
              </g>
            </svg>
          </Fragment>
        ))}
      </div>

      <Legend entries={mapValues(colorMap, (color) => ({ color }))} />
    </>
  );
};

export default IPR;
