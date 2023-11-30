import type { ReactElement, ReactNode } from "react";
import classNames from "classnames";
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
    <div className={classes.tile}>
      {icon}
      <div>
        <div className={classNames(classes.primary, "bold")}>{primary}</div>
        <div className="secondary">{secondary}</div>
      </div>
    </div>
  );
};

export default Tile;
