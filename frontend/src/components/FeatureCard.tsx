import type { ReactNode } from "react";
import clsx from "clsx";
import Badge from "@/components/Badge";
import Flex from "@/components/Flex";
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
    <Flex column className={clsx("card", classes.card)}>
      <Flex wrap={false} gap="sm" className={clsx("full", classes.title)}>
        <span className="primary">{title}</span>
        {badge && <Badge className={classes.badge}>{badge}</Badge>}
      </Flex>
      {content}
    </Flex>
  );
};

export default FeatureCard;
