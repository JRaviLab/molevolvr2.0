import {
  FaArrowRightToBracket,
  FaBarsStaggered,
  FaFeatherPointed,
  FaFireFlameSimple,
  FaTableCells,
} from "react-icons/fa6";
import Heading from "@/components/Heading";
import Section from "@/components/Section";
import Tabs, { Tab } from "@/components/Tabs";
import { useAnalysis } from "@/pages/Analysis";
import DomainArch from "@/pages/analysis/inputs/DomainArch";
import Heatmap from "@/pages/analysis/inputs/Heatmap";
import Summary from "@/pages/analysis/inputs/Summary";
import Table from "@/pages/analysis/inputs/Table";

const Inputs = () => {
  const { status } = useAnalysis();

  return (
    <Section>
      <Heading level={2} icon={<FaArrowRightToBracket />}>
        Inputs
      </Heading>

      {status?.type === "complete" ? (
        /** if complete, show all tabs */
        <Tabs syncWithUrl="input-tab">
          <Tab text="Summary" icon={<FaFeatherPointed />}>
            <Summary />
          </Tab>
          <Tab text="Table" icon={<FaTableCells />}>
            <Table />
          </Tab>
          <Tab text="Heatmap" icon={<FaFireFlameSimple />}>
            <Heatmap />
          </Tab>
          <Tab text="Domain Arch." icon={<FaBarsStaggered />}>
            <DomainArch />
          </Tab>
        </Tabs>
      ) : (
        /** otherwise, just show summary */
        <Summary />
      )}
    </Section>
  );
};

export default Inputs;
