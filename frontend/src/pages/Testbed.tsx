import { useMemo, useRef } from "react";
import {
  FaArrowRight,
  FaArrowsUpDown,
  FaBarcode,
  FaBars,
  FaBeerMugEmpty,
  FaBrush,
  FaCat,
  FaChampagneGlasses,
  FaChartPie,
  FaCircleInfo,
  FaClipboardList,
  FaFaceSadCry,
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
  FaRegWindowMaximize,
  FaShapes,
  FaShareNodes,
  FaSitemap,
  FaSliders,
  FaStop,
  FaTableCells,
} from "react-icons/fa6";
import { PiSquaresFourFill } from "react-icons/pi";
import { mapValues, sample, startCase, uniq } from "lodash";
import { useElementSize } from "@reactuses/core";
import CustomIcon from "@/assets/custom-icon.svg?react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Collapsible from "@/components/Collapsible";
import Dialog from "@/components/Dialog";
import Flex from "@/components/Flex";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Heatmap from "@/components/Heatmap";
import IPR from "@/components/IPR";
import Legend from "@/components/Legend";
import Link from "@/components/Link";
import { types } from "@/components/Mark";
import Meta from "@/components/Meta";
import MSA from "@/components/MSA";
import { clustalColors, clustalType } from "@/components/msa-clustal";
import Network from "@/components/Network";
import NumberBox from "@/components/NumberBox";
import Popover from "@/components/Popover";
import Radios from "@/components/Radios";
import Section from "@/components/Section";
import SelectMulti from "@/components/SelectMulti";
import SelectSingle from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import Sunburst from "@/components/Sunburst";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import TextBox from "@/components/TextBox";
import Tile from "@/components/Tile";
import { toast } from "@/components/Toasts";
import Tooltip from "@/components/Tooltip";
import Tree from "@/components/Tree";
import Upset from "@/components/Upset";
import {
  analysis,
  edges,
  heatmap,
  iprSequence,
  iprTracks,
  label,
  logChange,
  msaTracks,
  nodes,
  sunburst,
  tree,
  upset,
  words,
} from "@/pages/testbed-data";
import { useColorMap } from "@/util/color";
import { useTheme } from "@/util/hooks";
import { seed } from "@/util/seed";
import { getShapeMap } from "@/util/shapes";
import { formatDate, formatNumber } from "@/util/string";
import tableData from "../../fixtures/table.json";

/** test and example usage of formatting, elements, components, etc. */
const TestbedPage = () => {
  return (
    <>
      <Meta title="Testbed" />

      <Section>
        <Heading level={1}>Testbed</Heading>

        <div className="mini-table">
          <span>Fake Analysis ID</span>
          <span>{analysis}</span>
          <span>Seed</span>
          <Link to={`?seed=${seed}`}>{seed}</Link>
        </div>
      </Section>

      {/* complex components */}

      <SectionLegend />
      <SectionUpset />
      <SectionSunburst />
      <SectionHeatmap />
      <SectionTree />
      <SectionNetwork />
      <SectionMSA />
      <SectionIPR />

      {/* formatting */}

      <SectionElements />
      <SectionHeading />

      {/* generic components */}

      <SectionLink />
      <SectionButton />
      <SectionTextBox />
      <SectionSelect />
      <SectionCheckBox />
      <SectionSlider />
      <SectionNumberBox />
      <SectionRadios />
      <SectionAgo />
      <SectionAlert />
      <SectionTabs />
      <SectionToast />
      <SectionCollapsible />
      <SectionTile />
      <SectionTable />
      <SectionTooltip />
      <SectionPopover />
      <SectionDialog />

      {/* misc */}

      <SectionForm />
      <SectionCSS />
    </>
  );
};

export default TestbedPage;

/* regular html elements and css classes for basic formatting */
const SectionElements = () => {
  /** palettes for color maps */
  const lightColorMap = uniq(Object.values(useColorMap(words, "mode")));
  const darkColorMap = uniq(Object.values(useColorMap(words, "invert")));

  return (
    <Section>
      <Heading level={2} icon={<FaBrush />}>
        Elements
      </Heading>

      {/* main color palette */}
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

      {/* color maps */}
      {[lightColorMap, darkColorMap].map((colors, index) => (
        <Flex key={index} gap="none">
          {colors.map((color, index) => (
            <div
              key={index}
              aria-hidden
              style={{
                width: 50,
                height: 50,
                background: color,
              }}
            />
          ))}
        </Flex>
      ))}

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
        Turpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Ullamcorper
        dignissim cras tincidunt lobortis feugiat vivamus at augue. Blandit
        cursus risus at ultrices mi tempus. Odio aenean sed adipiscing diam
        donec.
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
        Key sentence at start of section, maybe a brief 1-2 sentence description
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
  );
};

const SectionHeading = () => (
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
);

