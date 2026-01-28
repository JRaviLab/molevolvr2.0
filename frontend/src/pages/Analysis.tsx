import type { Analysis as _Analysis } from "@/api/types";
import { createContext, useContext } from "react";
import { LuFileChartPie } from "react-icons/lu";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnalysis } from "@/api/analysis";
import Alert from "@/components/Alert";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
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
  const { data: analysis, status } = useQuery({
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

      <section>
        <Heading level={1} icon={<LuFileChartPie />}>
          Analysis
        </Heading>

        {status === "pending" && (
          <Alert type="loading">
            Loading analysis <strong>{id}</strong>
          </Alert>
        )}
        {status === "error" && (
          <Alert type="error">
            Error loading analysis <strong>{id}</strong>
          </Alert>
        )}
      </section>
    </>
  );
};

export default Analysis;
