import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { SunburstChart } from "echarts/charts";
import type { SunburstSeriesOption } from "echarts/charts";
import { LegendComponent, TitleComponent } from "echarts/components";
import type {
  LegendComponentOption,
  TitleComponentOption,
} from "echarts/components";
import { dispose, init, use } from "echarts/core";
import type { ComposeOption, EChartsType } from "echarts/core";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import { sumBy, truncate } from "lodash";
import { useElementSize } from "@reactuses/core";
import Flex from "@/components/Flex";
import Tooltip from "@/components/Tooltip";
import { getColorMap } from "@/util/color";
import { flatMap } from "@/util/object";
import { formatNumber } from "@/util/string";
import classes from "./Sunburst.module.css";

type Option = ComposeOption<
  SunburstSeriesOption | TitleComponentOption | LegendComponentOption
>;

/** register echarts component */
use([
  TitleComponent,
  LegendComponent,
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

type Item = Omit<
  NonNullable<SunburstSeriesOption["data"]>[number],
  "children"
> & {
  type: string;
  name: string;
  raw: number;
  color: string;
  depth: number;
  indexPath: number[];
  children: Item[];
};

const Sunburst = ({ title, data }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<EChartsType>();

  /** "trail" of breadcrumbs through tree of items */
  const [breadcrumbs, setBreadcrumbs] = useState<Item[]>([]);

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
      const transform = (
        layers: Layer[],
        parentPercent = 1,
        depth = 1,
        indexPath: Item["indexPath"] = [],
      ) => {
        const newLayers: Item[] = [];
        /** total of children's values */
        const total = sumBy(layers, "value");
        let index = 0;
        for (const { type = "", label = "-", value, children = [] } of layers) {
          /** get percentage of full circle */
          const percent = parentPercent * (value / total) || 0;

          /** get arc length of segment in terms of rough # of text chars */
          const arcLength = Math.round(360 * percent * depth * (width / 4000));

          /** path of indices to get to this item through tree */
          const path = [...indexPath, index++];

          /** item color */
          const color = colorMap[type]!;

          /** data point values and styles */
          const newLayer: Item = {
            depth,
            label: {
              formatter: () =>
                [
                  truncate(label, { length: arcLength }),
                  `${(percent * 100).toFixed(0)}%`,
                ].join("\n"),
            },
            name: label,
            type,
            value: percent,
            raw: value,
            color,
            itemStyle: { color },
            children: transform(children, percent, depth + 1, path),
            indexPath: path,
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
        radius: ["0%", "100%"],
        emphasis: { focus: "ancestor" },
        animation: false,
        label: {
          rotate: "tangential",
          fontSize: 16,
        },
      },
    };
    chart.current.setOption(option);
    chart.current.setOption(option);

    /** on click selection */
    chart.current.on("click", (params) => {
      const { indexPath = [] } = params.data as Item;
      const breadcrumbs: Item[] = [];
      let children = transformed;
      /** traverse tree */
      for (const index of indexPath) {
        const breadcrumb = children[index]!;
        breadcrumbs.push(breadcrumb);
        children = breadcrumb.children;
      }
      setBreadcrumbs(breadcrumbs);
    });
  }, [title, transformed, colorMap, types]);

  return (
    <Flex className={clsx("card", classes.container)} direction="column">
      {/* legend */}
      <div className={classes.legend}>
        {Object.entries(colorMap).map(([type, color], index) => (
          <Flex key={index} gap="sm" wrap={false}>
            <div
              className={classes["legend-color"]}
              style={{ background: color }}
            />
            <div className={classes["legend-color"]}>{type || "-"}</div>
          </Flex>
        ))}
      </div>

      {/* breadcrumbs */}
      {!!breadcrumbs.length && (
        <Flex gap="sm" gapRatio={1}>
          {breadcrumbs.map(({ name, type, value, raw, color }, index) => (
            <Tooltip
              key={index}
              content={
                <div className="mini-table">
                  <div>Name</div>
                  <div>{name}</div>
                  <div>Type</div>
                  <div>{type}</div>
                  <div>Percent</div>
                  <div>{(Number(value) * 100).toFixed(0)}%</div>
                  <div>Value</div>
                  <div>{formatNumber(Number(raw))}</div>
                </div>
              }
            >
              <div
                className={classes.breadcrumb}
                style={{ background: color }}
                tabIndex={0}
                role="button"
              >
                {truncate(name)}
              </div>
            </Tooltip>
          ))}
        </Flex>
      )}

      {/* chart container */}
      <div ref={ref} className={classes.chart}></div>
    </Flex>
  );
};

export default Sunburst;
