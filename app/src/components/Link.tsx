import type { ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { Link as RouterLink } from "react-router-dom";
import Tooltip from "@/components/Tooltip";
import classes from "./Link.module.css";

type Props = {
  /** url to link to, local or external */
  to: string;
  /** force-disable arrow icon for external links */
  noIcon?: boolean;
  /** tooltip content */
  tooltip?: ReactNode;
  /** class */
  className?: string;
  /** content */
  children: ReactNode;
};

/** link to internal route or external url */
const Link = forwardRef(
  (
    { to, children, noIcon, tooltip, ...props }: Props,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    /** whether link is external (some other site) or internal (within router) */
    const external = to.startsWith("http");

    /** full element to render */
    const element = external ? (
      <a ref={ref} href={to} target={external ? "_blank" : ""} {...props}>
        {children}
        {!noIcon && <FaArrowUpRightFromSquare className={classes.icon} />}
      </a>
    ) : (
      <RouterLink ref={ref} to={to} {...props}>
        {children}
      </RouterLink>
    );

    return <Tooltip content={tooltip}>{element}</Tooltip>;
  },
);

export default Link;
