import type { ReactNode } from "react";

type Props = {
  /** top content */
  title: ReactNode;
  /** badge text or icon */
  badge?: ReactNode;
  /** main content */
  content: ReactNode;
};

/** card with title, badge, and text/image */
export default function FeatureCard({ title, badge, content }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-white p-4 shadow-md">
      <div className="flex items-center gap-2">
        <span className="grow font-medium">{title}</span>
        {badge && (
          <span className="grid size-8 place-items-center rounded-full bg-pale text-[1rem] font-bold text-deep">
            {badge}
          </span>
        )}
      </div>
      {content}
    </div>
  );
}
