import Plot from "react-plotly.js";
import clsx from "clsx";
import { map, sumBy, uniqueId } from "lodash";
import type { Config, Data, Layout } from "plotly.js";
import { getColorMap } from "@/util/color";
import classes from "./Sunburst.module.css";

export type Layer = {
  id?: string;
  label?: string;
  type?: string;
  value: number;
  children?: Layer[];
};

type Props = {
  data: Layer[];
};

type FlatLayer = {
  id: string;
  label: string;
  type: string;
  value: number;
  normalized: number;
  parent: string;
};

/** convert nested format into flat format needed for plot library */
const flatten = (layers: Layer[], parent = "", parentNormalized = 1) => {
  const flattenedLayers: FlatLayer[] = [];

  const total = sumBy(layers, "value");

  for (const {
    id = uniqueId(),
    label = "-",
    type = "",
    value,
    children,
  } of layers) {
    const normalized = (parentNormalized * value) / total || 0;
    const newLayer: FlatLayer = { id, label, type, value, normalized, parent };
    flattenedLayers.push(newLayer);
    if (children)
      flattenedLayers.push(...flatten(children, newLayer.id, normalized));
  }

  return flattenedLayers;
};

const padding = 20;

const Sunburst = ({ data }: Props) => {
  const flattened = flatten(data);

  /** unique datum types */
  const types = map(flattened, "type");

  /** map datum type to color */
  const colorMap = getColorMap(types, "light");

  /** plotly data */
  const _data: Data[] = [
    {
      type: "sunburst",
      ids: map(flattened, "id"),
      labels: map(flattened, "label"),
      parents: map(flattened, "parent"),
      values: map(flattened, "normalized"),
      marker: { colors: types.map((type) => colorMap[type]!) },
      branchvalues: "total",
    },
  ];

  /** plotly layout */
  const layout: Partial<Layout> = {
    autosize: true,
    margin: { l: padding, t: padding, r: padding, b: padding },
  };

  /** plotly config */
  const config: Partial<Config> = {
    displayModeBar: false,
  };

  return (
    <Plot
      data={_data}
      layout={layout}
      config={config}
      useResizeHandler={true}
      className={clsx("card", classes.chart)}
    />
  );
};

export default Sunburst;
