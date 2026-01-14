import { cloneElement, type ReactElement, type ReactNode } from "react";

type Props = {
  /** icon element */
  icon: ReactElement<{ className?: string }>;
  /** primary content */
  primary: ReactNode;
  /** secondary content */
  secondary: ReactNode;
};

/** big icon and primary and secondary content/text */
const Tile = ({ icon, primary, secondary }: Props) => {
  return (
    <div className="text-deep flex w-min flex-col items-center gap-2 text-center">
      {cloneElement(icon, { className: "size-8 mb-2" })}
      <div className="text-lg leading-none font-medium">{primary}</div>
      <div className="text-dark-gray">{secondary}</div>
    </div>
  );
};

export default Tile;
