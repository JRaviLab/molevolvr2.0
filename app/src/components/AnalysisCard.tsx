import clsx from "clsx";
import type { Analysis } from "@/api/types";
import Ago from "@/components/Ago";
import Link from "@/components/Link";
import Mark, { type Type } from "@/components/Mark";
import classes from "./AnalysisCard.module.css";

type Props = {
  analysis: Analysis;
};

/** summary card for analysis */
const AnalysisCard = ({
  analysis: { id, name, type, info, started, status },
}: Props) => {
  /** analysis status type to mark type */
  const statusToMark: Record<NonNullable<Analysis["status"]>["type"], Type> = {
    analyzing: "loading",
    complete: "success",
    error: "error",
  };

  return (
    <Link
      to={`/analysis/${id}`}
      className={clsx(classes.card, "card")}
      showArrow={false}
    >
      <div className="bold">{name}</div>
      <div className="secondary">{type}</div>
      {info && <div className="secondary">{info}</div>}
      {started && <Ago className="secondary" date={started} />}
      {status && <Mark type={statusToMark[status.type]}>{status.info}</Mark>}
    </Link>
  );
};

export default AnalysisCard;
