import {
  interpolateBlues,
  interpolateCool,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateOranges,
  interpolateOrRd,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePRGn,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRdBu,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateYlGnBu,
  interpolateYlOrRd,
} from "d3";

export type Id = keyof typeof gradients;

export const defaultGradient: Id = "Red Purple";

/** a few pretty color gradient options */
/** from https://github.com/d3/d3-scale-chromatic */
export const gradients = {
  /** basic */
  Greys: interpolateGreys,

  /** reds / oranges */
  Reds: interpolateReds,
  Oranges: interpolateOranges,
  "Orange Red": interpolateOrRd,
  "Yellow Orange Red": interpolateYlOrRd,

  /** greens / blues */
  Greens: interpolateGreens,
  "Green Blue": interpolateGnBu,
  "Yellow Green Blue": interpolateYlGnBu,
  "Purple Blue Green": interpolatePuBuGn,
  Blues: interpolateBlues,
  "Purple Blue": interpolatePuBu,

  /** purples / pinks */
  Purples: interpolatePurples,
  "Purple Red": interpolatePuRd,
  "Red Purple": interpolateRdPu,

  /** diverging */
  "Red Yellow Green": interpolateRdYlGn,
  "Red Yellow Blue": interpolateRdYlBu,
  "Red Blue": interpolateRdBu,
  "Pink Yellow Green": interpolatePiYG,
  "Purple Orange": interpolatePuOr,
  "Purple Red Green": interpolatePRGn,

  /** special */
  Plasma: interpolatePlasma,
  Viridis: interpolateViridis,
  Cool: interpolateCool,
  Spectral: interpolateSpectral,
  Turbo: interpolateTurbo,
} as const;

/** get gradient interpolator func */
export const gradientFunc = (id: Id, reverse: boolean) => (value: number) =>
  gradients[id](reverse ? 1 - value : value);
