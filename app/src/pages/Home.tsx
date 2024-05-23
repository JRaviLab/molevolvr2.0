import {
  FaArrowRight,
  FaBarsStaggered,
  FaChartSimple,
  FaCircleInfo,
  FaDna,
  FaFeatherPointed,
  FaFlaskVial,
  FaMicroscope,
  FaPersonRunning,
  FaPlus,
  FaQuoteRight,
  FaRegEye,
  FaRegLightbulb,
  FaRegNewspaper,
  FaScrewdriverWrench,
  FaUpload,
} from "react-icons/fa6";
import { LuShapes } from "react-icons/lu";
import { TbBinaryTree } from "react-icons/tb";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/api/stats";
import type { Analysis } from "@/api/types";
import Alert from "@/components/Alert";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import FeatureCard from "@/components/FeatureCard";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import Tile from "@/components/Tile";
import { formatNumber } from "@/util/string";
import classes from "./Home.module.css";

/** example analyses */
export const examples = [
  {
    id: "a1b2c3",
    name: "Fake Analysis A",
    type: "fasta",
  },
  {
    id: "d4e5f6",
    name: "Fake Analysis B",
    type: "blast",
  },
  {
    id: "g7h8i9",
    name: "Fake Analysis C",
    type: "interproscan",
  },
] satisfies Analysis[];

const Home = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  return (
    <>
      <Meta title="Home" />

      <Section fill>
        <Heading level={1} className="sr-only">
          Home
        </Heading>

        <p className={classes.hero}>
          MolEvolvR enables researchers to characterize proteins using molecular
          evolution and phylogeny
        </p>
        <Flex>
          <Button to="/new-analysis" text="New Analysis" icon={<FaPlus />} />
          <Button
            to="/load-analysis"
            text="Load Analysis"
            icon={<FaArrowRight />}
          />
          <Button to="/testbed" text="Testbed" icon={<FaFlaskVial />} />
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaRegLightbulb />}>
          Examples
        </Heading>

        <p className="primary">
          See what MolEvolvR results look like without inputting anything
        </p>

        <div className="grid full cols-3">
          {examples.map((example, index) => (
            <AnalysisCard key={index} analysis={example} />
          ))}
        </div>
      </Section>

      <Section>
        <Heading level={2} icon={<FaRegEye />}>
          Overview
        </Heading>

        <p className="primary center">Select your inputs...</p>

        <Flex breakpoint={900}>
          <FeatureCard
            title="Construct protein family"
            badge={<FaScrewdriverWrench />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />

          <span>OR</span>

          <FeatureCard
            title="Load your own proteins"
            badge={<FaUpload />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />
        </Flex>

        <p className="primary center">...then view your results...</p>

        <Flex>
          <FeatureCard
            title="Domain architecture"
            badge={<FaBarsStaggered />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />

          <FeatureCard
            title="Phylogeny"
            badge={<TbBinaryTree />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />

          <FeatureCard
            title="Homology"
            badge={<LuShapes />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon={<FaChartSimple />}>
          Stats
        </Heading>

        {statsLoading && <Alert type="loading">Loading Stats</Alert>}

        {stats && (
          <Flex gap="lg">
            <Tile
              icon={<FaPersonRunning />}
              primary={formatNumber(stats.running, true)}
              secondary="Analyses Running"
            />
            <Tile
              icon={<FaMicroscope />}
              primary={formatNumber(stats.performed, true)}
              secondary="Analyses Performed"
            />
            <Tile
              icon={<FaDna />}
              primary={formatNumber(stats.proteins, true)}
              secondary="Proteins Processed"
            />
          </Flex>
        )}
      </Section>

      <Section>
        <Heading level={2} icon={<FaFeatherPointed />}>
          Abstract
        </Heading>

        <p>
          The MolEvolvR web-app integrates molecular evolution and phylogenetic
          protein characterization under a single computational platform.
          MolEvolvR allows users to perform protein characterization, homology
          searches, or combine the two starting with either protein of interest
          or with external outputs from BLAST or InterProScan for further
          analysis, summarization, and visualization.
        </p>

        <Flex>
          <Button
            to="https://biorxiv.org/link-to-paper"
            text="Read the Paper"
            icon={<FaRegNewspaper />}
          />
          <Button to="/about" text="Learn More" icon={<FaCircleInfo />} />
        </Flex>
      </Section>

      <Section fill>
        <Heading level={2} icon={<FaQuoteRight />}>
          Cite
        </Heading>

        <blockquote>
          <strong>
            MolEvolvR: A web-app for characterizing proteins using molecular
            evolution and phylogeny
          </strong>
          <br />
          Joseph T Burke*, Samuel Z Chen*, Lo Sosinski*, John B Johnson, Janani
          Ravi (*Co-primary)
          <br />
          bioRxiv 2022 | doi: 10.1101/2022.02.18.461833 | web app:
          https://jravilab.org/molevolvr
        </blockquote>
      </Section>
    </>
  );
};

export default Home;
