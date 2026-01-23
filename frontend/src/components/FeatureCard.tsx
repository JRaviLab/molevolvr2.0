import type { ReactNode } from "react";
import Badge from "@/components/Badge";

type Props = {
  /** top content */
  title: ReactNode;
  /** badge text or icon */
  badge?: ReactNode;
  /** main content */
  content: ReactNode;
};

/** card with title, badge, and text/image */
const FeatureCard = ({ title, badge, content }: Props) => {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grow font-medium">{title}</span>
        {badge && <Badge>{badge}</Badge>}
      </div>
      {content}
    </div>
  );
};

export default FeatureCard;
