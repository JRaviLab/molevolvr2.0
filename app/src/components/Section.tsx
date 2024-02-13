import type { ReactNode } from "react";
import classNames from "classnames";
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
const Section = ({ fill, full, className, ...props }: Props) => {
  return (
    <section
      className={classNames(
        classes.section,
        className,
        {
          [classes.fill!]: fill,
          [classes.full!]: full,
        },
        "flex-col gap-lg",
      )}
      {...props}
    />
  );
};

export default Section;
