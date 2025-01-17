import { useCallback, useEffect, useRef, useState } from "react";
import { FaBezierCurve, FaDownload, FaRegImage } from "react-icons/fa6";
import clsx from "clsx";
import { SunburstChart } from "echarts/charts";
import type { SunburstSeriesOption } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import type { TooltipComponentOption } from "echarts/components";
import { dispose, init, use } from "echarts/core";
import type { ComposeOption, EChartsType } from "echarts/core";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";
import { startCase, sumBy, truncate } from "lodash";
import { useElementSize } from "@reactuses/core";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { getColorMap } from "@/util/color";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { flatMap } from "@/util/object";
import { formatNumber } from "@/util/string";
import classes from "./Sunburst.module.css";

type Option = ComposeOption<SunburstSeriesOption | TooltipComponentOption>;

/** register components */
use([
  SunburstChart,
  TooltipComponent,
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

type ItemExtras = {
  type: string;
  name: string;
  raw: number;
  value: number;
  color: string;
  depth: number;
  indexPath: number[];
  children: Item[];
};

type Item = Omit<
  NonNullable<SunburstSeriesOption["data"]>[number],
  keyof ItemExtras
> &
  ItemExtras;

const Sunburst = ({ title, data }: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const chart = useRef<EChartsType>();

  /** "trail" of breadcrumbs through tree of items */
  const [breadcrumbs, setBreadcrumbs] = useState<Item[]>([]);

  /** chart size */
  const [width, height] = useElementSize(container);

  /** resize on dimension change */
  useEffect(() => {
    chart.current?.resize();
  }, [width, height]);

  /** datum types */
  const types = flatMap(data, "type").filter(Boolean) as string[];

  /** map datum type to color */
  const colorMap = getColorMap(types, "light");

  /** is item selected */
  const isSelected = useCallback(
    (indexPath: Item["indexPath"]) =>
      breadcrumbs.at(-1)?.indexPath?.join("-")?.startsWith(indexPath.join("-")),
    [breadcrumbs],
  );

  /** define all props, derive props, add dynamic styling to data points */
  const transform = useCallback(
    (layers: Layer[]) => {
      const transform = (
        layers: Layer[],
        parentPercent = 1,
        depth = 1,
        parentIndexPath: Item["indexPath"] = [],
      ) => {
        const newLayers: Item[] = [];
        /** total of children's values */
        const total = sumBy(layers, "value");
        let index = 0;
        for (const { type = "", label = "-", value, children = [] } of layers) {
          /** get percentage of full circle */
          const percent = parentPercent * (value / total) || 0;

          /** get arc length of segment in terms of rough # of text chars */
          const arcLength = Math.round(360 * percent * depth * (width / 10000));

          /** new path of indices to get to this item through tree */
          const indexPath = [...parentIndexPath, index++];

          /** item color */
          const color = colorMap[type]!;

          /** selected state */
          const anySelected = !!breadcrumbs.length;
          const selected = isSelected(indexPath);

          /** item styles */
          const itemStyle = {
            color: anySelected && selected ? "var(--black)" : color,
          };

          /** data point values and styles */
          const newLayer: Item = {
            depth,
            label: {
              textBorderColor: "",
              formatter: () =>
                [
                  `${(percent * 100).toFixed(0)}%`,
                  truncate(label, { length: arcLength }),
                ].join("\n"),
            },
            name: label,
            type,
            value: percent,
            raw: value,
            color,
            itemStyle,
            emphasis: { itemStyle },
            children: transform(children, percent, depth + 1, indexPath),
            indexPath,
          };

          newLayers.push(newLayer);
        }
        return newLayers;
      };
      return transform(layers);
    },
    [colorMap, width, breadcrumbs, isSelected],
  );

  /** transform data */
  const transformed = transform(data);

  /** init chart */
  useEffect(() => {
    if (!root.current) return;
    chart.current = init(root.current);
    return () => {
      if (chart.current) dispose(chart.current);
    };
  }, []);

  /** set static (don't change from data point to data point) chart options */
  useEffect(() => {
    if (!chart.current) return;
    const option: Option = {
      series: {
        type: "sunburst",
        data: transformed,
        radius: ["0%", "100%"],
        emphasis: { focus: "ancestor" },
        animation: false,
        label: {
          rotate: "tangential",
          fontSize: 16,
          lineHeight: 16 * 1.25,
        },
        nodeClick: false,
      },
      textStyle: {
        fontFamily: "var(--sans)",
      },
      tooltip: {
        trigger: "item",
        className: classes.tooltip,
        formatter: (params) => {
          const { name, type, value, raw } = (
            params as unknown as { data: Item }
          ).data;
          return `
            <div class="mini-table">
              <div>Name</div>
              <div>${name}</div>
              <div>Type</div>
              <div>${type}</div>
              <div>Percent</div>
              <div>${(Number(value) * 100).toFixed(0)}%</div>
              <div>Value</div>
              <div>${formatNumber(Number(raw))}</div>
            </div>
          `;
        },
      },
    };
    chart.current.setOption(option);

    /** on click selection */
    chart.current.on("click", (params) => {
      const { indexPath = [] } = params.data as Item;

      /** prevent deselect from click-outside */
      params.event?.event.stopPropagation();

      /** is already selected */
      if (isSelected(indexPath)) {
        /** de-select */
        setBreadcrumbs([]);
      } else {
        /** select */
        const breadcrumbs: Item[] = [];
        let children = transformed;
        /** traverse tree */
        for (const index of indexPath) {
          const breadcrumb = children[index]!;
          breadcrumbs.push(breadcrumb);
          children = breadcrumb.children;
        }
        setBreadcrumbs(breadcrumbs);
      }
    });

    return () => {
      chart.current?.off("click");
    };
  }, [title, transformed, colorMap, types, breadcrumbs, isSelected]);

  /** download chart */
  const download = useCallback((format: string) => {
    if (!chart.current) return;
    if (!root.current) return;

    if (format === "png") downloadPng(root.current, "sunburst");
    if (format === "jpg") downloadJpg(root.current, "sunburst");
    if (format === "svg")
      downloadSvg(root.current.querySelector("svg")!, "sunburst");
  }, []);

  return (
    <Flex direction="column" gap="lg" full>
      <Flex
        ref={container}
        className={clsx("card", classes.container)}
        direction="column"
        gap="lg"
        onClick={() => setBreadcrumbs([])}
      >
        {title && <strong>{title}</strong>}

        {/* legend */}
        <div className={classes.legend}>
          {Object.entries(colorMap).map(([type, color], index) => (
            <Flex key={index} gap="sm" wrap={false} hAlign="left">
              <div
                className={classes["legend-color"]}
                style={{ background: color }}
              />
              <div className={clsx("truncate", !type && "secondary")}>
                {startCase(type) || "none"}
              </div>
            </Flex>
          ))}
        </div>

        {/* chart container */}
        <div ref={root} className={classes.chart}></div>

        {/* breadcrumbs */}
        {!!breadcrumbs.length && (
          <Flex gap="sm" gapRatio={1} className={classes.breadcrumbs}>
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
                  {(100 * value).toFixed(0)}% {truncate(name, { length: 20 })}
                </div>
              </Tooltip>
            ))}
          </Flex>
        )}
      </Flex>

      {/* controls */}
      <Flex>
        <Popover
          content={
            <Flex direction="column" hAlign="stretch" gap="xs">
              <Button
                icon={<FaRegImage />}
                text="PNG"
                onClick={() => download("png")}
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() => download("jpg")}
                tooltip="Compressed image"
              />
              <Button
                icon={<FaBezierCurve />}
                text="SVG"
                onClick={() => download("svg")}
                tooltip="Vector image"
              />
            </Flex>
          }
        >
          <Button
            icon={<FaDownload />}
            design="hollow"
            tooltip="Download chart"
          />
        </Popover>
      </Flex>
    </Flex>
  );
};

export default Sunburst;
