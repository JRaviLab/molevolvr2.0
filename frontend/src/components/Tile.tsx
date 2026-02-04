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
    <div
      className="
        flex w-min flex-col items-center gap-2 text-center text-deep-light
      "
    >
      <div className="mb-2 flex text-2xl">{icon}</div>
      <div className="text-lg/normal font-medium">{primary}</div>
      <div className="text-dark-gray">{secondary}</div>
    </div>
  );
};

export default Tile;
