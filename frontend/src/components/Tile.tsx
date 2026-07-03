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
export default function Tile({ icon, primary, secondary }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-deep">
      <div className="mb-2 flex text-4xl">{icon}</div>
      <div className="text-xl font-medium">{primary}</div>
      <div className="text-lg text-dark-gray">{secondary}</div>
    </div>
  );
}
