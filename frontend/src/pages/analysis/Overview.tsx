import { FileChartPie } from "lucide-react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import { H1 } from "@/components/Heading";
import { useAnalysis } from "@/pages/Analysis";

export default function Overview() {
  const { id, name, type, started, status } = useAnalysis();

  return (
    <section className="items-center">
      <H1 icon={<FileChartPie />}>{name}</H1>

      <dl>
        <dt>ID</dt>
        <dd>{id}</dd>
        <dt>Type</dt>
        <dd>{type}</dd>
        <dt>Submitted</dt>
        <dd>
          <Ago date={started} />
        </dd>
      </dl>

      {status?.type === "analyzing" && (
        <Alert type="loading">{status.info}</Alert>
      )}
      {status?.type === "error" && <Alert type="error">{status.info}</Alert>}
    </section>
  );
}
