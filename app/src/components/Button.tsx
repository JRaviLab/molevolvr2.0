import type {
  ComponentProps,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from "react";
import { cloneElement, forwardRef } from "react";
import classNames from "classnames";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import classes from "./Button.module.css";

type Base = {
  /** icon to show next to text */
  icon?: ReactElement;
  /** look */
  design?: "normal" | "accent" | "critical";
};

type Description =
  /** require text and/or tooltip for accessibility */
  { text: string; tooltip?: ReactNode } | { text?: string; tooltip: ReactNode };

/** <a> or <RouterLink> */
type Link = ComponentProps<typeof Link>;
/** <button> */
type _Button = ComponentProps<"button">;

type Props = Base & Description & (Link | _Button);

/**
 * looks like a button and either goes somewhere (<a>) or does something
 * (<button>)
 */
const Button = forwardRef(
  (
    { text, icon, design = "normal", className, tooltip, ...props }: Props,
    ref,
  ) => {
    /** contents of main element */
    const children = (
      <>
        {text}
        {icon && cloneElement(icon, { className: "icon" })}
      </>
    );

    /** class name string */
    const _class = classNames(className, classes.button, classes[design], {
      [classes.square!]: !text && !!icon,
    });

    /** if "to", render as link */
    if ("to" in props)
      return (
        <Link
          ref={ref as ForwardedRef<HTMLAnchorElement>}
          className={_class}
          tooltip={tooltip}
          noIcon={true}
          {...(props as Link)}
        >
          {children}
        </Link>
      );
    /** otherwise, render as button */ else
      return (
        <Tooltip content={tooltip}>
          <button
            ref={ref as ForwardedRef<HTMLButtonElement>}
            className={_class}
            type="button"
            {...(props as _Button)}
          >
            {children}
          </button>
        </Tooltip>
      );
  },
);

export default Button;
