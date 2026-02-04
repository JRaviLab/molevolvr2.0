import { useMemo, useRef, useState } from "react";
import { useElementSize } from "@reactuses/core";
import { mapValues, sample, startCase, uniq } from "lodash";
import {
  AppWindowMac,
  ArrowRight,
  ArrowUpDown,
  Beer,
  Brush,
  ChartPie,
  CircleCheckBig,
  Dog,
  Folder,
  Frown,
  Grid3X3,
  Hash,
  Hourglass,
  Info,
  LinkIcon,
  ListCheck,
  Menu,
  MessageSquare,
  MessageSquareDot,
  NetworkIcon,
  Palette,
  Search,
  Shapes,
  SlidersHorizontal,
  Square,
  SquareCheck,
  TableCellsMerge,
  TableColumnsSplit,
  TableIcon,
  TextCursorInput,
  Type,
  Waypoints,
  Wine,
} from "lucide-react";
import CustomIcon from "@/assets/custom-icon.svg?react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Collapsible from "@/components/Collapsible";
import Dialog from "@/components/Dialog";
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

      <section>
        <Heading level={1}>Testbed</Heading>

        <dl>
          <dt>Fake Analysis ID</dt>
          <dd>{analysis}</dd>
          <dt>Seed</dt>
          <dd>
            <Link to={`?seed=${seed}`}>{seed}</Link>
          </dd>
        </dl>
      </section>

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
      <SectionForm />
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
    <section>
      <Heading level={2} icon={<Brush />}>
        Elements
      </Heading>

      {/* main color palette */}
      <div className="flex flex-wrap">
        {Object.entries(useTheme())
          .filter(([key]) => key.startsWith("--color"))
          .map(([variable], index) => (
            <Tooltip key={index} content={variable}>
              <div
                className="size-10"
                style={{ background: `var(${variable})` }}
                aria-hidden
              />
            </Tooltip>
          ))}
      </div>

      {/* color maps */}
      {[lightColorMap, darkColorMap].map((colors, index) => (
        <div key={index} className="flex flex-wrap">
          {colors.map((color, index) => (
            <div
              key={index}
              className="size-10"
              style={{ background: color }}
              aria-hidden
            />
          ))}
        </div>
      ))}

      <p>
        Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Facilisis sed odio
        morbi quis commodo odio aenean sed. Urna cursus eget nunc scelerisque
        viverra mauris in aliquam. Elementum integer enim neque volutpat ac
        tincidunt vitae semper quis. Non diam phasellus vestibulum lorem sed
        risus. Amet luctus venenatis lectus magna.
      </p>

      <dl>
        <dt>Prop 1</dt>
        <dd>123</dd>
        <dt>Prop 2</dt>
        <dd>abc</dd>
        <dt>Prop 3</dt>
        <dd>xyz</dd>
      </dl>

      {/* always format values with util functions as appropriate */}
      <p className="text-center">
        {formatNumber(123456)}
        <br />
        {formatNumber(1234567, true)}
        <br />
        {formatDate(new Date())}
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
    </section>
  );
};

const SectionHeading = () => (
  <section>
    <Heading level={2} icon="X">
      Heading 2
    </Heading>
    <Heading level={3} icon="Y">
      Heading 3
    </Heading>
    <Heading level={4} icon="Z">
      Heading 4
    </Heading>
  </section>
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
        // eslint-disable-next-line react-hooks/purity
        stroke: Math.random() > 0.75,
      })),
    [colorMap, shapesMap],
  );

  return (
    <section>
      <Heading level={2} icon={<Shapes />}>
        Legend
      </Heading>

      <div
        ref={ref}
        className="
          w-100 max-w-full resize overflow-auto rounded-md p-4 shadow-sm
        "
      >
        <Legend entries={entries} x={0} y={0} w={width} />
      </div>
    </section>
  );
};

const SectionUpset = () => (
  <section>
    <Heading level={2} icon={<Frown />}>
      Upset
    </Heading>

    <Upset title={label()} filename={[analysis]} {...upset} />
  </section>
);

const SectionSunburst = () => (
  <section>
    <Heading level={2} icon={<ChartPie />}>
      Sunburst
    </Heading>

    <Sunburst title={label()} filename={[analysis]} data={sunburst} />
  </section>
);

