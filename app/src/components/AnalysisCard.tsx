import classNames from "classnames";
import type { Analysis } from "@/api/types";
import Ago from "@/components/Ago";
import Link from "@/components/Link";
import classes from "./AnalysisCard.module.css";

type Props = {
  analysis: Analysis;
};

/** summary card for analysis */
const AnalysisCard = ({
  analysis: { id, name, type, info, started },
}: Props) => {
  return (
    <Link
      to={`/analysis/${id}`}
      className={classNames(classes.card, "card")}
      noIcon={true}
    >
      <div className="bold">{name}</div>
      <div className="secondary">{type}</div>
      {info && <div className="secondary">{info}</div>}
      {started && <Ago className="secondary" date={started} />}
    </Link>
  );
};

export default AnalysisCard;
