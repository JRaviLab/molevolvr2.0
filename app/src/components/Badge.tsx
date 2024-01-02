import type { ReactNode } from "react";
import classNames from "classnames";
import classes from "./Badge.module.css";

type Props = {
  /** class on badge */
  className?: string;
  /** few chars of text or small icon */
  children: ReactNode;
};

/**
 * small circle with a few chars of text. for use in other components, not
 * directly.
 */
const Badge = ({ className, children }: Props) => {
  return (
    <span className={classNames(classes.badge, className)} aria-hidden="true">
      {children}
    </span>
  );
};

export default Badge;
