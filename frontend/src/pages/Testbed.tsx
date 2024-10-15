import {
  FaArrowRight,
  FaArrowsUpDown,
  FaBars,
  FaBeerMugEmpty,
  FaBrush,
  FaCat,
  FaChampagneGlasses,
  FaCircleInfo,
  FaClipboardList,
  FaFont,
  FaHashtag,
  FaHorse,
  FaLink,
  FaListCheck,
  FaMagnifyingGlass,
  FaMessage,
  FaPalette,
  FaRegCircleDot,
  FaRegFolder,
  FaRegHourglass,
  FaRegMessage,
  FaRegSquareCheck,
  FaShareNodes,
  FaSliders,
  FaStop,
  FaTableCells,
} from "react-icons/fa6";
import { sample, uniqueId } from "lodash";
import CustomIcon from "@/assets/custom-icon.svg?react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Collapsible from "@/components/Collapsible";
import Flex from "@/components/Flex";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import Network from "@/components/Network";
import NumberBox from "@/components/NumberBox";
import Popover from "@/components/Popover";
import Radios from "@/components/Radios";
import Section from "@/components/Section";
import SelectMulti from "@/components/SelectMulti";
import SelectSingle from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import TextBox from "@/components/TextBox";
import Tile from "@/components/Tile";
import { toast } from "@/components/Toasts";
import Tooltip from "@/components/Tooltip";
import { useTheme } from "@/util/hooks";
import { formatDate, formatNumber } from "@/util/string";
import tableData from "../../fixtures/table.json";
import type { SequencesMSA, Region } from "@nightingale-elements/nightingale-msa";
import NightingaleMSAWrapper from "@/components/nightingale-wrapper/NightingaleMSAWrapper";

/** util func to log change to components for testing */
const logChange = (...args: unknown[]) => {
  console.debug(...args);
};

/** generate fake node data */
const nodes = Array(200)
  .fill(null)
  .map(() => ({
    id: uniqueId(),
    label: sample([
      "Lbl.",
      "Label",
      "Long Label",
      "Really Long Label",
      undefined,
    ]),
    type: sample([
      "gene",
      "disease",
      "compound",
      "anatomy",
      "phenotype",
      undefined,
    ]),
    strength: sample([0, 0.1, 0.02, 0.003, 0.0004, 0.00005, undefined]),
    extra: sample(["cat", "dog", "bird"]),
  }));
const ids = nodes.map((node) => node.id);
/** generate fake edge data */
const edges = Array(500)
  .fill(null)
  .map(() => ({
    id: uniqueId(),
    label: sample([
      "Lbl.",
      "Label",
      "Long Label",
      "Really Long Label",
      undefined,
    ]),
    source: sample(ids)!,
    target: sample(ids)!,
    type: sample([
      "causes",
      "interacts with",
      "upregulates",
      "includes",
      "presents",
      undefined,
    ]),
    direction: sample([-1, 0, 1, undefined] as const),
    strength: sample([10, 11, 12, 13, 14, 15, undefined]),
  }));

/** add some duplicate edges */
for (let times = 0; times < 10; times++)
  edges.push({ ...sample(edges)!, id: uniqueId() });