const SectionLegend = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [width] = useElementSize(ref);

  const labels = useMemo(
    () =>
      Array(10)
        .fill(null)
        .map(label)
        .map((label) => label || ""),
    [],
  );
  const shapesMap = useMemo(() => getShapeMap(labels), [labels]);
  const colorMap = useColorMap(labels, "mode");
  const entries = useMemo(
    () =>
      mapValues(colorMap, (color, label) => ({
        color,
        shape: shapesMap[label],
        stroke: Math.random() > 0.75,
      })),
    [colorMap, shapesMap],
  );

  return (
    <Section>
      <Heading level={2} icon={<FaShapes />}>
        Legend
      </Heading>

      <div
        ref={ref}
        className="card"
        style={{
          width: 400,
          padding: 20,
          resize: "both",
          overflow: "auto",
        }}
      >
        <Legend entries={entries} x={0} y={0} w={width} />
      </div>
    </Section>
  );
};

const SectionUpset = () => (
  <Section>
    <Heading level={2} icon={<FaFaceSadCry />}>
      Upset
    </Heading>

    <Upset title={label()} filename={[analysis]} {...upset} />
  </Section>
);

const SectionSunburst = () => (
  <Section>
    <Heading level={2} icon={<FaChartPie />}>
      Sunburst
    </Heading>

    <Sunburst title={label()} filename={[analysis]} data={sunburst} />
  </Section>
);

const SectionHeatmap = () => (
  <Section>
    <Heading level={2} icon={<PiSquaresFourFill />}>
      Heatmap
    </Heading>

    <Heatmap title={label()} filename={[analysis]} {...heatmap} />
  </Section>
);

const SectionTree = () => (
  <Section>
    <Heading level={2} icon={<FaSitemap />}>
      Tree
    </Heading>

    <Tree title={label()} filename={[analysis]} data={tree} />
  </Section>
);

const SectionNetwork = () => (
  <Section>
    <Heading level={2} icon={<FaShareNodes />}>
      Network
    </Heading>

    <Network filename={[analysis]} nodes={nodes} edges={edges} />
  </Section>
);

const SectionMSA = () => (
  <Section>
    <Heading level={2} icon={<FaTableCells />}>
      MSA
    </Heading>

    <MSA
      title={label()}
      filename={[analysis]}
      tracks={msaTracks}
      getType={clustalType}
      colorMap={clustalColors}
    />
  </Section>
);

const SectionIPR = () => (
  <Section>
    <Heading level={2} icon={<FaBarcode />}>
      IPR
    </Heading>

    <IPR
      title={label()}
      filename={[analysis]}
      sequence={iprSequence}
      tracks={iprTracks}
    />
  </Section>
);

const SectionLink = () => (
  <Section>
    <Heading level={2} icon={<FaLink />}>
      Link
    </Heading>

    <Flex>
      <Link to="/">Internal Link</Link>
      <Link to="https://medschool.cuanschutz.edu/dbmi">External Link</Link>
    </Flex>
  </Section>
);

const SectionButton = () => (
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
);

const SectionTextBox = () => (
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
);

const SectionSelect = () => (
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
);

const SectionCheckBox = () => (
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
);

const SectionSlider = () => (
  <Section>
    <Heading level={2} icon={<FaSliders />}>
      Slider
    </Heading>

    <Flex>
      <Slider label="Single" min={0} max={100} step={1} onChange={logChange} />
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
);

const SectionNumberBox = () => (
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
);

const SectionRadios = () => (
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
);

const SectionAgo = () => (
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
);

const SectionAlert = () => (
  <Section>
    <Heading level={2} icon={<FaCircleInfo />}>
      Alert
    </Heading>

    <Flex direction="column">
      <Alert>
        Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Alert>
      {Object.keys(types).map((type) => (
        <Alert key={type} type={type as keyof typeof types}>
          {startCase(type)}
        </Alert>
      ))}
    </Flex>
  </Section>
);

const SectionTabs = () => (
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
);

const SectionToast = () => (
  <Section>
    <Heading level={2} icon={<FaChampagneGlasses />}>
      Toast
    </Heading>

    <Flex>
      <Button
        text="Unique Toast"
        onClick={() =>
          toast(
            sample(["Apple", "Banana", "Cantaloupe", "Durian", "Elderberry"]),
          )
        }
      />
      <Button
        text="Overwriting Toast"
        onClick={() => {
          toast(`ABC`, sample(["info", "success", "warning", "error"]), "abc");
          toast(`ABC`, sample(["info", "success", "warning", "error"]), "abc");
        }}
      />
    </Flex>
  </Section>
);

const SectionCollapsible = () => (
  <Section>
    <Heading level={2} icon={<FaArrowsUpDown />}>
      Collapsible
    </Heading>

    <Collapsible text="Expand Me" tooltip="Tooltip">
      <p>
        Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Facilisis sed odio
        morbi quis commodo odio aenean sed. Urna cursus eget nunc scelerisque
        viverra mauris in aliquam. Elementum integer enim neque volutpat ac
        tincidunt vitae semper quis. Non diam phasellus vestibulum lorem sed
        risus. Amet luctus venenatis lectus magna.
      </p>
    </Collapsible>
  </Section>
);

