import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";
import clsx from "clsx";
import Loading from "@/assets/loading.svg?react";
import Logo from "@/assets/logo.svg?react";
import Flex from "@/components/Flex";
import classes from "./Mark.module.css";

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
  info: { color: "var(--info)", icon: <FaCircleInfo /> },
  loading: { color: "var(--gray)", icon: <Loading /> },
  success: { color: "var(--success)", icon: <FaCircleCheck /> },
  warning: { color: "var(--warning)", icon: <FaCircleExclamation /> },
  error: { color: "var(--error)", icon: <FaTriangleExclamation /> },
  analyzing: {
    color: "var(--deep-light)",
    icon: <Logo data-animated style={{ height: "1.5em" }} />,
  },
};

/** mark type */
export type Type = keyof typeof types;

/** icon and text with color */
const Mark = ({ type = "info", icon, className, children }: Props) => (
  <Flex
    inline
    gap="sm"
    wrap={false}
    className={clsx(className, classes.mark)}
    style={{ "--color": types[type].color } as CSSProperties}
  >
    {icon ?? types[type].icon}
    <div>{children}</div>
  </Flex>
);

export default Mark;

/** mark, but only yes/no */
export const YesNo = (yes: boolean) => (
  <Mark type={yes ? "success" : "error"}>{yes ? "Yes" : "No"}</Mark>
);
