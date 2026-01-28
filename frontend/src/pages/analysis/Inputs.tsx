import {
  ArrowRightToLine,
  ChartNoAxesGantt,
  Feather,
  Flame,
  TableIcon,
} from "lucide-react";
import Heading from "@/components/Heading";
import Tabs, { Tab } from "@/components/Tabs";
import { useAnalysis } from "@/pages/Analysis";
import DomainArch from "@/pages/analysis/inputs/DomainArch";
import Heatmap from "@/pages/analysis/inputs/Heatmap";
import Summary from "@/pages/analysis/inputs/Summary";
import Table from "@/pages/analysis/inputs/Table";

const Inputs = () => {
  const { status } = useAnalysis();

  return (
    <section>
      <Heading level={2} icon={<ArrowRightToLine />}>
        Inputs
      </Heading>

      {status?.type === "complete" ? (
        /** if complete, show all tabs */
        <Tabs syncWithUrl="input-tab">
          <Tab text="Summary" icon={<Feather />}>
            <Summary />
          </Tab>
          <Tab text="Table" icon={<TableIcon />}>
            <Table />
          </Tab>
          <Tab text="Heatmap" icon={<Flame />}>
            <Heatmap />
          </Tab>
          <Tab text="Domain Arch." icon={<ChartNoAxesGantt />}>
            <DomainArch />
          </Tab>
        </Tabs>
      ) : (
        /** otherwise, just show summary */
        <Summary />
      )}
    </section>
  );
};

export default Inputs;
