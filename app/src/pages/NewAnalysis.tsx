import { useState } from "react";
import {
  FaArrowRightToBracket,
  FaLightbulb,
  FaMicroscope,
  FaPlus,
  FaRegBell,
  FaRegPaperPlane,
  FaUpload,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useLocalStorage } from "react-use";
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

/** examples (and placeholders) for each input format type */
const sequenceExamples: Record<InputFormat, string> = {
  fasta: `>ANY95992.1 protein LiaH [Bacillus altitudinis]
  MVLRRVRDMFVATVNEGLDKLENPRVMLNQYVRDMEDDIAKAKHAIIKQQTIQQGFLRKAEETEAFADKR
  KKQAELAFQAGEEELVRKALTEMKYFEEKHNEYQEAYQQSVKQLKELKEQLQHLETKLRDVKDKKQALIA
  RANAAQAKQHMNESMNKVDSESAYKEFLRMENRIEEMETKAGSYAQFADQGAYAHLDYADEVEKEWQKLQ
  RSKQPEKQPAN
  
  >APP15780.1 protein LiaH [Bacillus altitudinis]
  MVLRRVRDMFVATVNEGLDKLENPRVMLNQYVRDMEDDIAKAKHAIIKQQTIQQGFLRKAEETEAFADKR
  KKQAELAFHAGEEELARKALTEMKYFEEKHNEYQDAYQQSVKQLKELKEQLQHLETKLRDVKDKKQALIA
  RANAAQAKQHMNESMNKVDSESAYKEFLRMENRIEEMETKAGSYAQFADQGAYAHLDYADEVEKEWQKLQ
  RSKQLEKQPAN
  
  >AGZ55339.1 hypothetical protein U471_06290 [Bacillus amyloliquefaciens CC178]
  MSILGRFKDIMSSNINALLDKAENPEKMVDQYLRNLNSDLGKVKAETASVMAEEQRAKRTLTECQADAEK
  MESYAMKALQAGNEADARTFLERKAAVESRLTELQTAYQLASSNASQMRKMHDKLVADIGELESRRNAIK
  AKWSVAKTQERMNKLGSSVSNAGQSMTAFGRMEDKVNQALDHANAMAELNASPKDDIDDLTAKYDSNQSS
  VDDELAALKQKMLFSKDQ
  
  >AGZ57835.1 yvqH [Bacillus amyloliquefaciens CC178]
  MVLKRIRNMFVASVNEGLDKLENPKVMLNQYVRDMESDIAKAKQTIVKQHTIVHQFKKKQEDASETAAKR
  KNQAQLAFDAGEEELAKKALTEMKYLEGKAAEHEKAYEQAKTQLAELKEQLETLETRLRDVKDKKQALIA
  RANAANAKEHMNASFDKIDSESAYREFLRMESRIEEMEVRVKYGTSAEANTEYSRSQYSDEVEAEIEKMR
  SLSLEKTERQKAAHE
  
  >AEB64964.1 Laminin subunit gamma-2 Laminin 5 gamma 2 subunit [Bacillus amyloliquefaciens LL3]
  MVLKRIRDMFVASVNEGLDKLENPKVMLNQYVRDMESDIAKAKQTIVKQHTIVHQFKKKQEDASETAAKR
  KNQAQLAFDAGEEELAKKALTEMKYLEGKAAEHEKAYDQAKTQLAELKEQLETLETRLRDVKDKKQALIA
  RANAAKAKEHMNASFDKIDSESAYREFLRMENRIEEMEVRVKYGTSAEANTEVSRSQYSDEVEAELEKMR
  SLSLEKTEYQKAAHE`,
  accnum: "ANY95992.1, APP15780.1, AGZ55339.1, AGZ57835.1, AEB64964.1",
  msa: `>AGZ55339.1 hypothetical protein U471_06290 [Bacillus amyloliquefaciens CC178]
  ---------------------MSILGRFKDIMSSNINALLDKAENPEKMVDQYLRNLNSDLGKVKAETASVMAEEQRAKRTLTECQADAEKMESYAMKALQAGNEADARTFLERKAAVESRLTELQTAYQLASSNASQMRKMHDKLVADIGELESRRNAIKAKWSVAKTQERMNKLGSSVSNAGQSMTAFGRMEDKVNQALDHANAMAELNASPKDDIDDLTAKYDSNQSSVDDELAALKQKMLFSKDQ
  >ANY95992.1 protein LiaH [Bacillus altitudinis]
  ----------------------MVLRRVRDMFVATVNEGLDKLENPRVMLNQYVRDMEDDIAKAKHAIIKQQTIQQGFLRKAEETEAFADKRKKQAELAFQAGEEELVRKALTEMKYFEEKHNEYQEAYQQSVKQLKELKEQLQHLETKLRDVKDKKQALIARANAAQAKQHMNESMNKVDSESAYKE-FLRMENRIEEMETKAGSYAQFADQGAYAHLDYADEVEKEWQKLQRSKQPEKQPAN-----
  >APP15780.1 protein LiaH
  XBACILLXSXALTITXDINISXMVLRRVRDMFVATVNEGLDKLENPRVMLNQYVRDMEDDIAKAKHAIIKQQTIQQGFLRKAEETEAFADKRKKQAELAFHAGEEELARKALTEMKYFEEKHNEYQDAYQQSVKQLKELKEQLQHLETKLRDVKDKKQALIARANAAQAKQHMNESMNKVDSESAYKE-FLRMENRIEEMETKAGSYAQFADQGAYAHLDYADEVEKEWQKLQRSKQLEKQPAN-----
  >AGZ57835.1 yvqH [Bacillus amyloliquefaciens CC178]
  ----------------------MVLKRIRNMFVASVNEGLDKLENPKVMLNQYVRDMESDIAKAKQTIVKQHTIVHQFKKKQEDASETAAKRKNQAQLAFDAGEEELAKKALTEMKYLEGKAAEHEKAYEQAKTQLAELKEQLETLETRLRDVKDKKQALIARANAANAKEHMNASFDKIDSESAYRE-FLRMESRIEEMEVRVKYGTSAEANTEYSRSQYSDEVEAEIEKM-RSLSLEKTERQKAAHE
  >AEB64964.1 Laminin subunit gamma-2 Laminin 5 gamma 2 subunit [Bacillus amyloliquefaciens LL3]
  ----------------------MVLKRIRDMFVASVNEGLDKLENPKVMLNQYVRDMESDIAKAKQTIVKQHTIVHQFKKKQEDASETAAKRKNQAQLAFDAGEEELAKKALTEMKYLEGKAAEHEKAYDQAKTQLAELKEQLETLETRLRDVKDKKQALIARANAAKAKEHMNASFDKIDSESAYRE-FLRMENRIEEMEVRVKYGTSAEANTEVSRSQYSDEVEAELEKM-RSLSLEKTEYQKAAHE`,
  blast: "",
  interproscan: "",
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
  const [sequence, setSequence] = useState("");
  const [email, setEmail] = useLocalStorage("molevolvr-email", "");

  const onExample = () => {
    setSequence(sequenceExamples[inputFormat]);
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

          <Radios
            label="What do you want to input?"
            tooltip="Lorem ipsum"
            options={inputTypes}
            value={inputType}
            onChange={setInputType}
            name="inputFormat"
          />

          <SelectSingle
            label="What format is your input in?"
            layout="vertical"
            tooltip="Lorem ipsum"
            options={inputFormats[inputType]}
            value={inputFormat}
            onChange={setInputFormat}
            name="inputFormat"
          />

          {inputType === "list" && (
            <TextBox
              label="Input"
              placeholder={sequenceExamples[inputFormat]
                .split("\n")
                .slice(0, 2)
                .join("\n")}
              multi={true}
              value={sequence}
              onChange={setSequence}
              name="sequence"
            />
          )}

          <div className="flex-row gap-sm">
            <UploadButton
              text="Upload"
              icon={<FaUpload />}
              onUpload={console.debug}
              accept=".fa,.faa,.fasta"
            />
            <Button text="Example" icon={<FaLightbulb />} onClick={onExample} />
          </div>
        </Section>

        <Section>
          <Heading level={2} icon={<FaMicroscope />}>
            Parameters
          </Heading>
        </Section>

        <Section>
          <Heading level={2} icon={<FaRegPaperPlane />}>
            Submit
          </Heading>

          <TextBox
            className="narrow"
            label="Analaysis Name"
            placeholder="New Analysis"
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
