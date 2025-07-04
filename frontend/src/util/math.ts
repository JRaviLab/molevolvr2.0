import { clamp } from "lodash";

/** 2 pi */
export const tau = 2 * Math.PI;

/** trig in degrees */
export const sin = (degrees: number) => Math.sin(tau * (degrees / 360));
export const cos = (degrees: number) => Math.cos(tau * (degrees / 360));

/** linear interpolate */
export const lerp = (
  value: number,
  sourceMin: number,
  sourceMax: number,
  targetMin: number,
  targetMax: number,
) =>
  targetMin +
  clamp((value - sourceMin) / (sourceMax - sourceMin || 1), 0, 1) *
    (targetMax - targetMin);

/** round to multiple */
export const round = (
  value: number,
  multiple = 1,
  method: "round" | "floor" | "ceil" = "round",
) => Math[method](value / multiple) * multiple;
