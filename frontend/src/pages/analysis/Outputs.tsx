import {
FaArrowRightFromBracket,
FaBarsStaggered,
FaFeatherPointed,
} from 'react-icons/fa6';
import { useLocation } from 'react-router-dom';
import { LuShapes } from 'react-icons/lu';
import { TbBinaryTree } from 'react-icons/tb';
import Heading from '@/components/Heading';
import Section from '@/components/Section';
import Tabs, { Tab } from '@/components/Tabs';
import DomainArch from '@/pages/analysis/outputs/DomainArch';
import Homology from '@/pages/analysis/outputs/Homology';
import Phylogeny from '@/pages/analysis/outputs/Phylogeny';
import Summary from '@/pages/analysis/outputs/Summary';
import NightingaleMSAWrapper from '@/components/nightingale-wrapper/NightingaleMSAWrapper';
import { Region, SequencesMSA } from '@nightingale-elements/nightingale-msa'; 

interface ExtendedRegion extends Region {
start: number;
end: number;
type: string;
description: string;
}

const Outputs = () => {

  const location = useLocation();
  const msaData = location.state?.msaData;


/** parsing Input msaData **/
const parseSequences = (data: string): SequencesMSA => {
  const lines = data.split('\n');
  return lines
    .map(line => {
      const [name, sequence] = line.split(/\s+/);
      if (name && sequence) {
        return { name, sequence };
      }
      return null;
    })
    .filter((seq): seq is { name: string; sequence: string } => seq !== null);
};

  const sequences: SequencesMSA = msaData ? parseSequences(msaData) : [];

  // Define features based on your requirements
  const features: ExtendedRegion[] = [
    {
      type: "domain",
      start: 1,
      end: 10,
      description: "Domain 1",
      residues: { from: 1, to: 10 },
      sequences: { from: 0, to: sequences.length - 1 },
      mouseOverFillColor: "rgba(255, 0, 0, 0.5)",
      fillColor: "rgba(255, 0, 0, 0.3)",
      borderColor: "rgba(255, 0, 0, 1)",
    },
    // Add more features as needed
  ];

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
<Tab text="MSA Visualization" icon={<FaBarsStaggered />}>
{sequences.length > 0 ? (
            <NightingaleMSAWrapper sequences={sequences} features={features} />
          ) : (
            <p>No valid MSA data available</p>
          )}
</Tab>
</Tabs>
</Section>
);
};

export default Outputs;
