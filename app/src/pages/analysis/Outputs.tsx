import {
  FaArrowRightFromBracket,
  FaBarsStaggered,
  FaFeatherPointed,
} from "react-icons/fa6";
import { LuShapes } from "react-icons/lu";
import { TbBinaryTree } from "react-icons/tb";
import Heading from "@/components/Heading";
import Section from "@/components/Section";
import Tabs, { Tab } from "@/components/Tabs";
import DomainArch from "@/pages/analysis/outputs/DomainArch";
import Homology from "@/pages/analysis/outputs/Homology";
import Phylogeny from "@/pages/analysis/outputs/Phylogeny";
import Summary from "@/pages/analysis/outputs/Summary";

const Outputs = () => {
  return (
    <Section>
      <Heading level={2} icon={<FaArrowRightFromBracket />}>
        Outputs
      </Heading>

      <Tabs syncWithUrl="output-tab">
        <Tab text="Summary" icon={<FaFeatherPointed />}>
          <Summary />
        </Tab>
        <Tab text="Domain Arch." icon={<FaBarsStaggered />}>
          <DomainArch />
        </Tab>
        <Tab text="Phylogeny" icon={<TbBinaryTree />}>
          <Phylogeny />
        </Tab>
        <Tab text="Homology" icon={<LuShapes />}>
          <Homology />
        </Tab>
      </Tabs>
    </Section>
  );
};

export default Outputs;
