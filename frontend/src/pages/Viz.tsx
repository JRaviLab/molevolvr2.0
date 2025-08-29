import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { extent } from "d3";
import { map, random, range } from "lodash";
import { useInterval } from "@reactuses/core";
import { dist } from "@/util/math";
import classes from "./Viz.module.css";

/** dist between points */
const gap = 30;
/** size of points */
const size = 4;
/** size of links */
const thickness = 1.5;
/** size of grid shape, in multiples of gap */
const grid = 5;
/** min/max distance to link points */
const minDist = gap * 0.5;
const maxDist = gap * 1.5;
/** number of animation moves */
const moves = 10;
/** amount to offset, in multiples of gap */
const offset = 4;
/** total duration of animation */
const duration = moves * 1500;

/** fun bg visualization */
const Viz = () => {
  const ref = useRef<SVGSVGElement>(null);

  /** unique animation key */
  const [key, setKey] = useState(0);

  /** force regeneration of objects */
  const regenerate = useCallback(async () => {
    /** inc key */
    setKey((key) => key + 1);
  }, []);

  /** generate objects to show */
  const { points, links, viewBox } = useMemo(() => {
    /** suppress eslint hooks warning. regenerate when key changes. */
    void key;

    const fallback = { points: [], links: [], viewBox: [0, 0, 1, 1] };
    const svg = ref.current;
    if (!svg) return fallback;

    /** get view size */
    const { width, height } = svg.getBoundingClientRect();

    if (!width || !height) return fallback;

    /** generate points */
    const points =
      /** generate grid */
      range(-grid, grid + 1)
        .map((x) => range(-grid, grid + 1).map((y) => ({ x, y })))
        .flat()
        /** make shape */
        .filter((point) => dist(point) < grid)
        /** format for animation */
        .map((point) => ({ steps: [{ ...point, a: 1 }] }));

    /* alternate shuffling by row/col */
    let col = true;

    for (let step = 0; step < moves - 1; step++) {
      /* map of coordinate to offset */
      const offsets: Record<number, number> = {};
      /* direction to alternate direction by */
      const alternateAxis = col ? "y" : "x";
      /* direction to offset in */
      const offsetAxis = col ? "x" : "y";

      for (const point of points) {
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

      /* flip direction */
      col = !col;
    }

    /** scale positions */
    for (const { steps } of points) {
      for (const step of steps) {
        step.x *= gap;
        step.y *= gap;
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
    const links = range(moves).map((step) =>
      pairs
        .filter(({ a, b }) => {
          const aStep = a.steps[step];
          const bStep = b.steps[step];
          if (!aStep || !bStep) return false;
          const d = dist(aStep, bStep);
          return d < maxDist && d > minDist;
        })
        .map(({ a, b }) => ({
          a: a.steps[step] ?? { x: 0, y: 0, a: 1 },
          b: b.steps[step] ?? { x: 0, y: 0, a: 1 },
        })),
    );

    /** prune links */
    for (const step of links)
      while (step.length > points.length * 1.5)
        step.splice(random(0, step.length - 1), 1);

    /** fade points in/out */
    for (const { steps } of points) {
      const first = steps.at(0);
      const last = steps.at(-1);
      if (!first || !last) continue;
      steps.unshift({ ...first, a: 0 });
      steps.push({ ...last, a: 0 });
    }

    /** add empty start/end keyframes to keep in sync with points */
    links.unshift([]);
    links.push([]);

    /** fit view to final shape */
    const xs = points.map(({ steps }) => steps.at(-1)?.x ?? 0);
    const ys = points.map(({ steps }) => steps.at(-1)?.y ?? 0);
    const [minX = 0, maxX = 0] = extent(xs);
    const [minY = 0, maxY = 0] = extent(ys);
    const viewBox = [
      minX - gap,
      minY - gap,
      maxX - minX + 2 * gap,
      maxY - minY + 2 * gap,
    ];

    return { points, links, viewBox };
  }, [key]);

  /** regenerate after animation complete */
  useInterval(regenerate, duration - 100, { immediate: true });

  return (
    <svg
      ref={ref}
      key={key}
      className={classes.viz}
      viewBox={viewBox.join(" ")}
    >
      {/* links */}
      {links.map((step, stepIndex) =>
        step.map(({ a, b }, pairIndex) => {
          /** length of each animation step */
          const stepDuration = duration / (moves + 2 - 1);

          return (
            <line
              key={[stepIndex, pairIndex].join("-")}
              className={classes.link}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeWidth={thickness}
              opacity={0}
            >
              <animate
                attributeName="opacity"
                dur={`${stepDuration}ms`}
                calcMode="spline"
                fill="freeze"
                begin={`${(stepIndex - 0.5) * stepDuration}ms`}
                keySplines={Array(4).fill("0.75 0 0.25 1").join(";")}
                values={[0, 0, 1, 0, 0].join(";")}
              />
            </line>
          );
        }),
      )}

      {/* points */}
      {points.map(({ steps }, index) => {
        /** animation properties */
        const props = (attr: string): ComponentProps<"animate"> => ({
          attributeName: attr,
          dur: `${duration}ms`,
          calcMode: "spline",
          keySplines: Array(steps.length - 1)
            .fill("0.75 0 0.25 1")
            .join(";"),
        });

        return (
          <circle key={index} className={classes.point} r={size}>
            <animate {...props("cx")} values={map(steps, "x").join(";")} />
            <animate {...props("cy")} values={map(steps, "y").join(";")} />
            <animate {...props("opacity")} values={map(steps, "a").join(";")} />
          </circle>
        );
      })}
    </svg>
  );
};

export default Viz;
