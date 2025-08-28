import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp, random, range } from "lodash";
import { useDebounce, useElementSize, useInterval } from "@reactuses/core";
import { dist } from "@/util/math";
import classes from "./Viz.module.css";

/** dist between points */
const gap = 30;
/** size of points */
const size = 5;
/** size of links */
const thickness = size / 3;
/** number of animation steps */
const steps = 10;
/** multiples of gap to offset */
const offset = 5;
/** max rows of points */
const max = 10;
/** ms between each animation step */
const interval = 2000;
/** duration of each animation step */
const duration = 1000;
/** min/max distance to link points */
const minDist = gap * 0.5;
const maxDist = gap * 1.5;

/** fun bg visualization */
const Viz = () => {
  const ref = useRef(null);

  /** current unique animation */
  const [key, setKey] = useState(0);

  /** current animation time */
  const [time, setTime] = useState(-0.5);

  /** move time forward */
  const tickTime = useCallback(() => setTime((time) => time + 0.5), []);

  /** reset animation */
  const reset = useCallback(() => {
    setTime(-0.5);
    setKey((key) => key + 1);
  }, []);

  /** increment time */
  useInterval(() => (time > steps - 1 ? reset() : tickTime()), interval / 2);

  /** container size */
  const [_width, _height] = useElementSize(ref);
  const width = useDebounce(_width, 100);
  const height = useDebounce(_height, 100);

  /** reset on resize */
  useEffect(() => {
    reset();
  }, [reset, width, height]);

  /** generate objects to draw */
  const { points, links } = useMemo(() => {
    /** suppress hooks warning, regenerate when key changes */
    void key;

    /** grid rows */
    const rows = Math.min(Math.floor(height / gap), max);
    /** grid cols */
    const cols = Math.min(Math.floor(width / gap), max);

    /** generate points in grid */
    const points = range(rows)
      .map((row) =>
        range(cols).map((col) => ({
          /** animation steps */
          steps: [{ x: col, y: row }],
        })),
      )
      .flat();

    /* alternate shuffling by row/col */
    let col = true;

    for (let repeat = 0; repeat < 99; repeat++) {
      /* map of coordinate to offset */
      const offsets: Record<number, number> = {};
      /* axis to alternate direction by */
      const alternateAxis = col ? "y" : "x";
      /* axis to offset in */
      const offsetAxis = col ? "x" : "y";

      for (const point of points) {
        /** number of steps */
        if (point.steps.length >= steps) break;

        /** latest step */
        const step = point.steps.at(-1);
        if (!step) continue;
        /** alternate coord */
        const alternate = step[alternateAxis];
        /* select random offset for line */
        offsets[alternate] ??=
          /* alternate direction */
          (alternate % 2 === 0 ? -1 : 1) *
          /* random offset */
          random(1, offset);

        /* move step */
        const newStep = { ...step };
        newStep[offsetAxis] += offsets[alternate];
        point.steps.push(newStep);
      }

      /* flip axis */
      col = !col;
    }

    /** center points in view */
    const xOffset = (width - (cols - 1) * gap) / 2;
    const yOffset = (height - (rows - 1) * gap) / 2;

    for (const { steps } of points) {
      for (const step of steps) {
        /** indices to real steps */
        step.x *= gap;
        step.y *= gap;
        /** center points in view */
        step.x += xOffset;
        step.y += yOffset;
      }

      /** reverse movement */
      steps.reverse();
    }

    /** every unique pair of points */
    const pairs = points
      .map((a, ai) => points.map((b, bi) => (ai < bi ? { a, b } : null)))
      .flat()
      .filter((pair) => pair !== null);

    /** link points */
    const links = range(steps).map((step) =>
      pairs
        .filter(({ a, b }) => {
          const aStep = a.steps[step];
          const bStep = b.steps[step];
          if (!aStep || !bStep) return false;
          const d = dist(aStep, bStep);
          return d < maxDist && d > minDist;
        })
        .map(({ a, b }) => ({
          a: a.steps[step],
          b: b.steps[step],
        })),
    );

    /** prune links */
    for (const step of links)
      while (step.length > points.length * 1.5)
        step.splice(random(0, step.length - 1), 1);

    return { points, links };
  }, [key, width, height]);

  /** current step from animation time */
  const step = clamp(Math.round(time), 0, steps - 1);

  /** if time outside of animation bound */
  const outside = time < 0 || time > steps - 1;

  return (
    <svg ref={ref} className={classes.viz}>
      {!outside &&
        links[step]?.map(({ a, b }, index) => (
          <line
            key={[index, step].join("-")}
            className={classes.link}
            x1={a?.x}
            y1={a?.y}
            x2={b?.x}
            y2={b?.y}
            strokeWidth={thickness}
            style={{
              animationDuration: `${duration / 2}ms`,
              animationDelay: `${duration}ms`,
            }}
          />
        ))}

      {points.map(({ steps }, index) => {
        const { x = 0, y = 0 } = steps[step] ?? {};
        return (
          <circle
            key={index}
            className={classes.point}
            r={size}
            style={{
              opacity: outside ? 0 : 1,
              translate: `${x}px ${y}px`,
              transitionDuration: `${duration}ms`,
            }}
          />
        );
      })}
    </svg>
  );
};

export default Viz;
