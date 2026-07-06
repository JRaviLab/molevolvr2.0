import type { Analysis } from "@/api/types";
import type { Type } from "@/components/Mark";
import Ago from "@/components/Ago";
import Link from "@/components/Link";
import Mark from "@/components/Mark";

type Props = {
  analysis: Analysis;
};

/** summary card for analysis */
export default function AnalysisCard({
  analysis: { id, name, type, info, started, status },
}: Props) {
  /** analysis status type to mark type */
  const statusToMark: Record<NonNullable<Analysis["status"]>["type"], Type> = {
    analyzing: "loading",
    complete: "success",
    error: "error",
  };

  return (
    <Link
      to={`/analysis/${id}`}
      className="flex flex-col items-start gap-2 rounded-md border border-light-gray p-4 text-current no-underline hover:border-accent"
      showArrow={false}
    >
      <div className="font-medium">{name}</div>
      <div className="text-gray">{type}</div>
      {info && <div className="text-gray">{info}</div>}
      {started && <Ago className="text-gray" date={started} />}
      {status && <Mark type={statusToMark[status.type]}>{status.info}</Mark>}
    </Link>
  );
}
