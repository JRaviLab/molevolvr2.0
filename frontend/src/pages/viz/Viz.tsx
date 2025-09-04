import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { random, range } from "lodash";
import { useElementSize } from "@reactuses/core";
import type { Theme } from "@/util/dom";
import { useTheme } from "@/util/hooks";
import { dist } from "@/util/math";
import Shape from "./shape.svg?raw";
import classes from "./Viz.module.css";

/** number of rows/cols of points */
const rows = 30;
/** spacing of points */
const spacing = 20;
/** radius of points */
const size = 3;
/** number of shuffle steps */
const steps = 10;
/** shuffle animation duration, in seconds */
const duration = 1;
/** pause between shuffles, in seconds */
const delay = 0.5;

/** gsap settings */
gsap.defaults({ ease: "power1.inOut" });

/** fun bg visualization */
const Viz = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D>(null);

  /** set draw context */
  useEffect(() => {
    if (!canvas.current) return;
    ctx.current = canvas.current.getContext("2d");
  }, []);

  /** canvas client size */
  const [width, height] = useElementSize(canvas);

  /** reactive CSS vars */
  const theme = useTheme();

  useEffect(() => {
    if (!canvas.current) return;

    ctx.current?.resetTransform();
    /** resolution scale */
    const scale = window.devicePixelRatio;
    /** upscale */
    canvas.current.width = width * scale;
    canvas.current.height = height * scale;
    ctx.current?.scale(scale, scale);
    /** center origin */
    ctx.current?.translate(width / 2, height / 2);
  }, [width, height]);

  /** key to trigger re-generation of objects */
  const [key, setKey] = useState(0);

  /** get objects to draw */
  const objects = useMemo(
    () => generate([Shape], width, height, () => setKey(key + 1)),
    [width, height, key],
  );

  /** hook up draw func to gsap timer */
  useEffect(() => {
    const frame = () =>
      draw(canvas.current, ctx.current, width, height, objects, theme);
    gsap.ticker.add(frame);
    return () => gsap.ticker.remove(frame);
  }, [width, height, objects, theme]);

  return <canvas ref={canvas} className={classes.viz} />;
};

export default Viz;

