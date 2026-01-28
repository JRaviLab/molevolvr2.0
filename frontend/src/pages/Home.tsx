import type { Analysis } from "@/api/types";
import {
  LuArrowRight,
  LuChartNoAxesGantt,
  LuChartScatter,
  LuDna,
  LuEye,
  LuFeather,
  LuFlaskConical,
  LuInfo,
  LuLightbulb,
  LuMicroscope,
  LuMonitorCheck,
  LuNewspaper,
  LuPlus,
  LuQuote,
  LuShapes,
  LuSplit,
  LuUpload,
  LuWrench,
} from "react-icons/lu";
import { useMediaQuery } from "@reactuses/core";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/api/stats";
import Alert from "@/components/Alert";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import FeatureCard from "@/components/FeatureCard";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Tile from "@/components/Tile";
import Viz from "@/pages/viz/Viz";
import { formatNumber } from "@/util/string";

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
  /** app stats */
  const { data: stats, status: status } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  /** no animations */
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <>
      <Meta title="Home" />

      <section className="min-h-100 justify-center bg-pale narrow">
        {!reduceMotion && <Viz />}

        <Heading level={1} className="sr-only">
          Home
        </Heading>

        <p className="text-center text-xl text-balance">
          {import.meta.env.VITE_DESCRIPTION}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button to="/new-analysis" text="New Analysis" icon={<LuPlus />} />
          <Button
            to="/load-analysis"
            text="Load Analysis"
            icon={<LuArrowRight />}
          />
          <Button to="/testbed" text="Testbed" icon={<LuFlaskConical />} />
        </div>
      </section>

      <section>
        <Heading level={2} icon={<LuLightbulb />}>
          Examples
        </Heading>

        <p className="font-medium">
          See what MolEvolvR results look like without inputting anything
        </p>

        <div className="grid-layout">
          {examples.map((example, index) => (
            <AnalysisCard key={index} analysis={example} />
          ))}
        </div>
      </section>

      <section>
        <Heading level={2} icon={<LuEye />}>
          Overview
        </Heading>

        <p className="font-medium">Select your inputs...</p>

        <div
          className="
            flex items-center justify-center gap-4
            max-md:flex-col
          "
        >
          <FeatureCard
            title="Construct protein family"
            badge={<LuWrench />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />

          <span>OR</span>

          <FeatureCard
            title="Load your own proteins"
            badge={<LuUpload />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />
        </div>

        <p className="font-medium">...then view your results...</p>

        <div
          className="
            flex items-center justify-center gap-4
            max-md:flex-col
          "
        >
          <FeatureCard
            title="Domain architecture"
            badge={<LuChartNoAxesGantt />}
            content={
              <p>Lorem ipsum dolor situr. Simplified chart thumbnail.</p>
            }
          />

          <FeatureCard
            title="Phylogeny"
            badge={<LuSplit />}
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
        </div>
      </section>

      <section>
        <Heading level={2} icon={<LuChartScatter />}>
          Stats
        </Heading>

        {status === "pending" && <Alert type="loading">Loading stats</Alert>}
        {status === "error" && <Alert type="error">Error loading stats</Alert>}

        {stats && (
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Tile
              icon={<LuMonitorCheck />}
              primary={formatNumber(stats.running, true)}
              secondary="Analyses Running"
            />
            <Tile
              icon={<LuMicroscope />}
              primary={formatNumber(stats.performed, true)}
              secondary="Analyses Performed"
            />
            <Tile
              icon={<LuDna />}
              primary={formatNumber(stats.proteins, true)}
              secondary="Proteins Processed"
            />
          </div>
        )}
      </section>

      <section>
        <Heading level={2} icon={<LuFeather />}>
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

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            to="https://biorxiv.org/link-to-paper"
            text="Read the Paper"
            icon={<LuNewspaper />}
          />
          <Button to="/about" text="Learn More" icon={<LuInfo />} />
        </div>
      </section>

      <section>
        <Heading level={2} icon={<LuQuote />}>
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
      </section>
    </>
  );
};

export default Home;
