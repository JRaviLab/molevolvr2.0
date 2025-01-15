import { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { SunburstChart } from "echarts/charts";
import type { SunburstSeriesOption } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from "echarts/components";
import type {
  TitleComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import { dispose, init, use } from "echarts/core";
import type { ComposeOption, EChartsType } from "echarts/core";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import { sumBy, truncate } from "lodash";
import { useElementSize } from "@reactuses/core";
import { getColorMap } from "@/util/color";
import { flatMap } from "@/util/object";
import classes from "./Sunburst.module.css";

type Option = ComposeOption<
  SunburstSeriesOption | TitleComponentOption | TooltipComponentOption
>;

/** register echarts component */
use([
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  SunburstChart,
  LabelLayout,
  UniversalTransition,
  SVGRenderer,
]);

export type Layer = {
  label?: string;
  type?: string;
  value: number;
  transformed?: number;
  children?: Layer[];
};

type Props = {
  title?: string;
  data: Layer[];
};

/** layer type, transformed to format suited to plotting library */
type Transformed = NonNullable<SunburstSeriesOption["data"]>[number] & {
  type: string;
  raw: number;
  depth: number;
};

const Sunburst = ({ title, data }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<EChartsType>();

  /** chart size */
  const [width, height] = useElementSize(ref);

  /** resize on dimension change */
  useEffect(() => chart.current?.resize(), [width, height]);

  /** datum types */
  const types = flatMap(data, "type").filter(Boolean) as string[];

  /** map datum type to color */
  const colorMap = getColorMap(types, "light");

  /** define all props, derive props, add dynamic styling to data points */
  const transform = useCallback(
    (layers: Layer[]) => {
      const transform = (layers: Layer[], parentAngle = 1, depth = 1) => {
        const newLayers: Transformed[] = [];
        /** total of children's values */
        const total = sumBy(layers, "value");
        for (const { type = "", label = "-", value, children = [] } of layers) {
          /** get angle range (as percentage of full circle) */
          const angle = parentAngle * (value / total) || 0;

          /** get arc length of segment */
          const arcLength = 360 * angle * depth * (width / 4000);

          /** data point values and styles */
          const newLayer: Transformed = {
            depth,
            name: truncate(label, { length: arcLength }),
            type,
            value: angle,
            raw: value,
            itemStyle: { color: colorMap[type] },
            children: transform(children, angle, depth + 1),
          };

          newLayers.push(newLayer);
        }
        return newLayers;
      };
      return transform(layers);
    },
    [colorMap, width],
  );

  /** transform data */
  const transformed = transform(data);

  /** init chart */
  useEffect(() => {
    if (!ref.current) return;
    chart.current = init(ref.current);
    return () => {
      if (chart.current) dispose(chart.current);
    };
  }, []);

  /** set static (don't change from data point to data point) chart options */
  useEffect(() => {
    if (!chart.current) return;
    const option: Option = {
      title: { text: title },
      series: {
        type: "sunburst",
        data: transformed,
        radius: [0, "95%"],
        emphasis: { focus: "ancestor" },
        animation: false,
        label: {
          rotate: "tangential",
          fontSize: 16,
        },
      },
    };
    chart.current.setOption(option);
  }, [title, transformed, colorMap]);

  return <div ref={ref} className={clsx("card", classes.chart)}></div>;
};

export default Sunburst;
