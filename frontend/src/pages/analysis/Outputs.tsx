import {
  ArrowRightFromLine,
  ChartNoAxesGantt,
  Feather,
  Shapes,
  Split,
} from "lucide-react";
import Heading from "@/components/Heading";
import Tabs, { Tab } from "@/components/Tabs";
import DomainArch from "@/pages/analysis/outputs/DomainArch";
import Homology from "@/pages/analysis/outputs/Homology";
import Phylogeny from "@/pages/analysis/outputs/Phylogeny";
import Summary from "@/pages/analysis/outputs/Summary";

const Outputs = () => {
  return (
    <section>
      <Heading level={2} icon={<ArrowRightFromLine />}>
        Outputs
      </Heading>

      <Tabs syncWithUrl="output-tab">
        <Tab text="Summary" icon={<Feather />}>
          <Summary />
        </Tab>
        <Tab text="Domain Arch." icon={<ChartNoAxesGantt />}>
          <DomainArch />
        </Tab>
        <Tab text="Phylogeny" icon={<Split />}>
          <Phylogeny />
        </Tab>
        <Tab text="Homology" icon={<Shapes />}>
          <Homology />
        </Tab>
      </Tabs>
    </section>
  );
};

export default Outputs;
