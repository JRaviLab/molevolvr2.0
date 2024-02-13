import { useState } from "react";
import {
  FaArrowRightToBracket,
  FaLightbulb,
  FaPlus,
  FaRegBell,
  FaRegPaperPlane,
  FaUpload,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useLocalStorage } from "react-use";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Collapsible from "@/components/Collapsible";
import Form from "@/components/Form";
import type { FormData } from "@/components/Form";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import Select from "@/components/Select";
import TextBox from "@/components/TextBox";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";

/** types of analyses */
const types = [
  { id: "fasta", text: "Fasta" },
  { id: "accnum", text: "AccNum" },
  { id: "msa", text: "MSA" },
  { id: "blast", text: "BLAST" },
  { id: "interproscan", text: "InterProScan" },
] as const;

const sequencePlaceholders: Record<(typeof types)[number]["id"], string> = {
  fasta: "abc\n------\n1234567890",
  accnum: "def\n------\n1234567890",
  msa: "ghi\n------\n1234567890",
  blast: "jkl\n------\n1234567890",
  interproscan: "mno\n------\n1234567890",
};

const NewAnalysis = () => {
  const navigate = useNavigate();

  /** state */
  const [type, setType] = useState<(typeof types)[number]>(types[0]);
  const [, setSequence] = useState("");
  const [email, setEmail] = useLocalStorage("molevolvr-email", "");

  const onUpload = () => {
    console.info("upload");
  };

  const onExample = () => {
    setSequence("abcdefghijklmnopqrstuvwxyz");
  };

  const onSubmit = (data: FormData) => {
    console.info(data);
    toast("Analysis submitted", "success");
    navigate("/analysis/d4e5f6");
  };

  return (
    <>
      <Meta title="New Analysis" />

      <Form onSubmit={onSubmit}>
        <Section>
          <Heading level={1} icon={<FaPlus />}>
            New Analysis
          </Heading>

          <TextBox
            label="Name"
            placeholder="New Analysis"
            width={400}
            name="name"
          />
        </Section>

        <Section>
          <Heading level={2} icon={<FaArrowRightToBracket />}>
            Inputs
          </Heading>

          <Select
            label="Type"
            layout="horizontal"
            tooltip="Lorem ipsum"
            options={types}
            value={type}
            onChange={setType}
            name="type"
          />

          <TextBox
            label="Sequence"
            placeholder={sequencePlaceholders[type.id]}
            multi={true}
            required={true}
            width="100%"
            name="sequence"
          />

          <div className="flex-row gap-sm">
            <UploadButton
              text="Upload"
              icon={<FaUpload />}
              onUpload={console.info}
              design="accent"
              onClick={onUpload}
            />
            <Button text="Example" icon={<FaLightbulb />} onClick={onExample} />
          </div>

          <Collapsible text="Advanced" className="flex-col gap-md">
            <CheckBox label="Phylogeny" name="phylogeny" />
            <CheckBox label="Homology" name="homology" />
            <CheckBox label="Domain Architecture" name="domain-architecture" />
          </Collapsible>
        </Section>

        <Section>
          <Heading level={2} icon={<FaRegPaperPlane />}>
            Submit
          </Heading>

          <Alert>
            An analysis takes <strong>several hours to run</strong>!{" "}
            <Link to="/about">Learn more</Link>.
          </Alert>

          <TextBox
            label={
              <>
                <FaRegBell /> Email me updates on this analysis
              </>
            }
            width={360}
            placeholder="my-email@xyz.com"
            tooltip="We can email you when this analysis starts (so you can keep track of it) and when it finishes."
            value={email}
            onChange={setEmail}
          />

          <Button
            text="Submit"
            icon={<FaRegPaperPlane />}
            design="critical"
            type="submit"
          />
        </Section>
      </Form>
    </>
  );
};

export default NewAnalysis;
