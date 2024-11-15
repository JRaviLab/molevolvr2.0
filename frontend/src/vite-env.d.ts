/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/** no type def libraries for these libraries */
declare module "cytoscape-cola";
declare module "cytoscape-spread";

declare module "dom-to-image-more" {
  import domToImage from "dom-to-image";
  export = domToImage;
}