/** add some loop edges */
for (let times = 0; times < 10; times++) {
  const { id } = sample(nodes)!;
  const edge = sample(edges)!;
  edges.push({ ...edge, id: uniqueId(), source: id, target: id });
}
type ExtendedRegion = Region & {
  type: string;
  start: number;
  end: number;
};
/** test and example usage of formatting, elements, components, etc. */
const TestbedPage = () => {
  const mockSequences: SequencesMSA = [
    { name: "Seq1", sequence: "ATGCATGCATGC" },
    { name: "Seq2", sequence: "ATGC-TGCATGC" },
    { name: "Seq3", sequence: "ATGCATGC-TGC" },
  ];

  const mockFeatures: ExtendedRegion[] = [
    {
      type: "domain",
      start: 1,
      end: 6,
      residues: { from: 1, to: 6 },
      sequences: { from: 0, to: 2 },
      mouseOverFillColor: "rgba(255, 0, 0, 0.5)",
      fillColor: "rgba(255, 0, 0, 0.3)",
      borderColor: "rgb(255, 0, 0)",
    },
    {
      type: "motif",
      start: 8,
      end: 12,
      residues: { from: 8, to: 12 },
      sequences: { from: 0, to: 2 },
      mouseOverFillColor: "rgba(255, 0, 0, 0.5)",
      fillColor: "rgba(255, 0, 0, 0.3)",
      borderColor: "rgb(255, 0, 0)",
    },
  ];

  return (
    <>
      <Meta title="Testbed" />

      <Section>
        <Heading level={1}>Testbed</Heading>
      </Section>

      <Section>
        <Heading level={2} icon={<FaShareNodes />}>
          Network
        </Heading>

        <Network nodes={nodes} edges={edges} />
      </Section>

      <Section>
        <Heading level={2} icon={<FaBars />}>
          MSA Visualization
        </Heading>
        <NightingaleMSAWrapper sequences={mockSequences} features={mockFeatures} />

      </Section>



      {/* regular html elements and css classes for basic formatting */}
      <Section>
        <Heading level={2} icon={<FaBrush />}>
          Elements
        </Heading>

        {/* color palette */}
        <Flex gap="none">
          {Object.entries(useTheme())
            .filter(
              ([, value]) => value.startsWith("#") || value.startsWith("hsl"),
            )
            .map(([variable], index) => (
              <Tooltip key={index} content={variable}>
                <div
                  aria-hidden
                  style={{
                    width: 50,
                    height: 50,
                    background: `var(${variable})`,
                  }}
                />
              </Tooltip>
            ))}
        </Flex>

        <p>
          Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Facilisis sed odio
          morbi quis commodo odio aenean sed. Urna cursus eget nunc scelerisque
          viverra mauris in aliquam. Elementum integer enim neque volutpat ac
          tincidunt vitae semper quis. Non diam phasellus vestibulum lorem sed
          risus. Amet luctus venenatis lectus magna.
        </p>

        <p className="narrow">
          Vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt.
          Turpis nunc eget lorem dolor sed viverra ipsum nunc aliquet.
          Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at
          augue. Blandit cursus risus at ultrices mi tempus. Odio aenean sed
          adipiscing diam donec.
        </p>

        <div className="mini-table">
          <span>Prop 1</span>
          <span>123</span>
          <span>Prop 2</span>
          <span>abc</span>
          <span>Prop 3</span>
          <span>xyz</span>
        </div>

        {/* always format values with util functions as appropriate */}
        <p className="center">
          {formatNumber(123456)}
          <br />
          {formatNumber(1234567, true)}
          <br />
          {formatDate(new Date())}
        </p>

        <p className="narrow center primary">
          Key sentence at start of section, maybe a brief 1-2 sentence
          description
        </p>

        <hr />

        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>
            <ol>
              <li>Nested list item 3a</li>
              <li>Nested list item 3b</li>
              <li>Nested list item 3c</li>
            </ol>
          </li>
        </ul>

        <blockquote>
          It was the best of times, it was the worst of times, it was the age of
          wisdom, it was the age of foolishness, it was the epoch of belief, it
          was the epoch of incredulity, it was the season of light, it was the
          season of darkness, it was the spring of hope, it was the winter of
          despair.
        </blockquote>

        <hr />

        <p>
          Some <code>inline code</code>.
        </p>

        <pre tabIndex={0}>
          {`const popup = document.querySelector("#popup"); 
popup.style.width = "100%";
popup.innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
`}
        </pre>
      </Section>

      {/* heading */}
      <Section>
        <Heading level={2} icon="X">
          Heading 2
        </Heading>
        <Heading level={3} icon="Y">
          Heading 3
        </Heading>
        <Heading level={4} icon="Z">
          Heading 4
        </Heading>
      </Section>

      {/* link */}
      <Section>
        <Heading level={2} icon={<FaLink />}>
          Link
        </Heading>

        <Flex>
          <Link to="/">Internal Link</Link>
          <Link to="https://medschool.cuanschutz.edu/dbmi">External Link</Link>
        </Flex>
      </Section>

      {/* button */}
      <Section>
        <Heading level={2} icon={<FaStop />}>
          Button
        </Heading>

        <Flex>
          <Button
            to="/about"
            text="As Link"
            design="hollow"
            icon={<FaArrowRight />}
            tooltip="Tooltip"
          />
          <Button to="/about" text="As Link" tooltip="Tooltip" />
          <Button
            to="/about"
            icon={<CustomIcon />}
            design="critical"
            tooltip="Tooltip"
          />
          <Button
            onClick={() => window.alert("Hello World")}
            text="As Button"
            design="hollow"
            tooltip="Tooltip"
          />
          <Button
            onClick={() => window.alert("Hello World")}
            text="As Button"
            icon={<FaArrowRight />}
            tooltip="Tooltip"
          />
          <Button
            onClick={() => window.alert("Hello World")}
            icon={<CustomIcon />}
            design="critical"
            tooltip="Tooltip"
          />
        </Flex>
      </Section>

      {/* textbox */}
      <Section>
        <Heading level={2} icon={<FaFont />}>
          Text Box
        </Heading>

        <div className="grid">
          <TextBox label="Label" placeholder="Search" onChange={logChange} />
          <TextBox
            label="Label"
            placeholder="Search"
            multi
            icon={<FaMagnifyingGlass />}
          />
          <TextBox
            layout="horizontal"
            label="Label"
            placeholder="Search"
            onChange={logChange}
          />
          <TextBox
            layout="horizontal"
            label="Label"
            placeholder="Search"
            multi
            icon={<FaMagnifyingGlass />}
          />
        </div>
      </Section>

      {/* select */}
      <Section>
        <Heading level={2} icon={<FaListCheck />}>
          Select
        </Heading>

        <Flex>
          <SelectSingle
            label="Single"
            tooltip="Tooltip"
            options={
              [
                { id: "1", primary: "Lorem" },
                { id: "2", primary: "Ipsum" },
                { id: "3", primary: "Dolor" },
              ] as const
            }
            onChange={logChange}
          />
          <SelectMulti
            layout="horizontal"
            label="Multi"
            tooltip="Tooltip"
            options={
              [
                { id: "a", primary: "Lorem" },
                { id: "b", primary: "Ipsum", secondary: "123" },
                {
                  id: "c",
                  primary: "Dolor",
                  secondary: "123",
                  icon: <FaHorse />,
                },
              ] as const
            }
            onChange={logChange}
          />
        </Flex>
      </Section>

      {/* checkbox */}
      <Section>
        <Heading level={2} icon={<FaRegSquareCheck />}>
          Check Box
        </Heading>

        <CheckBox
          label="Accept terms and conditions"
          tooltip="Tooltip"
          name="accept"
          onChange={logChange}
        />
      </Section>

      {/* slider */}
      <Section>
        <Heading level={2} icon={<FaSliders />}>
          Slider
        </Heading>

        <Flex>
          <Slider
            label="Single"
            min={0}
            max={100}
            step={1}
            onChange={logChange}
          />
          <Slider
            layout="horizontal"
            label="Range"
            multi
            min={0}
            max={10000}
            step={100}
            onChange={logChange}
          />
        </Flex>
      </Section>

      {/* number box */}
      <Section>
        <Heading level={2} icon={<FaHashtag />}>
          Number Box
        </Heading>

        <Flex>
          <NumberBox
            label="Vertical"
            min={0}
            max={100}
            step={1}
            onChange={logChange}
            tooltip="Tooltip"
          />
          <NumberBox
            layout="horizontal"
            label="Horizontal"
            min={-10000}
            max={10000}
            step={100}
            onChange={logChange}
            tooltip="Tooltip"
          />
        </Flex>
      </Section>

      {/* radios */}
      <Section>
        <Heading level={2} icon={<FaRegCircleDot />}>
          Radios
        </Heading>

        <Radios
          label="Choice"
          tooltip="Tooltip"
          options={
            [
              { id: "first", primary: "Primary lorem ipsum" },
              {
                id: "second",
                primary: "Primary lorem ipsum",
                secondary: "Secondary lorem ipsum",
              },
              {
                id: "third",
                primary: "Primar lorem ipsum",
                icon: <FaCat />,
              },
            ] as const
          }
          onChange={logChange}
        />
      </Section>

      {/* ago */}
      <Section>
        <Heading level={2} icon={<FaRegHourglass />}>
          Ago
        </Heading>

        <Flex>
          <Ago date={new Date()} />
          <Ago date="Nov 12 2023" />
          <Ago date="Jun 1 2020" />
        </Flex>
      </Section>

      {/* alert */}
      <Section>
        <Heading level={2} icon={<FaCircleInfo />}>
          Alert
        </Heading>

        <Flex direction="column">
          <Alert>
            Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Alert>
          <Alert type="loading">Loading</Alert>
          <Alert type="success">Success</Alert>
          <Alert type="warning">Warning</Alert>
          <Alert type="error">Error</Alert>
        </Flex>
      </Section>

      {/* tabs */}
      <Section>
        <Heading level={2} icon={<FaRegFolder />}>
          Tabs
        </Heading>

        <Tabs syncWithUrl="tab" defaultValue="drinks">
          <Tab text="Animals" icon={<FaCat />} tooltip="Tooltip">
            <ul>
              <li>Cat</li>
              <li>Dog</li>
              <li>Bird</li>
            </ul>
          </Tab>
          <Tab text="Drinks" icon={<FaBeerMugEmpty />} tooltip="Tooltip">
            <ul>
              <li>Soda</li>
              <li>Beer</li>
              <li>Water</li>
            </ul>
          </Tab>
          <Tab text="Colors" icon={<FaPalette />}>
            <ul>
              <li>Red</li>
              <li>Purple</li>
              <li>Blue</li>
            </ul>
          </Tab>
        </Tabs>
      </Section>

      {/* toast */}
      <Section>
        <Heading level={2} icon={<FaChampagneGlasses />}>
          Toast
        </Heading>

        <Flex>
          <Button
            text="Unique Toast"
            onClick={() =>
              toast(
                sample([
                  "Apple",
                  "Banana",
                  "Cantaloupe",
                  "Durian",
                  "Elderberry",
                ]),
              )
            }
          />
          <Button
            text="Overwriting Toast"
            onClick={() => {
              toast(
                `ABC`,
                sample(["info", "success", "warning", "error"]),
                "abc",
              );
              toast(
                `ABC`,
                sample(["info", "success", "warning", "error"]),
                "abc",
              );
            }}
          />
        </Flex>
      </Section>

      {/* collapsible */}
      <Section>
        <Heading level={2} icon={<FaArrowsUpDown />}>
          Collapsible
        </Heading>

        <Collapsible text="Expand Me" tooltip="Tooltip">
          <p>
            Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Facilisis sed odio morbi quis commodo odio aenean sed. Urna cursus
            eget nunc scelerisque viverra mauris in aliquam. Elementum integer
            enim neque volutpat ac tincidunt vitae semper quis. Non diam
            phasellus vestibulum lorem sed risus. Amet luctus venenatis lectus
            magna.
          </p>
        </Collapsible>
      </Section>

      {/* tile */}
      <Section>
        <Heading level={2} icon={<CustomIcon />}>
          Tile
        </Heading>

        <Flex gap="lg">
          <Tile
            icon={<FaRegHourglass />}
            primary={formatNumber(1234)}
            secondary="Sequences"
          />
          <Tile
            icon={<CustomIcon />}
            primary={formatNumber(5678)}
            secondary="Proteins"
          />
          <Tile
            icon={<FaBars />}
            primary={formatNumber(99999)}
            secondary="Analyses"
          />
        </Flex>
      </Section>

      {/* table */}
      <Section>
        <Heading level={2} icon={<FaTableCells />}>
          Table
        </Heading>

        <Table
          cols={[
            { key: "name", name: "Name" },
            { key: "age", name: "Age", filterType: "number" },
            {
              key: "status",
              name: "Status",
              filterType: "enum",
            },
            {
              key: "text",
              name: "Long text",
              filterType: "string",
              show: false,
              render: (cell) => <div className="truncate-5">{cell}</div>,
            },
          ]}
          rows={tableData}
        />
      </Section>

      {/* tooltip (for testing; not typically used directly) */}
      <Section>
        <Heading level={2} icon={<FaRegMessage />}>
          Tooltip
        </Heading>

        <Flex>
          <Tooltip content="Minimal, non-interactive help or contextual info">
            <span className="text-tooltip" tabIndex={0} role="button">
              Plain content
            </span>
          </Tooltip>
          <Tooltip
            content={
              <span>
                <em>Minimal</em>, <strong>non-interactive</strong> help or
                contextual info
              </span>
            }
          >
            <span className="text-tooltip" tabIndex={0} role="button">
              Rich content
            </span>
          </Tooltip>
        </Flex>
      </Section>

      {/* popover (for testing; not typically used directly) */}
      <Section>
        <Heading level={2} icon={<FaMessage />}>
          Popover
        </Heading>

        <Popover
          content={
            <>
              <p>
                <Link to="https://medschool.cuanschutz.edu/dbmi">
                  Interactive
                </Link>{" "}
                content
              </p>
              <Flex>
                <Button text="Save" />
                <SelectSingle
                  layout="horizontal"
                  label="Select"
                  options={
                    [
                      { id: "csv", primary: "CSV" },
                      { id: "tsv", primary: "TSV" },
                      { id: "pdf", primary: "PDF" },
                    ] as const
                  }
                  onChange={logChange}
                />
              </Flex>
            </>
          }
        >
          <Tooltip content="Click to open">
            <Button text="Menu" />
          </Tooltip>
        </Popover>
      </Section>

      {/* form */}
      <Section>
        <Heading level={2} icon={<FaClipboardList />}>
          Form
        </Heading>

        <Form onSubmit={console.debug}>
          <div className="grid full">
            <TextBox
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
            />
            <TextBox label="Description" multi name="description" required />
            <NumberBox label="Age" name="age" />
            <Slider label="Cutoff" name="cutoff" />
            <Slider label="Range" multi name="range" />
            <Radios
              label="Order"
              options={[
                { id: "one", primary: "One" },
                { id: "two", primary: "Two" },
                { id: "three", primary: "Three" },
              ]}
              name="order"
            />
            <SelectSingle
              label="Select"
              options={
                [
                  { id: "a", primary: "Lorem" },
                  { id: "b", primary: "Ipsum", secondary: "123" },
                  {
                    id: "c",
                    primary: "Dolor",
                    secondary: "123",
                    icon: <FaHorse />,
                  },
                ] as const
              }
              name="select-single"
            />
            <SelectMulti
              label="Select"
              options={
                [
                  { id: "a", primary: "Lorem" },
                  { id: "b", primary: "Ipsum", secondary: "123" },
                  {
                    id: "c",
                    primary: "Dolor",
                    secondary: "123",
                    icon: <FaHorse />,
                  },
                ] as const
              }
              name="select-multi"
            />
          </div>
          <CheckBox label="I consent" name="consent" required />
          <Button type="submit" text="Submit" design="critical" />
        </Form>
      </Section>

      {/* (for CSS inspection/testing; not typically used directly) */}
      <Section>
        <button>Test</button>
        <input aria-label="suppress lighthouse" name="suppress lighthouse" />
        <textarea aria-label="suppress lighthouse" name="suppress lighthouse" />
        <table>
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th>C</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
            </tr>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
            </tr>
            <tr>
              <td>1</td>
              <td>2</td>
              <td>3</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  );
};

export default TestbedPage;
