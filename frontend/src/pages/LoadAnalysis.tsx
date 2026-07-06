import type { Analysis } from "@/api/types";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useLocalStorage } from "@reactuses/core";
import { ArrowRight, History } from "lucide-react";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import Form from "@/components/Form";
import { H1, H2 } from "@/components/Heading";
import Meta from "@/components/Meta";
import TextBox from "@/components/TextBox";
import { toast } from "@/components/Toasts";
import analyses from "../../fixtures/analyses.json";

const storageKey = "history";

export default function LoadAnalysis() {
  const navigate = useNavigate();

  const [id, setId] = useState("");

  /** analysis history */
  const [history, setHistory] = useLocalStorage<Analysis[]>(storageKey, []);

  return (
    <>
      <Meta title="Load Analysis" />

      <section className="items-center">
        <H1 icon={<ArrowRight />}>Load Analysis</H1>

        <Form
          onSubmit={() => {
            if (id.trim()) navigate(`/analysis/${id}`);
            else toast("Please enter an analysis id", "error");
          }}
        >
          <div className="flex flex-wrap gap-4">
            <TextBox placeholder="Analysis ID" value={id} onChange={setId} />
            <Button type="submit">
              Load
              <ArrowRight />
            </Button>
          </div>
        </Form>
      </section>

      <section>
        <H2 icon={<History />}>History</H2>

        <p className="self-center">Analyses submitted on this device</p>

        {!!history?.length && (
          <div className="grid-layout">
            {history.map((analysis, index) => (
              <AnalysisCard key={index} analysis={analysis} />
            ))}
          </div>
        )}

        {/* empty */}
        {!history?.length && <div className="self-center">Nothing yet!</div>}

        {/* for testing */}
        <div className="flex flex-wrap items-center gap-4 self-center">
          For testing:
          <Button onClick={() => setHistory(analyses as Analysis[])}>
            Add Fakes
          </Button>
          <Button onClick={() => setHistory([])}>Clear</Button>
        </div>
      </section>
    </>
  );
}
