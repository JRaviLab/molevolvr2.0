import type { ComponentProps, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { Link as RouterLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip";
import classes from "./Link.module.css";

type Base = {
  /** force link opening in new/same tab */
  newTab?: boolean;
  /** force showing/hiding arrow icon */
  showArrow?: boolean;
  /** tooltip content */
  tooltip?: ReactNode;
  /** class */
  className?: string;
  /** content */
  children: ReactNode;
};

type _Anchor = ComponentProps<"a"> & { to: string };
type _Router = ComponentProps<typeof RouterLink>;

type Props = Base & (_Anchor | _Router);

/** link to internal route or external url */
const Link = forwardRef(
  (
    { to, children, newTab, showArrow, tooltip, className, ...props }: Props,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    const { state } = useLocation();

    /** whether link is external (some other site) or internal (within router) */
    const external = typeof to === "string" && to.startsWith("http");

    /** whether to open link in new tab */
    const target = (newTab ?? external) ? "_blank" : "";

    /** whether to show arrow icon */
    const _showArrow = showArrow ?? target;

    /** full element to render */
    const element = external ? (
      <a
        ref={ref}
        href={to}
        target={target}
        className={clsx(classes.link, className)}
        {...props}
      >
        {children}
        {_showArrow && <FaArrowUpRightFromSquare className={classes.icon} />}
      </a>
    ) : (
      <RouterLink
        ref={ref}
        to={to}
        target={target}
        className={clsx(classes.link, className)}
        /** preserve state */
        state={state}
        {...props}
      >
        {children}
        {_showArrow && <FaArrowUpRightFromSquare className={classes.icon} />}
      </RouterLink>
    );

    return <Tooltip content={tooltip}>{element}</Tooltip>;
  },
);

export default Link;
