import type { Analysis } from "@/api/types";
import Ago from "@/components/Ago";
import Link from "@/components/Link";
import Mark from "@/components/Mark";
import type { Type } from "@/components/Mark";

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
      className="
        flex flex-col items-start gap-2 rounded-md border border-light-gray
        bg-white p-4
        hover:border-accent
      "
      showArrow={false}
    >
      <div className="font-bold">{name}</div>
      <div className="text-dark-gray">{type}</div>
      {info && <div className="text-dark-gray">{info}</div>}
      {started && <Ago className="text-dark-gray" date={started} />}
      {status && <Mark type={statusToMark[status.type]}>{status.info}</Mark>}
    </Link>
  );
};

export default AnalysisCard;
