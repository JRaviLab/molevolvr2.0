import { clamp } from "lodash";

/** trig in degrees */
export const sin = (degrees: number) => Math.sin(2 * Math.PI * (degrees / 360));
export const cos = (degrees: number) => Math.cos(2 * Math.PI * (degrees / 360));

/** linear interpolate */
export const lerp = (
  value: number,
  sourceMin: number,
  sourceMax: number,
  targetMin: number,
  targetMax: number,
) =>
  targetMin +
  clamp((value - sourceMin) / (sourceMax - sourceMin), 0, 1) *
    (targetMax - targetMin);
