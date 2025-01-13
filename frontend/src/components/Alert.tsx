import type { ComponentProps } from "react";
import clsx from "clsx";
import Mark from "@/components/Mark";
import classes from "./Alert.module.css";

/** static box of certain type with icon and text contents */
const Alert = ({ className, ...props }: ComponentProps<typeof Mark>) => {
  return <Mark className={clsx(classes.alert, className)} {...props}></Mark>;
};

export default Alert;
