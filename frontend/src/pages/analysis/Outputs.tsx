import {
  LuArrowRightFromLine,
  LuChartNoAxesGantt,
  LuFeather,
  LuShapes,
  LuSplit,
} from "react-icons/lu";
import Heading from "@/components/Heading";
import Tabs, { Tab } from "@/components/Tabs";
import DomainArch from "@/pages/analysis/outputs/DomainArch";
import Homology from "@/pages/analysis/outputs/Homology";
import Phylogeny from "@/pages/analysis/outputs/Phylogeny";
import Summary from "@/pages/analysis/outputs/Summary";

const Outputs = () => {
  return (
    <section>
      <Heading level={2} icon={<LuArrowRightFromLine />}>
        Outputs
      </Heading>

      <Tabs syncWithUrl="output-tab">
        <Tab text="Summary" icon={<LuFeather />}>
          <Summary />
        </Tab>
        <Tab text="Domain Arch." icon={<LuChartNoAxesGantt />}>
          <DomainArch />
        </Tab>
        <Tab text="Phylogeny" icon={<LuSplit />}>
          <Phylogeny />
        </Tab>
        <Tab text="Homology" icon={<LuShapes />}>
          <Homology />
        </Tab>
      </Tabs>
    </section>
  );
};

export default Outputs;
