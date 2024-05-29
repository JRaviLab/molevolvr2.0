import type { ComponentProps, CSSProperties } from "react";
import { useMedia } from "react-use";

type TagNames = keyof HTMLElementTagNameMap;

type Props<T extends TagNames = "div"> = {
  /** tag name */
  tag?: TagNames;
  /** flex display (whether container takes up full width) */
  display?: "block" | "inline";
  /** horizontal or vertical */
  direction?: "row" | "column";
  /** amount of space between items */
  gap?: "md" | "none" | "xs" | "sm" | "lg" | "xl";
  /** whether to wrap items */
  wrap?: true | false;
  /** horizontal alignment */
  hAlign?: "center" | "left" | "right" | "stretch" | "space";
  /** vertical alignment */
  vAlign?: "center" | "top" | "bottom" | "stretch" | "space";
  /** if screen width below this, change direction to col */
  breakpoint?: number;
} & ComponentProps<T>;

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

const Flex = <T extends TagNames>({
  tag: Tag = "div",
  display = "block",
  direction = "row",
  gap = "md",
  wrap = true,
  hAlign = "center",
  vAlign = "center",
  breakpoint = 0,
  style = {},
  ...props
}: Props<T>) => {
  const belowBreakpoint = useMedia(`(max-width: ${breakpoint}px)`);

  const flexStyles: CSSProperties = {
    display: display === "block" ? "flex" : "inline-flex",
    flexDirection: direction === "column" || belowBreakpoint ? "column" : "row",
    justifyContent:
      direction === "column" ? alignMap[vAlign] : alignMap[hAlign],
    alignItems: direction === "column" ? alignMap[hAlign] : alignMap[vAlign],
    flexWrap: wrap && direction === "row" ? "wrap" : "nowrap",
    gap: gapMap[gap],
    ...style,
  };

  // @ts-expect-error ts not smart enough here
  return <Tag style={flexStyles} {...props} />;
};

export default Flex;
