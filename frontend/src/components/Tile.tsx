import type { ReactElement, ReactNode } from "react";

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
      <div className="mb-2 flex text-2xl">{icon}</div>
      <div className="text-lg leading-none font-medium">{primary}</div>
      <div className="text-dark-gray">{secondary}</div>
    </div>
  );
};

export default Tile;
