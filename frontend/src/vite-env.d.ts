/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/** no type def libraries for these libraries */
declare module "cytoscape-cola";
declare module "cytoscape-spread";

declare namespace JSX {
  type IntrinsicElements = {
    "nightingale-msa": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  };
}
