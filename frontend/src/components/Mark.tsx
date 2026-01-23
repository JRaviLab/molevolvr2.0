import type { ReactElement, ReactNode } from "react";
import {
  LuCircleAlert,
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
} from "react-icons/lu";
import clsx from "clsx";
import Loading from "@/assets/loading.svg?react";
import Logo from "@/assets/logo.svg?react";

type Props = {
  /** category of alert, determines style */
  type?: keyof typeof types;
  /** manual icon */
  icon?: ReactElement;
  /** content next to icon */
  children: ReactNode;
  /** class on mark */
  className?: string;
};

/** available categories of marks and associated styles */
export const types = {
  info: { color: "var(--color-info)", icon: <LuInfo /> },
  loading: { color: "var(--color-gray)", icon: <Loading /> },
  success: { color: "var(--color-success)", icon: <LuCircleCheck /> },
  warning: { color: "var(--color-warning)", icon: <LuCircleAlert /> },
  error: { color: "var(--color-error)", icon: <LuTriangleAlert /> },
  analyzing: {
    color: "var(--color-deep-light)",
    icon: <Logo data-animated className="h-[1.5em]" />,
  },
};

/** mark type */
export type Type = keyof typeof types;

/** icon and text with color */
const Mark = ({ type = "info", icon, className, children }: Props) => (
  <div
    className={clsx("inline-flex items-center gap-4", className)}
    style={{ color: types[type].color }}
  >
    {icon ?? types[type].icon}
    <div>{children}</div>
  </div>
);

export default Mark;