const SectionHeatmap = () => (
  <section>
    <Heading level={2} icon={<Grid3X3 />}>
      Heatmap
    </Heading>

    <Heatmap title={label()} filename={[analysis]} {...heatmap} />
  </section>
);

const SectionTree = () => (
  <section>
    <Heading level={2} icon={<NetworkIcon />}>
      Tree
    </Heading>

    <Tree title={label()} filename={[analysis]} data={tree} />
  </section>
);

const SectionNetwork = () => (
  <section>
    <Heading level={2} icon={<Waypoints />}>
      Network
    </Heading>

    <Network filename={[analysis]} nodes={nodes} edges={edges} />
  </section>
);

const SectionMSA = () => (
  <section>
    <Heading level={2} icon={<TableColumnsSplit />}>
      MSA
    </Heading>

    <MSA
      title={label()}
      filename={[analysis]}
      tracks={msaTracks}
      getType={clustalType}
      colorMap={clustalColors}
    />
  </section>
);

const SectionIPR = () => (
  <section>
    <Heading level={2} icon={<TableCellsMerge />}>
      IPR
    </Heading>

    <IPR
      title={label()}
      filename={[analysis]}
      sequence={iprSequence}
      tracks={iprTracks}
    />
  </section>
);

const SectionLink = () => (
  <section>
    <Heading level={2} icon={<LinkIcon />}>
      Link
    </Heading>

    <p className="flex gap-4">
      <Link to="/">Internal Link</Link>
      <Link to="https://medschool.cuanschutz.edu/dbmi">External Link</Link>
    </p>
  </section>
);

const SectionButton = () => (
  <section>
    <Heading level={2} icon={<Square />}>
      Button
    </Heading>

    <div className="flex flex-wrap items-center gap-4">
      <Button
        to="/about"
        icon={<ArrowRight />}
        tooltip="Tooltip"
        text="As Link"
        design="hollow"
      />
      <Button to="/about" text="As Link" tooltip="Tooltip" />
      <Button
        to="/about"
        icon={<CustomIcon />}
        tooltip="Tooltip"
        design="critical"
      />
      <Button
        text="As Button"
        tooltip="Tooltip"
        design="hollow"
        onClick={() => window.alert("Hello World")}
      />
      <Button
        icon={<ArrowRight />}
        text="As Button"
        tooltip="Tooltip"
        onClick={() => window.alert("Hello World")}
      />
      <Button
        icon={<CustomIcon />}
        tooltip="Tooltip"
        design="critical"
        onClick={() => window.alert("Hello World")}
      />
    </div>
  </section>
);

const SectionTextBox = () => {
  const [value, setValue] = useState("");

  return (
    <section>
      <Heading level={2} icon={<Type />}>
        Text Box
      </Heading>

      <div className="flex flex-wrap items-center gap-4">
        <TextBox
          label="Label"
          tooltip="Tooltip"
          placeholder="Search"
          value={value}
          onChange={setValue}
        />
        <TextBox
          label="Label"
          tooltip="Tooltip"
          placeholder="Search"
          multi
          icon={<Search />}
          value={value}
          onChange={setValue}
        />
      </div>
    </section>
  );
};

const SectionSelect = () => {
  const singleOptions = [
    { id: "1", primary: "Lorem" },
    { id: "2", primary: "Ipsum" },
    { id: "3", primary: "Dolor" },
  ] as const;

  const [singleValue, setSingleValue] = useState<
    (typeof singleOptions)[number]["id"]
  >(singleOptions[0].id);

  const multiOptions = [
    { id: "a", primary: "Lorem" },
    { id: "b", primary: "Ipsum", secondary: "123" },
    {
      id: "c",
      primary: "Dolor",
      secondary: "123",
      icon: <Dog />,
    },
  ] as const;

  const [multiValue, setMultiValue] = useState<
    (typeof multiOptions)[number]["id"][]
  >([]);

  return (
    <section>
      <Heading level={2} icon={<ListCheck />}>
        Select
      </Heading>

      <div className="flex flex-wrap items-center gap-4">
        <SelectSingle
          label="Single"
          tooltip="Tooltip"
          options={singleOptions}
          value={singleValue}
          onChange={setSingleValue}
        />
        <SelectMulti
          label="Multi"
          tooltip="Tooltip"
          options={multiOptions}
          value={multiValue}
          onChange={setMultiValue}
        />
      </div>
    </section>
  );
};

