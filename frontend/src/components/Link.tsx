import type { ComponentProps, ReactNode } from "react";
import type { To } from "react-router";
import { resolvePath, Link as RouterLink, useLocation } from "react-router";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import Tooltip from "@/components/Tooltip";

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
  /** current route */
  const location = useLocation();

  /** whether link is external (some other site) or internal (within router) */
  const external = typeof to === "string" && to.match(/^(http|mailto)/);

  /** whether to open link in new tab */
  const target = (newTab ?? external) ? "_blank" : "";

  /** whether to show arrow icon */
  const _showArrow = showArrow ?? target;

  /** class name string */
  const _class = clsx("inline-flex items-center gap-1", className);

  /** full element to render */
  const element = external ? (
    /** "external" plain link */
    <a ref={ref} href={to} target={target} className={_class} {...props}>
      {children}
      {_showArrow && <ExternalLink />}
    </a>
  ) : (
    /** "internal" router link */
    <RouterLink
      ref={ref}
      to={mergeTo(location, to)}
      state={mergeState(
        location.state,
        "state" in props ? props.state : undefined,
      )}
      target={target}
      className={_class}
      {...props}
    >
      {children}
      {_showArrow && <ExternalLink />}
    </RouterLink>
  );

  return <Tooltip content={tooltip}>{element}</Tooltip>;
};

export default Link;

/** string to signify that param should be removed from url search */
export const deleteParam = "undefined";

/**
 * combine url search params. keep all old keys (except ones explicitly
 * deleted), add new keys (overwriting).
 */
const mergeSearch = (a = "", b = "") => {
  const aSearch = new URLSearchParams(a);
  const bSearch = new URLSearchParams(b);
  for (const [key, value] of bSearch) {
    if (value === deleteParam) aSearch.delete(key);
    else aSearch.set(key, value);
  }
  return "?" + aSearch.toString();
};

/** combine urls, preserving parts where appropriate */
export const mergeTo = (a: To, b: To) => {
  /** normalize to path instead of string */
  a = resolvePath(a);
  b = resolvePath(b);

  /** preserve parts of url */
  const path = {
    /** use old path unless new one defined or to root */
    pathname:
      b.pathname !== "/" || (b.pathname === "/" && !b.search && !b.hash)
        ? b.pathname
        : a.pathname,
    search: mergeSearch(a.search, b.search),
    /** keep old hash unless new one defined. always use new if path changed. */
    hash: b.hash || b.pathname !== a.pathname ? b.hash : a.hash,
  };

  return path;
};

/** merge state entries */
const mergeState = (a: object = {}, b: object = {}) => ({ ...a, ...b });
