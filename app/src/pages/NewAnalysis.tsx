import { useEffect, useState } from "react";
import {
  FaArrowRightToBracket,
  FaGear,
  FaLightbulb,
  FaPlus,
  FaRegBell,
  FaRegPaperPlane,
  FaUpload,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import { parse } from "csv-parse/browser/esm/sync";
import { isEmpty, startCase } from "lodash";
import { useLocalStorage } from "@reactuses/core";
import type { AnalysisType, InputFormat } from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Flex from "@/components/Flex";
import Form from "@/components/Form";
import type { FormData } from "@/components/Form";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import NumberBox from "@/components/NumberBox";
import Radios from "@/components/Radios";
import Section from "@/components/Section";
import SelectSingle from "@/components/SelectSingle";
import type { Option } from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import Table from "@/components/Table";
import TextBox from "@/components/TextBox";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import { formatNumber } from "@/util/string";
import accnumExample from "./examples/accnum.txt?raw";
import blastExample from "./examples/blast.tsv?raw";
import fastaExample from "./examples/fasta.txt?raw";
import interproscanExample from "./examples/interproscan.tsv?raw";
import msaExample from "./examples/msa.txt?raw";
import classes from "./NewAnalysis.module.css";

/** high-level category of inputs */
const inputTypes = [
  {
    id: "list",
    primary: "Proteins of interest",
    secondary: "Provide list of FASTA or MSA sequences or accession numbers",
  },
  {
    id: "external",
    primary: "External data",
    secondary: "Provide tabular output from BLAST or Interproscan",
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
  fasta: fastaExample,
  accnum: accnumExample,
  msa: msaExample,
  blast: blastExample,
  interproscan: interproscanExample,
};

/** high-level category of inputs */
const analysisTypes = [
  {
    id: "phylogeny-domain",
    primary: "Phylogeny + Domain Architecture",
    secondary: "Lorem ipsum",
  },
  {
    id: "domain",
    primary: "Domain architecture",
    secondary: "Lorem ipsum",
  },
  {
    id: "homology-domain",
    primary: "Homology + Domain Architecture",
    secondary: "Lorem ipsum",
  },
  {
    id: "homology",
    primary: "Homology",
    secondary: "Lorem ipsum",
  },
] as const;

/** csv cols */
const tableCols = [
  "Query",
  "AccNum",
  "PcIdentity",
  "AlnLength",
  "Mismatch",
  "GapOpen",
  "QStart",
  "QEnd",
  "SStart",
  "SEnd",
  "EValue",
  "BitScore",
  "PcPosOrig",
];

/** parse text as csv/tsv */
const parseTable = (
  input: string,
  delimiter: string,
): Record<string, unknown>[] =>
  parse(input, {
    delimiter,
    columns: tableCols,
    skip_records_with_error: true,
  });

const NewAnalysis = () => {
  const navigate = useNavigate();

  /** state */
  const [inputType, setInputType] = useState<(typeof inputTypes)[number]["id"]>(
    inputTypes[0].id,
  );
  const [inputFormat, setInputFormat] = useState<InputFormat>(
    inputFormats.list[0]!.id,
  );
  const [listInput, setListInput] = useState("");
  const [tableInput, setTableInput] = useState<ReturnType<
    typeof parseTable
  > | null>(null);
  const [querySequenceInput, setQuerySequenceInput] = useState("");
  const [haveQuerySequences, setHaveQuerySequences] = useState(true);
  const [analysisType, setAnalysisType] = useState<AnalysisType>(
    analysisTypes[0]!.id,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useLocalStorage("email", "");

  /** allowed extensions */
  const accept = {
    fasta: ["fa", "faa", "fasta", "txt"],
    accnum: ["csv", "tsv", "txt"],
    msa: ["fa", "faa", "fasta", "txt"],
    blast: ["csv", "tsv"],
    interproscan: ["csv", "tsv"],
  }[inputFormat];

  /** high-level stats of input for review */
  const stats: Record<string, string> = {};
  if (tableInput?.length) {
    stats.rows = formatNumber(tableInput.length);
    stats.cols = formatNumber(Object.keys(tableInput[0] || {})?.length);
  } else if (listInput)
    stats.proteins = formatNumber(
      listInput
        .split(inputFormat === "accnum" ? "," : ">")
        .map((p) => p.trim())
        .filter(Boolean).length,
    );

  /** use example */
  const onExample = () => {
    if (inputType === "list") setListInput(examples[inputFormat]);
    if (inputType === "external")
      setTableInput(parseTable(examples[inputFormat], "\t"));
  };

  /** submit analysis */
  const onSubmit = (data: FormData) => {
    console.debug(data);
    toast("Analysis submitted", "success");
    navigate("/analysis/d4e5f6");
  };

  /** clear inputs when selected input format changes */
  useEffect(() => {
    setListInput("");
    setTableInput(null);
    setQuerySequenceInput("");
  }, [inputFormat]);

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
          <div className={classes.questions}>
            <Radios
              label="What do you want to input?"
              options={inputTypes}
              value={inputType}
              onChange={setInputType}
              name="inputFormat"
            />

            <Flex direction="column" hAlign="left">
              <SelectSingle
                label="What format is your input in?"
                layout="vertical"
                options={inputFormats[inputType]}
                value={inputFormat}
                onChange={setInputFormat}
                name="inputFormat"
              />
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
            </Flex>
          </div>

          {/* list input */}
          {inputType === "list" && (
            <TextBox
              className="full"
              label={
                <>
                  {
                    inputFormats[inputType].find((i) => i.id === inputFormat)
                      ?.text
                  }{" "}
                  input
                  {!isEmpty(stats) && (
                    <span className="secondary">
                      (
                      {Object.entries(stats)
                        .map(([key, value]) => `${value} ${startCase(key)}`)
                        .join(", ")}
                      )
                    </span>
                  )}
                </>
              }
              placeholder={placeholders[inputFormat]
                .split("\n")
                .slice(0, 2)
                .join("\n")}
              multi
              value={listInput}
              onChange={setListInput}
              name="listInput"
            />
          )}

          {/* table input */}
          {inputType === "external" && tableInput && (
            <>
              <TextBox
                className="sr-only"
                aria-hidden
                value={JSON.stringify(tableInput)}
                name="tableInput"
              />
              <Table
                cols={tableCols.map((col) => ({
                  key: col,
                  name: col,
                }))}
                rows={tableInput}
              />
            </>
          )}

          {/* controls */}
          <Flex>
            <UploadButton
              text="Upload"
              icon={<FaUpload />}
              onUpload={async (file, filename, extension) => {
                if (!name) setName(startCase(filename));
                const contents = await file.text();
                if (inputType === "list") setListInput(contents);
                if (inputType === "external")
                  setTableInput(
                    parseTable(
                      contents,
                      file.type === "text/tab-separated-values" ||
                        extension === "tsv"
                        ? "\t"
                        : ",",
                    ),
                  );
              }}
              accept={accept}
            />
            <Button text="Example" icon={<FaLightbulb />} onClick={onExample} />
          </Flex>

          {inputType === "external" && (
            <Flex direction="column">
              <CheckBox
                label={
                  <span>
                    First column (query sequences) is in <i>accession number</i>{" "}
                    format
                  </span>
                }
                tooltip="We need your query sequences(s) as accession numbers so we can look up additional info about them. Learn more on the about page."
                value={haveQuerySequences}
                onChange={setHaveQuerySequences}
              />

              {!haveQuerySequences && (
                <>
                  <TextBox
                    className="full"
                    label="Query Sequence"
                    placeholder={placeholders.accnum}
                    multi
                    value={querySequenceInput}
                    onChange={setQuerySequenceInput}
                    name="querySequenceInput"
                  />
                  <UploadButton
                    text="Upload Query Sequence Accession Numbers"
                    icon={<FaUpload />}
                    design="hollow"
                    onUpload={async (file) =>
                      setQuerySequenceInput(await file.text())
                    }
                    accept={["fa", "faa", "fasta", "txt"]}
                  />
                </>
              )}
            </Flex>
          )}
        </Section>

        <Section>
          <Heading level={2} icon={<FaGear />}>
            Options
          </Heading>

          <Flex gap="lg" vAlign="top">
            <Radios
              label="What type of analyses do you want to run?"
              tooltip="These options may be limited depending on your input format. Some steps are necessarily performed together. Learn more on the about page."
              /** allow specific analysis types based on input format */
              options={analysisTypes.filter(({ id }) => {
                if (["fasta", "accnum", "msa"].includes(inputFormat))
                  return true;
                if (inputFormat === "blast") return id === "phylogeny-domain";
                if (inputFormat === "interproscan")
                  return ["phylogeny-domain", "domain"].includes(id);
              })}
              value={analysisType}
              onChange={setAnalysisType}
              name="analysisType"
            />

            {["homology-domain", "homology"].includes(analysisType) && (
              <Flex direction="column" hAlign="left">
                <div className="primary">BLAST Parameters</div>

                <SelectSingle
                  label="Homology search database"
                  options={[
                    { id: "refseq", text: "RefSeq" },
                    { id: "nr", text: "nr" },
                  ]}
                  name="blastHomologyDatabase"
                />
                <Slider
                  label="Max hits"
                  min={10}
                  max={500}
                  name="blastMaxHits"
                />
                <NumberBox
                  label="E-value cutoff"
                  defaultValue={0.00001}
                  min={0}
                  max={1}
                  step={0.000001}
                  name="blastECutoff"
                />
              </Flex>
            )}
          </Flex>

          <CheckBox
            label="Split by domain"
            tooltip="Split input proteins by domain, and run analyses on each part separately"
            name="splitByDomain"
          />
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
            value={email || ""}
            onChange={setEmail}
          />

          <Alert>
            An analysis takes <strong>several hours to run</strong>!{" "}
            <Link to="/about" newTab={true}>
              Learn more
            </Link>
            .
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
