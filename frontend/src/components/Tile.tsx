import type { ReactElement, ReactNode } from "react";
import clsx from "clsx";
import Flex from "@/components/Flex";
import classes from "./Tile.module.css";

type Props = {
  /** icon element */
  icon: ReactElement;
  /** primary content */
  primary: ReactNode;
  /** secondary content */
  secondary: ReactNode;
};

/** big icon and primary and secondary content/text */
const Tile = ({ icon, primary, secondary }: Props) => {
  return (
    <Flex column className={classes.tile}>
      {icon}
      <div>
        <div className={clsx("bold", classes.primary)}>{primary}</div>
        <div className="secondary">{secondary}</div>
      </div>
    </Flex>
  );
};

export default Tile;
