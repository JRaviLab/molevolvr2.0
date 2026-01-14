import { FaArrowRight, FaClockRotateLeft } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useLocalStorage } from "@reactuses/core";
import type { Analysis } from "@/api/types";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import TextBox from "@/components/TextBox";
import analyses from "../../fixtures/analyses.json";

export const storageKey = "history";

const LoadAnalysis = () => {
  const navigate = useNavigate();

  /** analysis history */
  const [history, setHistory] = useLocalStorage<Analysis[]>(storageKey, []);

  return (
    <>
      <Meta title="Load Analysis" />

      <section>
        <Heading level={1} icon={<FaArrowRight />}>
          Load Analysis
        </Heading>

        <Form
          onSubmit={(data) => {
            if (String(data.id).trim()) navigate(`/analysis/${data.id}`);
            else window.alert("Please enter an analysis id");
          }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            <TextBox placeholder="Analysis ID" name="id" />
            <Button text="Lookup" icon={<FaArrowRight />} type="submit" />
          </div>
        </Form>
      </section>

      <section>
        <Heading level={2} icon={<FaClockRotateLeft />}>
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
