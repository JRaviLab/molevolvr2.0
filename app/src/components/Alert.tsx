import type { ComponentProps } from "react";
import Mark from "@/components/Mark";
import classes from "./Alert.module.css";

/** static box of certain type with icon and text contents */
const Alert = (props: ComponentProps<typeof Mark>) => {
  return <Mark className={classes.alert} {...props}></Mark>;
};

export default Alert;
