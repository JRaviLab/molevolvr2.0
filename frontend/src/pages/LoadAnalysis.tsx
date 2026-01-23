import { useState } from "react";
import { LuArrowRight, LuHistory } from "react-icons/lu";
import { useNavigate } from "react-router";
import { useLocalStorage } from "@reactuses/core";
import type { Analysis } from "@/api/types";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import TextBox from "@/components/TextBox";
import { toast } from "@/components/Toasts";
import analyses from "../../fixtures/analyses.json";

const storageKey = "history";

const LoadAnalysis = () => {
  const navigate = useNavigate();

  const [id, setId] = useState("");

  /** analysis history */
  const [history, setHistory] = useLocalStorage<Analysis[]>(storageKey, []);

  return (
    <>
      <Meta title="Load Analysis" />

      <section>
        <Heading level={1} icon={<LuArrowRight />}>
          Load Analysis
        </Heading>

        <Form
          onSubmit={() => {
            if (id.trim()) navigate(`/analysis/${id}`);
            else toast("Please enter an analysis id", "error");
          }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            <TextBox placeholder="Analysis ID" value={id} onChange={setId} />
            <Button text="Lookup" icon={<LuArrowRight />} type="submit" />
          </div>
        </Form>
      </section>

      <section>
        <Heading level={2} icon={<LuHistory />}>
          History
        </Heading>

        <p className="font-medium">Analyses submitted on this device</p>

        {!!history?.length && (
          <div className="grid-layout">
            {history.map((analysis, index) => (
              <AnalysisCard key={index} analysis={analysis} />
            ))}
          </div>
        )}

        {/* empty */}
        {!history?.length && <div>Nothing yet!</div>}

        {/* for testing */}
        <div className="flex flex-wrap items-center gap-4">
          For testing:
          <Button
            text="Add Fakes"
            onClick={() => setHistory(analyses as Analysis[])}
          />
          <Button text="Clear" onClick={() => setHistory([])} />
        </div>
      </section>
    </>
  );
};

export default LoadAnalysis;
