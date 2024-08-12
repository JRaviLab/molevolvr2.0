import { createContext, useContext } from "react";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnalysis } from "@/api/analysis";
import type { Analysis as _Analysis } from "@/api/types";
import Alert from "@/components/Alert";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import Actions from "@/pages/analysis/Actions";
import Inputs from "@/pages/analysis/Inputs";
import Outputs from "@/pages/analysis/Outputs";
import Overview from "@/pages/analysis/Overview";
import { examples } from "@/pages/Home";

const AnalysisContext = createContext<_Analysis>(examples[0]!);
export const useAnalysis = () => useContext(AnalysisContext);

const Analysis = () => {
  /** get id from url */
  const { id = "Analysis" } = useParams();

  /** start analysis lookup */
  const {
    data: analysis,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => getAnalysis(id),
  });

  /** if analysis loaded, display full analysis page */
  if (analysis) {
    const { name, status } = analysis;

    return (
      <AnalysisContext.Provider value={{ ...analysis }}>
        <Meta title={name} />

        <Overview />
        <Inputs />
        {status?.type === "complete" && <Outputs />}
        <Actions />
      </AnalysisContext.Provider>
    );
  }

  /** otherwise, show loading status */
  return (
    <>
      <Meta title="Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Analysis
        </Heading>

        {isLoading && (
          <Alert type="loading">
            Loading analysis <strong>{id}</strong>
          </Alert>
        )}
        {isError && (
          <Alert type="error">
            Error loading analysis <strong>{id}</strong>
          </Alert>
        )}
      </Section>
    </>
  );
};

export default Analysis;