const SectionCheckBox = () => {
  const [value, setValue] = useState(false);

  return (
    <section>
      <Heading level={2} icon={<SquareCheck />}>
        Check Box
      </Heading>

      <CheckBox
        label="Accept terms and conditions"
        tooltip="Tooltip"
        value={value}
        onChange={setValue}
      />
    </section>
  );
};

const SectionSlider = () => {
  const [singleValue, setSingleValue] = useState(0);
  const [multiValue, setMultiValue] = useState<number[]>([0, 1000]);

  return (
    <section>
      <Heading level={2} icon={<SlidersHorizontal />}>
        Slider
      </Heading>

      <div className="flex flex-wrap items-center gap-4">
        <Slider
          label="Single"
          tooltip="Tooltip"
          min={0}
          max={100}
          step={1}
          value={singleValue}
          onChange={setSingleValue}
        />
        <Slider
          label="Range"
          tooltip="Tooltip"
          multi
          min={0}
          max={10000}
          step={100}
          value={multiValue}
          onChange={setMultiValue}
        />
      </div>
    </section>
  );
};

const SectionNumberBox = () => {
  const [value, setValue] = useState(0);

  return (
    <section>
      <Heading level={2} icon={<Hash />}>
        Number Box
      </Heading>

      <div className="flex flex-wrap items-center gap-4">
        <NumberBox
          label="Number"
          tooltip="Tooltip"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={setValue}
        />
        <NumberBox
          label="Big steps"
          tooltip="Tooltip"
          min={-10000}
          max={10000}
          step={100}
          value={value}
          onChange={setValue}
        />
      </div>
    </section>
  );
};

const SectionRadios = () => {
  const options = [
    { id: "first", primary: "Primary lorem ipsum" },
    {
      id: "second",
      primary: "Primary lorem ipsum",
      secondary: "Secondary lorem ipsum",
    },
    {
      id: "third",
      primary: "Primar lorem ipsum",
      icon: <Dog />,
    },
  ] as const;

  const [value, setValue] = useState<(typeof options)[number]["id"]>(
    options[0].id,
  );

  return (
    <section>
      <Heading level={2} icon={<CircleCheckBig />}>
        Radios
      </Heading>

      <div className="flex flex-col gap-2">
        <Radios
          label="Choice"
          tooltip="Tooltip"
          options={options}
          value={value}
          onChange={setValue}
        />
      </div>
    </section>
  );
};

const SectionAgo = () => (
  <section>
    <Heading level={2} icon={<Hourglass />}>
      Ago
    </Heading>

    <div className="flex flex-wrap items-center gap-4">
      <Ago date={new Date()} />
      <Ago date="Nov 12 2023" />
      <Ago date="Jun 1 2020" />
    </div>
  </section>
);

const SectionAlert = () => (
  <section>
    <Heading level={2} icon={<Info />}>
      Alert
    </Heading>

    <div className="flex flex-col items-center gap-4">
      <Alert>
        Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Alert>
      {Object.keys(types).map((type) => (
        <Alert key={type} type={type as keyof typeof types}>
          {startCase(type)}
        </Alert>
      ))}
    </div>
  </section>
);

const SectionTabs = () => (
  <section>
    <Heading level={2} icon={<Folder />}>
      Tabs
    </Heading>

    <Tabs syncWithUrl="tab" defaultValue="drinks">
      <Tab text="Animals" icon={<Dog />} tooltip="Tooltip">
        <ul>
          <li>Cat</li>
          <li>Dog</li>
          <li>Bird</li>
        </ul>
      </Tab>
      <Tab text="Drinks" icon={<Beer />} tooltip="Tooltip">
        <ul>
          <li>Soda</li>
          <li>Beer</li>
          <li>Water</li>
        </ul>
      </Tab>
      <Tab text="Colors" icon={<Palette />}>
        <ul>
          <li>Red</li>
          <li>Purple</li>
          <li>Blue</li>
        </ul>
      </Tab>
    </Tabs>
  </section>
);

