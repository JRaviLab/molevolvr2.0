import type { ReactNode } from "react";
import clsx from "clsx";
import Flex from "@/components/Flex";
import classes from "./Section.module.css";

type Props = {
  /** highlighted background color */
  fill?: boolean;
  /** contents fill full available screen width */
  full?: boolean;
  /** class on section */
  className?: string;
  /** section content */
  children: ReactNode;
};

/**
 * vertically stacked section. background color spans full width of screen, but
 * contents limited to a readable width by default. alternating background
 * colors. do not nest sections.
 */
const Section = ({ fill, full, className, ...props }: Props) => (
  <Flex
    tag="section"
    direction="column"
    gap="lg"
    vAlign="top"
    className={clsx(classes.section, className, {
      [classes.fill!]: fill,
      [classes.full!]: full,
    })}
    {...props}
  />
);

export default Section;
