import { FileChartPie } from "lucide-react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Heading from "@/components/Heading";
import { useAnalysis } from "@/pages/Analysis";

const Overview = () => {
  const { id, name, type, started, status } = useAnalysis();

  return (
    <section>
      <Heading level={1} icon={<FileChartPie />}>
        {name}
      </Heading>

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
};

export default Overview;
