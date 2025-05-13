import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { scaleLinear, select, zoom, zoomIdentity, type D3ZoomEvent } from "d3";
import { mapValues } from "lodash";
import { useElementSize } from "@reactuses/core";
import Legend from "@/components/Legend";
import Tooltip from "@/components/Tooltip";
import { getColorMap } from "@/util/color";
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
  const featureColors = useMemo(
    () =>
      getColorMap(
        tracks
          .map((track) => track.features.map((feature) => feature.type ?? ""))
          .flat(),
      ),
    [tracks],
  );

  /** dimensions of first svg (all widths should be same) */
  let [width, height] = useElementSize([...svgRefs.current.values()][0]);

  /** set min value to avoid temporary divide by 0 errors */
  width ||= 10;
  height ||= 10;

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

  /**
   * on first render, zoom out as much as possible, fitting to contents. must
   * come after transform update.
   */
  useEffect(() => {
    for (const el of [...svgRefs.current]) zoomHandler.scaleTo(select(el), 0);
  }, [zoomHandler, extent, translateExtent, scaleExtent]);

  /** ref func for each svg */
  const svgRef = (el: SVGSVGElement | null) => {
    /** on mount */
    if (el) {
      /** attach zoom handler to this element */
      zoomHandler(select(el));
      /** add to ref collection */
      svgRefs.current.add(el);
    }
    return () => {
      /** remove from ref collection on unmount/cleanup */
      if (el) svgRefs.current.delete(el);
    };
  };

  return (
    <>
      <div className={classes.grid}>
        <div className={classes["top-label"]}>Position</div>
        <svg
          ref={svgRef}
          viewBox={[0, 0, width, height].join(" ")}
          className={classes.row}
        >
          <g
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: height }}
          >
            {sequence.split("").map((char, index) => (
              <Fragment key={index}>
                <text x={scaleX(index + 0.5)} y={height / 2}>
                  {index + 1}
                </text>
              </Fragment>
            ))}
          </g>
        </svg>
        <div className={classes["top-label"]}>Sequence</div>
        <svg
          ref={svgRef}
          viewBox={[0, 0, width, height].join(" ")}
          className={classes.row}
        >
          <g
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: height }}
          >
            {sequence.split("").map((char, index) => (
              <Fragment key={index}>
                <text x={scaleX(index + 0.5)} y={height / 2}>
                  {char}
                </text>
              </Fragment>
            ))}
          </g>
        </svg>
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
            <div />
          </Fragment>
        ))}
      </div>

      <Legend entries={mapValues(featureColors, (color) => ({ color }))} />
    </>
  );
};

export default IPR;