/** generate objects to draw */
const generate = (
  svgs: string[],
  width: number,
  height: number,
  onComplete: () => void,
) => {
  /** combined timeline for entire animation */
  const combinedTimeline = gsap.timeline({ onComplete, repeat: -1 });

  /** transform matrix for one element coord system to another */
  const getMatrix = (to: SVGGraphicsElement, from: SVGGraphicsElement) =>
    (to.getScreenCTM() || new SVGMatrix())
      .inverse()
      .multiply(from.getScreenCTM() || new SVGMatrix());

  const parser = new DOMParser();

  /** for each shape */
  const shapes = svgs.map((source, shapeIndex) => {
    /** parse svg string */
    const svg = parser.parseFromString(source, "image/svg+xml")
      .documentElement as unknown as SVGSVGElement;

    /** temporarily add to doc so computed styles and point-in-fill/stroke work */
    document.body.append(svg);

    /** get all elements in svg to check */
    const elements = Array.from(svg.querySelectorAll<SVGGraphicsElement>("*"))
      .filter((element) => element instanceof SVGGeometryElement)
      .map((element) => {
        const style = window.getComputedStyle(element);
        /** check if element has defined fill */
        const fill = style.fill !== "none";
        /** check if element has defined stroke */
        const stroke = style.stroke !== "none";
        /** element transform matrix */
        const transform = getMatrix(svg, element);
        return { element, fill, stroke, transform };
      });

    /** get bounding box of svg */
    const [x = 0, y = 0, w = 100, h = 100] = (svg.getAttribute("viewBox") || "")
      .split(" ")
      .map(Number);

    /** spacing of points to iterate over, in svg units */
    const gap = Math.min(w, h) / rows;

    /** generate grid of points that cover svg view box */
    const points = range(x, x + w + gap, gap)
      .map((x, col) =>
        range(y, y + h + gap, gap).map((y, row) => ({ col, row, x, y })),
      )
      .flat()
      .filter(({ x, y }) =>
        elements.some(({ element, fill, stroke, transform }) => {
          let point = svg.createSVGPoint();
          point.x = x;
          point.y = y;
          /** account for transform svg/css properties */
          point = point.matrixTransform(transform.inverse());
          /** check if inside shape */
          return (
            (fill && element.isPointInFill(point)) ||
            (stroke && element.isPointInStroke(point))
          );
        }),
      )
      .map(({ col, row }) => {
        /** shift to center */
        col -= Math.round(w / gap / 2);
        row -= Math.round(h / gap / 2);
        /** current state */
        const point = { col, row, alpha: 0, color: 0 };
        /** animation */
        const steps = [{ ...point }];
        return { ...point, steps };
      });

    /** remove from doc */
    svg.remove();

    /** number of grid cells to shuffle by */
    const offset = Math.min(
      Math.round(width / spacing / 2),
      Math.round(height / spacing / 2),
    );

    /* alternate shuffling by row/col */
    let flip = true;

    /** animate in steps */
    for (let step = 0; step < steps - 1; step++) {
      /* keep track of offsets for this step so all points offset by same amount */
      const offsets: Record<number, number> = {};
      /* direction to alternate direction by */
      const axisA = flip ? "col" : "row";
      /* direction to offset in */
      const axisB = flip ? "row" : "col";

      for (const { steps } of points) {
        /** clone latest step */
        const step = { ...steps.at(-1)! };

        /* if offset not already set for this line, calc random offset */
        offsets[step[axisA]] ??=
          /* alternate direction */
          (step[axisA] % 2 === 0 ? -1 : 1) *
          /* random offset */
          random(1, offset);

        /** move position */
        step[axisB] += offsets[step[axisA]] ?? 0;

        /** add step to animation */
        steps.push(step);
      }

      /* flip direction */
      flip = !flip;
    }

    /** every unique pair of points */
    const pairs = points
      .map((a, ai) => points.map((b, bi) => (ai < bi ? { a, b } : null)))
      .flat()
      .filter((pair) => pair !== null);

    /** links between points */
    const links = range(steps - 1).map((step) =>
      pairs
        .filter(({ a, b }) => {
          const aStep = a.steps[step]!;
          const bStep = b.steps[step]!;
          const d = dist(aStep.col, aStep.row, bStep.col, bStep.row);
          /** link two points if certain distance */
          return d < 1.5 && d > 0.5;
        })
        .map(({ a, b }) => ({
          /** start point */
          a: a.steps[step]!,
          /** end point */
          b: b.steps[step]!,
          alpha: 0,
        })),
    );

    /** marker on animation timeline for this shape */
    const label = String(shapeIndex);
    combinedTimeline.addLabel(label);

    /** animate points */
    for (const point of points) {
      /** sub timeline for point */
      const timeline = gsap.timeline();
      /** keyframes */
      point.steps.forEach(({ col, row }, stepIndex) =>
        timeline.to(point, {
          col,
          row,
          alpha: stepIndex === steps - 1 ? 0 : 1,
          duration,
          delay,
        }),
      );
      /** play reversed to create "coming together" effect */
      timeline.reverse();
      /** add to combined timeline */
      combinedTimeline.add(timeline, label);
    }

    /** reverse links */
    links.reverse();

    /** animate links */
    links.forEach((step, stepIndex) => {
      for (const link of step) {
        /** sub timeline for link */
        const timeline = gsap.timeline();
        /** keyframes */
        timeline.to(link, {
          alpha: 1,
          duration: delay,
          delay: duration - delay / 2,
        });
        timeline.to(link, { alpha: 0, duration: delay });
        /** add to combined timeline */
        combinedTimeline.add(
          timeline,
          `${label}+=${stepIndex * (duration + delay)}`,
        );
      }
    });

    return { points, links: links.flat() };
  });

  return shapes;
};

/** draw frame */
const draw = (
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
  width: number,
  height: number,
  objects: ReturnType<typeof generate>,
  theme: Theme,
) => {
  if (!canvas || !ctx) return;

  /** clear bg of canvas, centered in view */
  ctx.clearRect(-width / 2, -height / 2, width, height);

  /** static styles */
  ctx.fillStyle = theme["--deep"] ?? "";
  ctx.strokeStyle = theme["--deep"] ?? "";
  ctx.lineWidth = size / 2;

  /** draw links */
  for (const { links } of objects) {
    for (const { a, b, alpha } of links) {
      if (alpha === 0) continue;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(a.col * spacing, a.row * spacing);
      ctx.lineTo(b.col * spacing, b.row * spacing);
      ctx.stroke();
    }
  }

  /** draw points */
  for (const { points } of objects) {
    for (const { col, row, alpha } of points) {
      if (alpha === 0) continue;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(col * spacing, row * spacing, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