const SectionTile = () => (
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
);

const SectionTable = () => (
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
);

const SectionTooltip = () => (
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
);

const SectionPopover = () => (
  <Section>
    <Heading level={2} icon={<FaMessage />}>
      Popover
    </Heading>

    <Popover
      content={
        <>
          <p>
            <Link to="https://medschool.cuanschutz.edu/dbmi">Interactive</Link>{" "}
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
        <Button text="Popover" />
      </Tooltip>
    </Popover>
  </Section>
);

const SectionDialog = () => (
  <Section>
    <Heading level={2} icon={<FaRegWindowMaximize />}>
      Dialog
    </Heading>

    <Dialog
      title="Lorem ipsum"
      content={
        <>
          <Tabs>
            <Tab text="One" tooltip="Tooltip">
              <p>
                <Tooltip content="Odio semper orci ante varius porttitor. Ultricies torquent venenatis cursus praesent vel lacus ligula nostra iaculis. Parturient mauris id eget metus varius.">
                  <span className="text-tooltip" tabIndex={0} role="button">
                    Lorem
                  </span>
                </Tooltip>{" "}
                ipsum odor amet, consectetuer adipiscing elit. Semper taciti
                viverra ultricies mus aenean ligula. Donec dis torquent orci in
                odio. Nulla cras ex orci ridiculus augue malesuada. Mattis urna
                congue imperdiet dolor sapien himenaeos praesent vitae ut.
                Congue sapien a dapibus bibendum dolor feugiat etiam sodales.
                Phasellus mattis feugiat augue iaculis; non venenatis dolor.
                Litora magnis nec fames quam phasellus placerat. Maximus fusce
                volutpat convallis taciti quam nam posuere.
              </p>

              <Collapsible text="Collapsible">
                <p>
                  Odio semper orci ante varius porttitor. Ultricies torquent
                  venenatis cursus praesent vel lacus ligula nostra iaculis.
                  Parturient mauris id eget metus varius. Nulla suscipit
                  suspendisse natoque praesent ridiculus nisi molestie. Taciti
                  suscipit luctus morbi mauris; sem ante id orci. Venenatis
                  suspendisse dui finibus ipsum mus lorem placerat vitae. Mattis
                  nullam quisque morbi tempor, ex consectetur urna odio. Class
                  cras dapibus, augue suspendisse volutpat justo. Blandit
                  imperdiet conubia penatibus euismod condimentum maecenas
                  pharetra. Per ad ultricies viverra erat et massa ante.
                </p>
              </Collapsible>

              <Popover content="Odio semper orci ante varius porttitor.">
                <Tooltip content="Click to open">
                  <Button text="Popover" />
                </Tooltip>
              </Popover>
            </Tab>

            <Tab text="Two" tooltip="Tooltip">
              <p>
                Odio semper orci ante varius porttitor. Ultricies torquent
                venenatis cursus praesent vel lacus ligula nostra iaculis.
                Parturient mauris id eget metus varius. Nulla suscipit
                suspendisse natoque praesent ridiculus nisi molestie. Taciti
                suscipit luctus morbi mauris; sem ante id orci. Venenatis
                suspendisse dui finibus ipsum mus lorem placerat vitae. Mattis
                nullam quisque morbi tempor, ex consectetur urna odio. Class
                cras dapibus, augue suspendisse volutpat justo. Blandit
                imperdiet conubia penatibus euismod condimentum maecenas
                pharetra. Per ad ultricies viverra erat et massa ante.
              </p>
            </Tab>

            <Tab text="Three" tooltip="Tooltip">
              <p>
                Leo dolor non arcu scelerisque tincidunt cursus suspendisse
                natoque. Nunc proin iaculis massa mi leo ipsum, mattis libero.
                Ad malesuada orci luctus urna integer tempor urna. Netus eu
                sagittis rutrum sagittis viverra vitae posuere. Eros laoreet
                gravida orci etiam nam nisi vitae ultricies. Litora luctus
                parturient elementum taciti, facilisis justo.
              </p>
            </Tab>
          </Tabs>
        </>
      }
      bottomContent={(close) => (
        <Flex>
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
          <Button
            text="Nevermind"
            onClick={() => {
              console.debug("Cancel");
              close();
            }}
          />
          <Button
            text="Yes, delete"
            design="critical"
            onClick={() => {
              console.debug("Delete");
              close();
            }}
          />
        </Flex>
      )}
    >
      <Tooltip content="Click to open">
        <Button text="Dialog" />
      </Tooltip>
    </Dialog>
  </Section>
);

const SectionForm = () => (
  <Section>
    <Heading level={2} icon={<FaClipboardList />}>
      Form
    </Heading>

    <Form onSubmit={console.debug}>
      <div className="grid full">
        <TextBox label="Email" name="email" type="email" autoComplete="email" />
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
);

/* (for CSS inspection/testing; not typically used directly) */
const SectionCSS = () => (
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
);
