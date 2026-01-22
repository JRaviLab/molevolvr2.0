import { useState } from "react";
import {
  LuArrowRightToLine,
  LuBell,
  LuCog,
  LuLightbulb,
  LuPlus,
  LuSend,
  LuUpload,
} from "react-icons/lu";
import { useNavigate } from "react-router";
import { useLocalStorage } from "@reactuses/core";
import { parse } from "csv-parse/browser/esm/sync";
import { isEmpty, startCase } from "lodash";
import type { AnalysisType, InputFormat } from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import NumberBox from "@/components/NumberBox";
import Radios from "@/components/Radios";
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

type InputType = (typeof inputTypes)[number]["id"];

/** types of input formats based on input type */
const inputFormats: Record<InputType, Option<InputFormat>[]> = {
  list: [
    { id: "fasta", primary: "FASTA" },
    { id: "accnum", primary: "Accession Numbers" },
    { id: "msa", primary: "Multiple Sequence Alignment" },
  ],
  external: [
    { id: "blast", primary: "BLAST" },
    { id: "interproscan", primary: "InterProScan" },
  ],
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

/** homology databases */
const homologyDatabases = [
  { id: "refseq", primary: "RefSeq" },
  { id: "nr", primary: "nr" },
] as const;

type HomologyDatabase = (typeof homologyDatabases)[number]["id"];

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

type TableInput = ReturnType<typeof parseTable> | null;

const NewAnalysis = () => {
  const navigate = useNavigate();

  /** "input" state */
  const [inputType, setInputType] = useState<InputType>(inputTypes[0].id);
  const [inputFormat, setInputFormat] = useState<InputFormat>(
    inputFormats.list[0]!.id,
  );
  const [listInput, setListInput] = useState("");
  const [tableInput, setTableInput] = useState<TableInput>(null);
  const [querySequenceInput, setQuerySequenceInput] = useState("");
  const [haveQuerySequences, setHaveQuerySequences] = useState(true);
  const [analysisType, setAnalysisType] = useState<AnalysisType>(
    analysisTypes[0].id,
  );

  /** "options" state */
  const [homologyDatabase, setHomologyDatabase] = useState<HomologyDatabase>(
    homologyDatabases[0].id,
  );
  const [maxHits, setMaxHits] = useState(10);
  const [eCutoff, setECutoff] = useState(0.00001);
  const [splitByDomain, setSplitByDomain] = useState(false);

  /** "submit" state */
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
  const onSubmit = () => {
    toast("Analysis submitted", "success");
    navigate("/analysis/d4e5f6");
  };

  return (
    <>
      <Meta title="New Analysis" />

      <Form onSubmit={onSubmit}>
        <section>
          <Heading level={1} icon={<LuPlus />}>
            New Analysis
          </Heading>
        </section>

        <section>
          <Heading level={2} icon={<LuArrowRightToLine />}>
            Input
          </Heading>

          {/* input questions */}
          <div
            className="
              grid w-full grid-cols-2 items-start gap-8
              max-md:grid-cols-1
            "
          >
            <Radios
              label="What do you want to input?"
              options={inputTypes}
              value={inputType}
              onChange={setInputType}
            />

            <div className="flex flex-col gap-4">
              <SelectSingle
                label="What format is your input in?"
                layout="vertical"
                options={inputFormats[inputType]}
                value={inputFormat}
                onChange={(value) => {
                  setInputFormat(value);
                  /** clear inputs when selected input format changes */
                  setListInput("");
                  setTableInput(null);
                  setQuerySequenceInput("");
                }}
              />
              {/* external data help links */}
              {inputFormat === "blast" && (
                <p>
                  <Link to="/help#blast" newTab>
                    How to get the right output from BLAST
                  </Link>
                </p>
              )}
              {inputFormat === "interproscan" && (
                <p>
                  <Link to="/help#interproscan" newTab>
                    How to get the right output from InterProScan
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* list input */}
          {inputType === "list" && (
            <TextBox
              className="w-full"
              label={
                <>
                  {
                    inputFormats[inputType].find((i) => i.id === inputFormat)
                      ?.primary
                  }{" "}
                  input
                  {!isEmpty(stats) && (
                    <span className="text-dark-gray">
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
            />
          )}

          {/* table input */}
          {inputType === "external" && tableInput && (
            <>
              <Table
                cols={tableCols.map((col) => ({ key: col, name: col }))}
                rows={tableInput}
              />
            </>
          )}

          {/* controls */}
          <div className="flex items-center gap-4">
            <UploadButton
              text="Upload"
              icon={<LuUpload />}
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
            <Button text="Example" icon={<LuLightbulb />} onClick={onExample} />
          </div>

          {inputType === "external" && (
            <div className="flex flex-col gap-4">
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
                    label="Query Sequence"
                    placeholder={placeholders.accnum}
                    multi
                    value={querySequenceInput}
                    onChange={setQuerySequenceInput}
                  />
                  <UploadButton
                    text="Upload Query Sequence Accession Numbers"
                    icon={<LuUpload />}
                    design="hollow"
                    className="self-center"
                    onUpload={async (file) =>
                      setQuerySequenceInput(await file.text())
                    }
                    accept={["fa", "faa", "fasta", "txt"]}
                  />
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <Heading level={2} icon={<LuCog />}>
            Options
          </Heading>

          <div className="flex flex-wrap gap-8">
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
            />

            {["homology-domain", "homology"].includes(analysisType) && (
              <div className="flex flex-col gap-8">
                <div className="font-medium">BLAST Parameters</div>

                <SelectSingle
                  label="Homology search database"
                  options={homologyDatabases}
                  value={homologyDatabase}
                  onChange={setHomologyDatabase}
                />
                <Slider
                  label="Max hits"
                  min={10}
                  max={500}
                  value={maxHits}
                  onChange={setMaxHits}
                />
                <NumberBox
                  label="E-value cutoff"
                  min={0}
                  max={1}
                  step={0.000001}
                  value={eCutoff}
                  onChange={setECutoff}
                />
              </div>
            )}
          </div>

          <CheckBox
            label="Split by domain"
            tooltip="Split input proteins by domain, and run analyses on each part separately"
            value={splitByDomain}
            onChange={setSplitByDomain}
          />
        </section>

        <section>
          <Heading level={2} icon={<LuSend />}>
            Submit
          </Heading>

          <TextBox
            className="w-140"
            label="Analysis Name"
            tooltip="Give your analysis a name to remember it by"
            placeholder="New Analysis"
            value={name}
            onChange={setName}
          />

          <TextBox
            className="w-140"
            label={
              <>
                <LuBell /> Email me updates on this analysis
              </>
            }
            placeholder="my-email@xyz.com"
            tooltip="We can email you when this analysis starts (so you can keep track of it) and when it finishes."
            value={email || ""}
            onChange={setEmail}
          />

          <Alert className="w-140">
            An analysis takes <strong>several hours to run</strong>!{" "}
            <Link to="/about" newTab>
              Learn more
            </Link>
            .
          </Alert>

          <Button
            text="Submit"
            icon={<LuSend />}
            design="critical"
            type="submit"
          />
        </section>
      </Form>
    </>
  );
};

export default NewAnalysis;
