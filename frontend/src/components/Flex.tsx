import type { ComponentProps, CSSProperties } from "react";
import { useMediaQuery } from "@reactuses/core";

type TagNames = keyof HTMLElementTagNameMap;

type Props<TagName extends TagNames = "div"> = {
  /** tag name */
  tag?: TagNames;
  /** flex display (whether container takes up full width) */
  inline?: boolean;
  /** vertical layout instead of horizontal */
  column?: boolean;
  /** amount of space between items */
  gap?: "md" | "none" | "xs" | "sm" | "lg" | "xl";
  /** vertical gap fraction of horizontal gap */
  gapRatio?: 1 | 0.5 | 0.25 | 0;
  /** whether to wrap items */
  wrap?: boolean;
  /** whether to make full width */
  full?: boolean;
  /** horizontal alignment */
  hAlign?: "center" | "left" | "right" | "stretch" | "space";
  /** vertical alignment */
  vAlign?: "center" | "top" | "bottom" | "stretch" | "space";
  /** if screen width below this, change direction to col */
  breakpoint?: number;
} & ComponentProps<TagName>;

const alignMap: Record<
  NonNullable<Props["hAlign"] | Props["vAlign"]>,
  string
> = {
  center: "center",
  left: "flex-start",
  top: "flex-start",
  right: "flex-end",
  bottom: "flex-end",
  stretch: "stretch",
  space: "space-between",
};

const gapMap: Record<NonNullable<Props["gap"]>, number> = {
  none: 0,
  xs: 5,
  sm: 10,
  md: 20,
  lg: 40,
  xl: 60,
};

const Flex = <TagName extends TagNames>({
  ref,
  tag: Tag = "div",
  inline = false,
  column = false,
  gap = "md",
  gapRatio = 1,
  wrap = true,
  full = false,
  hAlign = "center",
  vAlign = "center",
  breakpoint = 0,
  style = {},
  ...props
}: Props<TagName>) => {
  const belowBreakpoint = useMediaQuery(`(max-width: ${breakpoint}px)`);

  const flexStyles: CSSProperties = {
    display: inline ? "inline-flex" : "flex",
    flexDirection: column || belowBreakpoint ? "column" : "row",
    justifyContent: column ? alignMap[vAlign] : alignMap[hAlign],
    alignItems: column ? alignMap[hAlign] : alignMap[vAlign],
    flexWrap: wrap && !column ? "wrap" : "nowrap",
    gap: `${gapMap[gap] * gapRatio}px ${gapMap[gap]}px`,
    width: full ? "100%" : undefined,
    ...style,
  };

  // @ts-expect-error ts not smart enough here
  return <Tag ref={ref} style={flexStyles} {...props} />;
};

export default Flex;
