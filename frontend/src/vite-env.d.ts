/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/** no type defs for these libraries */
declare module "cytoscape-cola";
declare module "cytoscape-spread";

namespace React.JSX {
  // eslint-disable-next-line
  interface IntrinsicElements {
    "nightingale-manager": JSX.HTMLAttributes<CustomElement>;
    "nightingale-navigation": JSX.HTMLAttributes<CustomElement>;
    "nightingale-sequence": JSX.HTMLAttributes<CustomElement>;
    "nightingale-interpro-track": JSX.HTMLAttributes<CustomElement>;
  }
}
