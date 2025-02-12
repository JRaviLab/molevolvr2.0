import {
  useCallback,
  useEffect,
  useId,
  useMemo,
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
import { arc } from "d3";
import { inRange, startCase, sumBy, truncate } from "lodash";
import { useDebounce, useElementSize } from "@reactuses/core";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { useColorMap } from "@/util/color";
import { fitViewBox, printElement } from "@/util/dom";
import { downloadJpg, downloadPng, downloadSvg } from "@/util/download";
import { useTheme } from "@/util/hooks";
import { flatMap } from "@/util/object";
import { formatNumber } from "@/util/string";
import classes from "./Sunburst.module.css";

const docFontSize = parseFloat(window.getComputedStyle(document.body).fontSize);

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
  lastSelected: boolean | null;
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

const Sunburst = ({ title, data }: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  /** font size, in svg units */
  const [fontSize, setFontSize] = useState(16);

  /** height of svg, in client units */
  const clientHeight = useDebounce(useElementSize(svg)[1], 300);

  useEffect(() => {
    if (!svg.current) return;

    /** fit view box */
    const viewBox = fitViewBox(svg.current, 0.01);

    /** scale svg font size to match document font size */
    setFontSize(viewBox.height * (docFontSize / clientHeight));
  }, [clientHeight]);

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

          /** is this item outer-most selected */
          const lastSelected =
            breadcrumbs.at(-1)?.indexPath?.join("-") === indexPath?.join("-");

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
            lastSelected: anySelected ? lastSelected : null,
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
    ({ indexPath, lastSelected }: Partial<ItemDerived>) => {
      /** is outer-most selected */
      if (lastSelected) {
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
      {/* eslint-disable-next-line */}
      <div
        ref={container}
        className={clsx("card", classes.container)}
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
          <Segment
            children={derived}
            selectItem={selectItem}
            fontSize={fontSize}
          />
        </svg>

        {/* breadcrumbs */}
        {!!breadcrumbs.length && (
          <Flex
            className={classes.breadcrumbs}
            gap="sm"
            gapRatio={1}
            direction="column"
            hAlign="right"
            vAlign="top"
          >
            {breadcrumbs.map((item, index) => (
              <ItemTooltip key={index} {...item}>
                <div
                  className={classes.breadcrumb}
                  style={{ background: item.color }}
                  tabIndex={0}
                  role="button"
                >
                  {formatPercent(item.percent)} {item.label}
                </div>
              </ItemTooltip>
            ))}
          </Flex>
        )}
      </div>
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
  fontSize: number;
  level?: number;
  startAngle?: number;
  endAngle?: number;
  selectItem: (item: Partial<ItemDerived>) => void;
};

/** single arc segment */
const Segment = ({
  fontSize,
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

  /** get enclosed shape to fill */
  const fill = useMemo(
    () =>
      arc<null>()
        .innerRadius(radius - ringSize / 2 + gapSize / 2)
        .outerRadius(radius + ringSize / 2 - gapSize / 2)
        .startAngle(startAngle * 2 * Math.PI)
        .endAngle(endAngle * 2 * Math.PI)
        .padRadius(gapSize)
        .padAngle(1)(null) ?? "",
    [radius, startAngle, endAngle],
  );

  /** get stroke path */
  const stroke = useMemo(() => {
    /** if angle midpoint in lower half of circle, flip text so not upside down */
    const flip = inRange((startAngle + endAngle) / 2, 0.25, 0.75);

    let stroke =
      arc<null>()
        .innerRadius(radius)
        .outerRadius(radius - Infinity)
        .startAngle((flip ? endAngle : startAngle) * 2 * Math.PI)
        .endAngle((flip ? startAngle : endAngle) * 2 * Math.PI)
        .padRadius(gapSize)
        .padAngle(1)(null) ?? "";

    /** extract just first part of path, center-line of segment */
    stroke = stroke.slice(0, stroke.indexOf("L"));

    return stroke;
  }, [radius, startAngle, endAngle]);

  /** get max text chars based on arc length */
  const maxChars =
    (radius * 2 * Math.PI * (endAngle - startAngle)) / (fontSize / 1.5);

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
          opacity={item.selected === false ? 0.35 : 1}
        >
          {/* shape */}
          <ItemTooltip {...item}>
            <path
              className={classes.shape}
              fill={
                item.selected === false ? theme["--light-gray"] : item.color
              }
              stroke={theme["--black"]}
              strokeWidth={gapSize / 2}
              strokeOpacity={item.lastSelected === true ? 1 : 0}
              d={fill}
              tabIndex={0}
              role="button"
              onClick={(event) => {
                /** prevent deselect from container onClick */
                event.stopPropagation();
                selectItem(item);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  selectItem(item);
                }
              }}
            />
          </ItemTooltip>

          {/* text path */}
          <path id={id} fill="none" d={stroke} />
          {/* text */}
          <text
            className={classes.label}
            textAnchor="middle"
            // dominantBaseline="central"
            dy="0.55ex"
            fontSize={fontSize}
            fill={theme["--black"]}
          >
            <textPath href={`#${id}`} startOffset="50%">
              {truncate(`${formatPercent(item.percent)} ${item.label}`, {
                length: maxChars,
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
          fontSize={fontSize}
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
