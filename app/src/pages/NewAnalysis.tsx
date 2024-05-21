import { useState } from "react";
import {
  FaArrowRightToBracket,
  FaLightbulb,
  FaPlus,
  FaRegBell,
  FaRegPaperPlane,
  FaUpload,
} from "react-icons/fa6";
import { MdOutlineFactory } from "react-icons/md";
import { useNavigate } from "react-router";
import { useLocalStorage } from "react-use";
import { parse } from "csv-parse/browser/esm/sync";
import { startCase } from "lodash";
import type { InputFormat } from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Form from "@/components/Form";
import type { FormData } from "@/components/Form";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Radios from "@/components/Radios";
import Section from "@/components/Section";
import SelectSingle from "@/components/SelectSingle";
import type { Option } from "@/components/SelectSingle";
import TextBox from "@/components/TextBox";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import { formatNumber } from "@/util/string";

/** high-level category of inputs */
const inputTypes = [
  {
    id: "list",
    primary: "Proteins of interest",
    secondary: "Provide a list of FASTA or MSA sequences or accession numbers",
  },
  {
    id: "external",
    primary: "External data",
    secondary: "Provide output from BLAST or Interproscan",
  },
] as const;

/** types of input formats based on input type */
const inputFormats: Record<
  (typeof inputTypes)[number]["id"],
  Option<InputFormat>[]
> = {
  list: [
    { id: "fasta", text: "FASTA" },
    { id: "accnum", text: "Accession Numbers" },
    { id: "msa", text: "Multiple Sequence Alignment" },
  ] as const,
  external: [
    { id: "blast", text: "BLAST" },
    { id: "interproscan", text: "InterProScan" },
  ] as const,
};

/** placeholders for each input format type */
const placeholders: Record<InputFormat, string> = {
  fasta: `>ABCDEF protein ABC [abcdef]
  ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
  accnum: "ABC123, DEF456, GHI789",
  msa: `>ABCDEF hypothetical protein ABC_123 [abcdef]
  ---------------------ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
  blast: `ABC123,ABC123,123,123,1,2,3`,
  interproscan: `ABC123,abcdef123456,123,ABC,ABC,ABC`,
};

/** examples for each input format type */
const examples: Record<InputFormat, string> = {
  fasta: (await import(`./examples/fasta.txt?raw`)).default,
  accnum: (await import(`./examples/accnum.txt?raw`)).default,
  msa: (await import(`./examples/msa.txt?raw`)).default,
  blast: (await import(`./examples/blast.tsv?raw`)).default,
  interproscan: (await import(`./examples/interproscan.tsv?raw`)).default,
};

const NewAnalysis = () => {
  const navigate = useNavigate();

  /** state */
  const [inputType, setInputType] = useState<(typeof inputTypes)[number]["id"]>(
    inputTypes[0].id,
  );
  const [inputFormat, setInputFormat] = useState<InputFormat>(
    inputFormats.list[0]!.id,
  );
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useLocalStorage("molevolvr-email", "");

  /** allowed extensions */
  const accept = {
    fasta: ["fa", "faa", "fasta", "txt"],
    accnum: ["csv", "tsv", "txt"],
    msa: ["fa", "faa", "fasta", "txt"],
    blast: ["csv", "tsv"],
    interproscan: ["csv", "tsv"],
  }[inputFormat];

  /** attempt to parse as csv/tsv */
  const csv = delimiter
    ? parse(input, { delimiter, skip_records_with_error: true })
    : null;

  const onExample = () => {
    setInput(examples[inputFormat]);
    setDelimiter(inputType === "external" ? "\t" : "");
  };

  const onSubmit = (data: FormData) => {
    console.debug(data);
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
        </Section>

        <Section>
          <Heading level={2} icon={<FaArrowRightToBracket />}>
            Input
          </Heading>

          {/* input questions */}
          <div className="grid gap-lg align-start">
            <Radios
              label="What do you want to input?"
              options={inputTypes}
              value={inputType}
              onChange={setInputType}
              name="inputFormat"
            />
            <SelectSingle
              label="What format is your input in?"
              layout="vertical"
              options={inputFormats[inputType]}
              value={inputFormat}
              onChange={setInputFormat}
              name="inputFormat"
            />
          </div>

          {/* input */}
          <TextBox
            label={
              inputFormats[inputType].find((i) => i.id === inputFormat)?.text
            }
            placeholder={placeholders[inputFormat]
              .split("\n")
              .slice(0, 2)
              .join("\n")}
            multi
            value={input}
            onChange={setInput}
            name="input"
          />

          {/* stats */}
          {csv?.length ? (
            <>
              {formatNumber(csv.length)} rows, {formatNumber(csv[0].length)}{" "}
              cols
            </>
          ) : input ? (
            <>
              {formatNumber(
                input
                  .split(inputFormat === "accnum" ? "," : ">")
                  .map((p) => p.trim())
                  .filter(Boolean).length,
              )}{" "}
              proteins
            </>
          ) : null}

          {/* controls */}
          <div className="flex-row gap-sm">
            <UploadButton
              text="Upload"
              icon={<FaUpload />}
              onUpload={async (file, filename, extension) => {
                const contents = await file.text();
                setInput(contents);
                if (!name) setName(startCase(filename));
                if (file.type === "text/csv" || extension === "csv")
                  setDelimiter(",");
                if (
                  file.type === "text/tab-separated-values" ||
                  extension === "tsv"
                )
                  setDelimiter("\t");
              }}
              accept={accept}
            />
            <Button text="Example" icon={<FaLightbulb />} onClick={onExample} />
          </div>

          {/* external data help links */}
          {inputFormat === "blast" && (
            <Link to="/help#blast" newTab>
              How to get the right output from BLAST
            </Link>
          )}
          {inputFormat === "interproscan" && (
            <Link to="/help#interproscan" newTab>
              How to get the right output from InterProScan
            </Link>
          )}
        </Section>

        <Section>
          <Heading level={2} icon={<MdOutlineFactory />}>
            Analysis Type
          </Heading>
        </Section>

        <Section>
          <Heading level={2} icon={<FaRegPaperPlane />}>
            Submit
          </Heading>

          <TextBox
            className="narrow"
            label="Analysis Name"
            placeholder="New Analysis"
            value={name}
            onChange={setName}
            tooltip="Give your analysis a name to remember it by"
            name="name"
          />

          <TextBox
            className="narrow"
            label={
              <>
                <FaRegBell /> Email me updates on this analysis
              </>
            }
            placeholder="my-email@xyz.com"
            tooltip="We can email you when this analysis starts (so you can keep track of it) and when it finishes."
            value={email}
            onChange={setEmail}
          />

          <Alert>
            An analysis takes <strong>several hours to run</strong>!{" "}
            <Link to="/about">Learn more</Link>.
          </Alert>

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
