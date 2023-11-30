import { FaMagnifyingGlassChart } from "react-icons/fa6";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Heading from "@/components/Heading";
import Section from "@/components/Section";
import { useAnalysis } from "@/pages/Analysis";

const Overview = () => {
  const { id, name, type, started, status } = useAnalysis();

  return (
    <Section>
      <Heading level={1} icon={<FaMagnifyingGlassChart />}>
        {name}
      </Heading>

      <div className="mini-table">
        <span>ID</span>
        <span>{id}</span>
        <span>Type</span>
        <span>{type}</span>
        <span>Submitted</span>
        <Ago date={started} />
      </div>

      {status?.type === "analyzing" && (
        <Alert type="loading">{status.info}</Alert>
      )}
      {status?.type === "error" && <Alert type="error">{status.info}</Alert>}
    </Section>
  );
};

export default Overview;
