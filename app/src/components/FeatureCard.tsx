import type { ReactNode } from "react";
import classNames from "classnames";
import Badge from "@/components/Badge";
import classes from "./FeatureCard.module.css";

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
    <div className={classNames(classes.card, "card")}>
      <div className={classes.title}>
        <span className="primary">{title}</span>
        {badge && <Badge className={classes.badge}>{badge}</Badge>}
      </div>
      {content}
    </div>
  );
};

export default FeatureCard;
