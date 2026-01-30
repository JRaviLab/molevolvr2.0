import {
  LuArrowRightToLine,
  LuChartNoAxesGantt,
  LuFeather,
  LuFlame,
  LuTable,
} from "react-icons/lu";
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
      <Heading level={2} icon={<LuArrowRightToLine />}>
        Inputs
      </Heading>

      {status?.type === "complete" ? (
        /** if complete, show all tabs */
        <Tabs syncWithUrl="input-tab">
          <Tab text="Summary" icon={<LuFeather />}>
            <Summary />
          </Tab>
          <Tab text="Table" icon={<LuTable />}>
            <Table />
          </Tab>
          <Tab text="Heatmap" icon={<LuFlame />}>
            <Heatmap />
          </Tab>
          <Tab text="Domain Arch." icon={<LuChartNoAxesGantt />}>
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
