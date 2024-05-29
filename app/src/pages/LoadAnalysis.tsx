import { FaArrowRight, FaClockRotateLeft } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useLocalStorage } from "react-use";
import type { Analysis } from "@/api/types";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import TextBox from "@/components/TextBox";
import analyses from "../../fixtures/analyses.json";

export const storageKey = "molevolvr-history";

const LoadAnalysis = () => {
  const navigate = useNavigate();

  /** analysis history */
  const [history = [], setHistory] = useLocalStorage<Analysis[]>(storageKey);

  return (
    <>
      <Meta title="Load Analysis" />

      <Section>
        <Heading level={1} icon={<FaArrowRight />}>
          Load Analysis
        </Heading>

        <Form onSubmit={(data) => navigate(`/analysis/${data.id}`)}>
          <Flex className="narrow">
            <TextBox placeholder="Analysis ID" name="id" />
            <Button text="Lookup" icon={<FaArrowRight />} type="submit" />
          </Flex>
        </Form>
      </Section>

      <Section>
        <Heading level={2} icon={<FaClockRotateLeft />}>
          History
        </Heading>

        <p className="primary">Analyses submitted on this device</p>

        {!!history.length && (
          <div className="grid full gap-md cols-3">
            {history.map((analysis, index) => (
              <AnalysisCard key={index} analysis={analysis} />
            ))}
          </div>
        )}

        {/* empty */}
        {!history.length && <div className="placeholder">Nothing yet!</div>}

        {/* for testing */}
        <Flex>
          For testing:
          <Button
            text="Add Fakes"
            onClick={() => setHistory(analyses as Analysis[])}
          />
          <Button text="Clear" onClick={() => setHistory([])} />
        </Flex>
      </Section>
    </>
  );
};

export default LoadAnalysis;
