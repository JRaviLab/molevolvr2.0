import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaTriangleExclamation,
} from "react-icons/fa6";
import Flex from "@/components/Flex";
import classes from "./Mark.module.css";

type Props = {
  /** category of alert, determines style */
  type?: keyof typeof types;
  /** manual icon */
  icon?: ReactElement;
  /** content next to icon */
  children: ReactNode;
};

/** available categories of alerts and associated styles */
const types = {
  info: { color: "var(--deep)", icon: <></> },
  success: { color: "var(--success)", icon: <FaCircleCheck /> },
  warning: { color: "var(--warning)", icon: <FaCircleExclamation /> },
  error: { color: "var(--error)", icon: <FaTriangleExclamation /> },
};

/** icon and text with color */
const Mark = ({ type = "info", icon, children }: Props) => (
  <Flex
    display="inline"
    gap="sm"
    wrap={false}
    className={classes.mark}
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
