import {
  forwardRef,
  type ComponentProps,
  type CSSProperties,
  type ForwardedRef,
} from "react";
import { useMediaQuery } from "@reactuses/core";

type TagNames = keyof HTMLElementTagNameMap;

type Props<TagName extends TagNames = "div"> = {
  /** tag name */
  tag?: TagNames;
  /** flex display (whether container takes up full width) */
  display?: "block" | "inline";
  /** horizontal or vertical */
  direction?: "row" | "column";
  /** amount of space between items */
  gap?: "md" | "none" | "xs" | "sm" | "lg" | "xl";
  /** vertical gap fraction of horizontal gap */
  gapRatio?: 1 | 0.5;
  /** whether to wrap items */
  wrap?: true | false;
  /** whether to make full width */
  full?: true | false;
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

const Flex = forwardRef(
  <TagName extends TagNames>(
    {
      tag: Tag = "div",
      display = "block",
      direction = "row",
      gap = "md",
      gapRatio = 1,
      wrap = true,
      full = false,
      hAlign = "center",
      vAlign = "center",
      breakpoint = 0,
      style = {},
      ...props
    }: Props<TagName>,
    ref: ForwardedRef<HTMLElementTagNameMap[TagName]>,
  ) => {
    const belowBreakpoint = useMediaQuery(`(max-width: ${breakpoint}px)`);

    const flexStyles: CSSProperties = {
      display: display === "block" ? "flex" : "inline-flex",
      flexDirection:
        direction === "column" || belowBreakpoint ? "column" : "row",
      justifyContent:
        direction === "column" ? alignMap[vAlign] : alignMap[hAlign],
      alignItems: direction === "column" ? alignMap[hAlign] : alignMap[vAlign],
      flexWrap: wrap && direction === "row" ? "wrap" : "nowrap",
      gap: `${gapMap[gap] * gapRatio}px ${gapMap[gap]}px`,
      width: full ? "100%" : undefined,
      ...style,
    };

    // @ts-expect-error ts not smart enough here
    return <Tag ref={ref} style={flexStyles} {...props} />;
  },
);

export default Flex;
