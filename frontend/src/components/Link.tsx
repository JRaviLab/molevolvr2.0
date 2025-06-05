import type { ComponentProps, ReactNode } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { Link as RouterLink, useLocation } from "react-router";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip";
import classes from "./Link.module.css";

type Props = Base & (_Anchor | _Router);

type Base = {
  /** force link opening in new/same tab */
  newTab?: boolean;
  /** force showing/hiding arrow icon */
  showArrow?: boolean;
  /** tooltip content */
  tooltip?: ReactNode;
  /** class on link */
  className?: string;
  /** content */
  children: ReactNode;
};

type _Anchor = ComponentProps<"a"> & { to: string };
type _Router = ComponentProps<typeof RouterLink>;

/** link to internal route or external url */
const Link = ({
  ref,
  to,
  children,
  newTab,
  showArrow,
  tooltip,
  className,
  ...props
}: Props) => {
  const { state } = useLocation();

  /** whether link is external (some other site) or internal (within router) */
  const external = typeof to === "string" && to.match(/^(http|mailto)/);

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
      className={clsx(className, classes.link)}
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
      className={clsx(className, classes.link)}
      /** preserve state */
      state={state}
      {...props}
    >
      {children}
      {_showArrow && <FaArrowUpRightFromSquare className={classes.icon} />}
    </RouterLink>
  );

  return <Tooltip content={tooltip}>{element}</Tooltip>;
};

export default Link;
