import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  FaBezierCurve,
  FaDownload,
  FaFilePdf,
  FaRegImage,
} from "react-icons/fa6";
import clsx from "clsx";
import { clamp, startCase, sumBy, truncate } from "lodash";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { fitViewbox, printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { useTheme } from "@/util/hooks";
import { cos, sin } from "@/util/math";
import { flatMap } from "@/util/object";
import { formatNumber } from "@/util/string";
import classes from "./Sunburst.module.css";

export type Item = {
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** arbitrary value, normalized to determine segment % */
  value: number;
  /** children items */
  children?: Item[];
};

type Props = {
  /** chart title */
  title?: string;
  /** chart data */
  data: Item[];
};

type ItemDerived = {
  label: string;
  value: number;
  /** value, normalized to % of parent value */
  percent: number;
  type: string;
  color: string;
  selected: boolean | null;
  indexPath: number[];
  children: ItemDerived[];
};

/** options, in svg units (relative): */

/** thickness of rings */
const ringSize = 20;
/** "level" (multiple of ring size) of first ring from center */
const startLevel = 3;
/** gap between rings */
const gapSize = 2;
/** font size */
const fontSize = 10;

const Sunburst = ({ title, data }: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  /** fit viewBox after any change */
  useEffect(() => {
    if (svg.current) fitViewbox(svg.current, 0.01);
  });

  /** "trail" of breadcrumbs through tree of items */
  const [breadcrumbs, setBreadcrumbs] = useState<ItemDerived[]>([]);

  /** datum types */
  const types = flatMap(data, "type").filter(Boolean) as string[];

  /** map datum type to color */
  const colorMap = useColorMap(types, "mode");

  /** derive props */
  const derive = useCallback(
    (items: Item[]) => {
      const derive = (
        items: Item[],
        parentPercent = 1,
        parentIndexPath: ItemDerived["indexPath"] = [],
      ) => {
        const newItems: ItemDerived[] = [];

        /** total of children's values */
        const total = sumBy(items, "value");

        /** for each (child) item */
        for (let index = 0; index < items.length; index++) {
          const {
            type = "",
            label = "-",
            value,
            children = [],
          } = items[index]!;

          /** normalize value to percent of full circle that it takes up */
          const percent = parentPercent * (value / total) || 0;

          /** path of indices to get to this item through tree */
          const indexPath = [...parentIndexPath, index];

          /** are any items selected */
          const anySelected = !!breadcrumbs.length;
          /** is this item selected */
          const selected = !!breadcrumbs
            .at(-1)
            ?.indexPath?.join("-")
            ?.startsWith(indexPath.join("-"));

          /** item color */
          const color = colorMap[type]!;

          /** data point values and styles */
          newItems.push({
            label,
            value,
            percent,
            type,
            color,
            selected: anySelected ? selected : null,
            indexPath,

            /** do same thing for child items recursively */
            children: derive(children, percent, indexPath),
          });
        }
        return newItems;
      };

      return derive(items);
    },
    [colorMap, breadcrumbs],
  );

  /** derive data */
  const derived = derive(data);

  /** select item */
  const selectItem = useCallback<SegmentProps["selectItem"]>(
    ({ selected, indexPath }: Partial<ItemDerived>) => {
      /** is already selected */
      if (selected) {
        /** de-select */
        setBreadcrumbs([]);
      } else {
        /** select */
        const breadcrumbs: ItemDerived[] = [];
        /** start at root */
        let children = derived;
        /** get list of items from indices */
        for (const index of indexPath ?? []) {
          const breadcrumb = children[index]!;
          breadcrumbs.push(breadcrumb);
          children = breadcrumb.children;
        }
        setBreadcrumbs(breadcrumbs);
      }
    },
    [derived],
  );

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
              <svg className={classes["legend-color"]} viewBox="0 0 1 1">
                <rect x="0" y="0" width="1" height="1" fill={color} />
              </svg>
              <div className={clsx("truncate", !type && "secondary")}>
                {startCase(type) || "none"}
              </div>
            </Flex>
          ))}
        </div>

        {/* chart container */}
        <svg ref={svg} className={classes.chart}>
          <Segment children={derived} selectItem={selectItem} />
        </svg>

        {/* breadcrumbs */}
        {!!breadcrumbs.length && (
          <Flex gap="sm" gapRatio={1} className={classes.breadcrumbs}>
            {breadcrumbs.map((item, index) => (
              <ItemTooltip key={index} {...item}>
                <div
                  className={classes.breadcrumb}
                  style={{ background: item.color }}
                  tabIndex={0}
                  role="button"
                >
                  {formatPercent(item.percent)}{" "}
                  {truncate(item.label, { length: 20 })}
                </div>
              </ItemTooltip>
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
                onClick={() =>
                  container.current &&
                  downloadPng(container.current, "sunburst")
                }
                tooltip="High-resolution image"
              />
              <Button
                icon={<FaRegImage />}
                text="JPEG"
                onClick={() =>
                  container.current &&
                  downloadJpg(container.current, "sunburst")
                }
                tooltip="Compressed image"
              />
              <Button
                icon={<FaBezierCurve />}
                text="SVG"
                onClick={() =>
                  svg.current && downloadSvg(svg.current, "sunburst")
                }
                tooltip="Vector image"
              />
              <Button
                icon={<FaFilePdf />}
                text="PDF"
                onClick={() =>
                  container.current && printElement(container.current)
                }
                tooltip="Print as pdf"
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

type SegmentProps = Partial<ItemDerived> & {
  level?: number;
  startAngle?: number;
  endAngle?: number;
  selectItem: (item: Partial<ItemDerived>) => void;
};

/** single arc segment */
const Segment = ({
  level = 0,
  startAngle = 0,
  endAngle = 1,
  selectItem,
  ...item
}: SegmentProps) => {
  /** unique segment id */
  const id = useId();

  /** segment arc radius */
  const radius = (level + startLevel - 0.5) * ringSize;

  /** limit angles */
  startAngle = clamp(startAngle, 0, 0.9999) % 1;
  endAngle = clamp(endAngle, 0, 0.9999) % 1;

  /** get enclosed shape to fill */
  const fill = arcFill(
    radius - ringSize / 2,
    radius + ringSize / 2,
    startAngle,
    endAngle,
  );

  /** get stroke path, e.g. center-line of segment */
  const stroke = arcStroke(radius, startAngle, endAngle);

  /** get arc length */
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", stroke);
  const length = path.getTotalLength() / (fontSize / 1.5);

  /** track child angle */
  let offsetAngle = startAngle;

  /** reactive CSS vars */
  const theme = useTheme();

  return (
    <>
      {/* this segment */}
      {level > 0 && (
        <g
          className={classes.segment}
          opacity={item.selected === false ? 0.5 : 1}
        >
          {/* shape */}
          <ItemTooltip {...item}>
            <path
              className={classes.shape}
              fill={
                item.selected === false ? theme["--light-gray"] : item.color
              }
              stroke={theme["--white"]}
              strokeWidth={gapSize}
              d={fill}
              onClick={(event) => {
                /** prevent deselect from container onClick */
                event.stopPropagation();
                selectItem(item);
              }}
              tabIndex={0}
              role="button"
            />
          </ItemTooltip>

          {/* text path */}
          <path id={id} fill="none" d={stroke} />
          {/* text */}
          <text
            className={classes.label}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill={theme["--black"]}
          >
            <textPath href={`#${id}`} startOffset="50%">
              {truncate(`${formatPercent(item.percent)} ${item.label}`, {
                length,
              })}
            </textPath>
          </text>
        </g>
      )}

      {/* recursive children segments */}
      {item.children?.map((item, index) => (
        <Segment
          key={index}
          {...item}
          level={level + 1}
          startAngle={offsetAngle}
          endAngle={(offsetAngle = offsetAngle + item.percent)}
          children={item.children}
          selectItem={selectItem}
        />
      ))}
    </>
  );
};

/** x/y from radius/angle */
const point = (r: number, a: number) =>
  [sin(360 * a) * r, -cos(360 * a) * r].join(" ");

/** arc segment stroke path */
const arcStroke = (radius: number, start: number, end: number) => {
  const long = Math.abs(end - start) >= 0.5 ? 1 : 0;
  let cw = 1;

  /** flip upside-down text */
  const mid = (end + start) / 2;
  if (mid > 0.25 && mid < 0.75) {
    [start, end] = [end, start];
    cw = 0;
  }

  return `
    M ${point(radius, start)}
    A ${radius} ${radius} 0 ${long} ${cw} ${point(radius, end)}
  `;
};

/** arc segment fill shape */
const arcFill = (inner: number, outer: number, start: number, end: number) => {
  const long = Math.abs(end - start) >= 0.5 ? 1 : 0;
  return `
    M ${point(inner, start)}
    L ${point(outer, start)}
    A ${outer} ${outer} 0 ${long} 1 ${point(outer, end)}
    L ${point(inner, end)}
    A ${inner} ${inner} 0 ${long} 0 ${point(inner, start)}
    z
  `;
};

/** tooltip for data item */
const ItemTooltip = ({
  label,
  value,
  percent,
  type,
  children,
}: Omit<Partial<ItemDerived>, "children"> & { children: ReactElement }) => (
  <Tooltip
    content={
      <div className="mini-table">
        <div>Name</div>
        <div>{label}</div>
        <div>Value</div>
        <div>{formatNumber(value)}</div>
        <div>Percent</div>
        <div>{formatPercent(percent)}</div>
        <div>Type</div>
        <div>{type}</div>
      </div>
    }
  >
    {children}
  </Tooltip>
);

/** format 0-1 as % */
const formatPercent = (percent = 0) => `${(percent * 100).toFixed(0)}%`;
