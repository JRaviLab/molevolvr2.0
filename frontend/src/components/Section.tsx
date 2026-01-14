import type { ReactNode } from "react";

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
  <section {...props} />
);

export default Section;
