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
  const [name, setName] = useState("New Analysis");
  const [type, setType] = useState<(typeof types)[number]>(types[0]);
  const [sequence, setSequence] = useState("");
  const [email, setEmail] = useLocalStorage("molevolvr-email", "");

  const onUpload = () => {
    console.info("upload");
  };

  const onExample = () => {
    setSequence("abcdefghijklmnopqrstuvwxyz");
  };

  const onSubmit = () => {
    console.info(name, type, sequence, email);
    toast("Analysis submitted", "success");
    navigate("/analysis/d4e5f6");
  };

  return (
    <>
      <Meta title="New Analysis" />

      <Section>
        <Heading level={1} icon={<FaPlus />}>
          New Analysis
        </Heading>

        <TextBox
          label="Name"
          placeholder="New Analysis"
          width={400}
          value={name}
          onChange={setName}
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
        />

        <TextBox
          label="Sequence"
          placeholder={sequencePlaceholders[type.id]}
          multi={true}
          width="100%"
          value={sequence}
          onChange={setSequence}
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
          <CheckBox label="Phylogeny" />
          <CheckBox label="Homology" />
          <CheckBox label="Domain Architecture" />
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
          onClick={onSubmit}
        />
      </Section>
    </>
  );
};

export default NewAnalysis;