const SectionToast = () => (
  <section>
    <Heading level={2} icon={<Wine />}>
      Toast
    </Heading>

    <div className="flex flex-wrap gap-4">
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
          toast(
            <>
              Toast modified in place <b>{sample(words)}</b>
            </>,
            sample(["info", "success", "warning", "error"]),
            "ABC",
          );
        }}
      />
    </div>
  </section>
);

const SectionCollapsible = () => (
  <section>
    <Heading level={2} icon={<ArrowUpDown />}>
      Collapsible
    </Heading>

    <Collapsible title="Expand Me" tooltip="Tooltip">
      <p>
        Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Facilisis sed odio
        morbi quis commodo odio aenean sed. Urna cursus eget nunc scelerisque
        viverra mauris in aliquam. Elementum integer enim neque volutpat ac
        tincidunt vitae semper quis. Non diam phasellus vestibulum lorem sed
        risus. Amet luctus venenatis lectus magna.
      </p>
    </Collapsible>
  </section>
);

const SectionTile = () => (
  <section>
    <Heading level={2} icon={<CustomIcon />}>
      Tile
    </Heading>

    <div className="flex flex-wrap gap-8">
      <Tile
        icon={<Hourglass />}
        primary={formatNumber(1234)}
        secondary="Sequences"
      />
      <Tile
        icon={<CustomIcon />}
        primary={formatNumber(5678)}
        secondary="Proteins"
      />
      <Tile
        icon={<Menu />}
        primary={formatNumber(99999)}
        secondary="Analyses"
      />
    </div>
  </section>
);

const SectionTable = () => (
  <section>
    <Heading level={2} icon={<TableIcon />}>
      Table
    </Heading>

    <Table
      cols={[
        {
          key: "name",
          name: "Name",
        },
        {
          key: "age",
          name: "Age",
          filterType: "number",
        },
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
          render: (cell) => <div className="line-clamp-5 p-1">{cell}</div>,
        },
      ]}
      rows={tableData}
    />
  </section>
);

const SectionTooltip = () => (
  <section>
    <Heading level={2} icon={<MessageSquare />}>
      Tooltip
    </Heading>

    <div className="flex flex-wrap gap-4">
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
    </div>
  </section>
);

const SectionPopover = () => (
  <section>
    <Heading level={2} icon={<MessageSquareDot />}>
      Popover
    </Heading>

    <Popover
      content={
        <>
          <p>
            <Link to="https://medschool.cuanschutz.edu/dbmi">Interactive</Link>{" "}
            content
          </p>
          <Button text="Save" />
          <SelectSingle
            label="Select"
            options={
              [
                { id: "csv", primary: "CSV" },
                { id: "tsv", primary: "TSV" },
                { id: "pdf", primary: "PDF" },
              ] as const
            }
            value="csv"
            onChange={() => null}
          />
        </>
      }
    >
      <Tooltip content="Click to open">
        <Button text="Popover" />
      </Tooltip>
    </Popover>
  </section>
);

const SectionDialog = () => (
  <section>
    <Heading level={2} icon={<AppWindowMac />}>
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

              <Collapsible title="Collapsible">
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
        <>
          <SelectSingle
            label="Select"
            options={
              [
                { id: "csv", primary: "CSV" },
                { id: "tsv", primary: "TSV" },
                { id: "pdf", primary: "PDF" },
              ] as const
            }
            value="csv"
            onChange={() => null}
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
        </>
      )}
    >
      <Tooltip content="Click to open">
        <Button text="Dialog" />
      </Tooltip>
    </Dialog>
  </section>
);

const SectionForm = () => (
  <section>
    <Heading level={2} icon={<TextCursorInput />}>
      Form
    </Heading>

    <Form onSubmit={() => console.info("Form submitted")}>
      <div className="flex flex-wrap items-center gap-4">
        <TextBox label="Name" value="Test" onChange={() => null} />
        <Button text="Button" />
        <Button text="Submit" type="submit" />
      </div>
    </Form>
  </section>
);
