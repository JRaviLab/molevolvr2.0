import { useRef, useState } from "react";
import { useDeepCompareEffect, useElementSize } from "@reactuses/core";
import { sample, startCase, uniq } from "lodash";
import {
  AppWindowMac,
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
  SquareCheckBig,
  TableCellsMerge,
  TableColumnsSplit,
  TableIcon,
  TextCursorInput,
  Type,
  Waypoints,
  Wine,
} from "lucide-react";
import CustomIcon from "@/assets/custom-icon.svg?react";
import Logo from "@/assets/logo.svg?react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Collapsible from "@/components/Collapsible";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import { H1, H2, H3, H4 } from "@/components/Heading";
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
  legend,
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
import { getShapeMap } from "@/util/shape";
import { formatDate, formatNumber } from "@/util/string";
import tableData from "../../fixtures/table.json";
import seedrandom from "seedrandom";

/** test and example usage of formatting, elements, components, etc. */
export default function TestbedPage() {
  return (
    <>
      <Meta title="Testbed" />

      <section className="items-center">
        <H1>Testbed</H1>

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
      <SectionTextBox />
      <SectionNumberBox />
      <SectionButton />
      <SectionSelect />
      <SectionCollapsible />
      <SectionTabs />
      <SectionCheckBox />
      <SectionRadios />
      <SectionSlider />
      <SectionAlert />
      <SectionToast />
      <SectionTooltip />
      <SectionPopover />
      <SectionDialog />
      <SectionTable />
      <SectionTile />
      <SectionAgo />
      <SectionForm />

      <SectionIcons />
    </>
  );
}

/* regular html elements and css classes for basic formatting */
function SectionElements() {
  /** palettes for color maps */
  const lightColorMap = uniq(Object.values(useColorMap(words, "mode")));
  const darkColorMap = uniq(Object.values(useColorMap(words, "invert")));

  return (
    <section className="items-center">
      <H2 icon={<Brush />}>Elements</H2>

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
}

function SectionHeading() {
  return (
    <section className="items-center">
      <H2 icon="X">Heading 2</H2>
      <H3 icon="Y">Heading 3</H3>
      <H4 icon="Z">Heading 4</H4>
    </section>
  );
}

function SectionLegend() {
  const ref = useRef<HTMLDivElement>(null);

  const [width] = useElementSize(ref);

  const { data, control } = useData(legend);
  const shapesMap = getShapeMap(data);
  const colorMap = useColorMap(data, "mode");
  console.log(shapesMap);

  const entries = Object.fromEntries(
    data.map((key) => [
      key,
      {
        shape: shapesMap[key],
        color: colorMap[key],
        stroke: seedrandom(key)() > 0.5,
      },
    ]),
  );

  return (
    <section className="items-center">
      <H2 icon={<Shapes />}>Legend</H2>

      <div
        ref={ref}
        className="w-100 max-w-full resize overflow-auto rounded-md p-4 shadow-md"
      >
        <Legend entries={entries} x={0} y={0} w={width} />
      </div>

      {control}
    </section>
  );
}

function SectionUpset() {
  const { data, control } = useData(upset);

  return (
    <section className="items-center">
      <H2 icon={<Frown />}>Upset</H2>

      <Upset title={label()} filename={[analysis]} {...data} />

      {control}
    </section>
  );
}

function SectionSunburst() {
  const { data, control } = useData(sunburst);

  return (
    <section className="items-center">
      <H2 icon={<ChartPie />}>Sunburst</H2>

      <Sunburst title={label()} filename={[analysis]} data={data} />

      {control}
    </section>
  );
}

function SectionHeatmap() {
  const { data, control } = useData(heatmap);

  return (
    <section className="items-center">
      <H2 icon={<Grid3X3 />}>Heatmap</H2>

      <Heatmap title={label()} filename={[analysis]} {...data} />

      {control}
    </section>
  );
}

function SectionTree() {
  const { data, control } = useData(tree);

  return (
    <section className="items-center">
      <H2 icon={<NetworkIcon />}>Tree</H2>

      <Tree title={label()} filename={[analysis]} data={data} />

      {control}
    </section>
  );
}

function SectionNetwork() {
  const { data, control } = useData({ nodes, edges });

  return (
    <section className="items-center">
      <H2 icon={<Waypoints />}>Network</H2>

      <Network filename={[analysis]} {...data} />

      {control}
    </section>
  );
}

function SectionMSA() {
  const { data, control } = useData(msaTracks);

  return (
    <section className="items-center">
      <H2 icon={<TableColumnsSplit />}>MSA</H2>

      <MSA
        title={label()}
        filename={[analysis]}
        tracks={data}
        getType={clustalType}
        colorMap={clustalColors}
      />

      {control}
    </section>
  );
}

function SectionIPR() {
  const { data, control } = useData({
    sequence: iprSequence,
    tracks: iprTracks,
  });

  return (
    <section className="items-center">
      <H2 icon={<TableCellsMerge />}>IPR</H2>

      <IPR title={label()} filename={[analysis]} {...data} />

      {control}
    </section>
  );
}

function SectionLink() {
  return (
    <section className="items-center">
      <H2 icon={<LinkIcon />}>Link</H2>

      <p className="flex gap-4">
        <Link to="/">Internal Link</Link>
        <Link to="https://medschool.cuanschutz.edu/dbmi">External Link</Link>
      </p>
    </section>
  );
}

function SectionTextBox() {
  const [value, setValue] = useState("");

  return (
    <section className="items-center">
      <H2 icon={<Type />}>Text Box</H2>

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
}

function SectionNumberBox() {
  const [value, setValue] = useState(0);

  return (
    <section className="items-center">
      <H2 icon={<Hash />}>Number Box</H2>

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
}

function SectionButton() {
  return (
    <section className="items-center">
      <H2 icon={<Square />}>Button</H2>

      <div className="flex flex-wrap items-center gap-4">
        <Button to="/about" design="hollow" tooltip="Tooltip">
          Button
        </Button>
        <Button to="/about" tooltip="Tooltip">
          Button
        </Button>
        <Button to="/about" design="accent" tooltip="Tooltip">
          <CustomIcon />
          Button
        </Button>
        <Button to="/about" design="critical" tooltip="Tooltip">
          <CustomIcon />
        </Button>
      </div>
    </section>
  );
}

function SectionSelect() {
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
    <section className="items-center">
      <H2 icon={<ListCheck />}>Select</H2>

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
}

function SectionCollapsible() {
  return (
    <section className="items-center">
      <H2 icon={<ArrowUpDown />}>Collapsible</H2>

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
}

function SectionTabs() {
  return (
    <section className="items-center">
      <H2 icon={<Folder />}>Tabs</H2>

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
}

function SectionCheckBox() {
  const [value, setValue] = useState(false);

  return (
    <section className="items-center">
      <H2 icon={<SquareCheckBig />}>Check Box</H2>

      <CheckBox
        label="Accept terms and conditions"
        tooltip="Tooltip"
        value={value}
        onChange={setValue}
      />
    </section>
  );
}

function SectionRadios() {
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
    <section className="items-center">
      <H2 icon={<CircleCheckBig />}>Radios</H2>

      <Radios
        label="Choice"
        tooltip="Tooltip"
        options={options}
        value={value}
        onChange={setValue}
      />
    </section>
  );
}

function SectionSlider() {
  const [singleValue, setSingleValue] = useState(0);
  const [multiValue, setMultiValue] = useState<number[]>([0, 1000]);

  return (
    <section className="items-center">
      <H2 icon={<SlidersHorizontal />}>Slider</H2>

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
}

function SectionAlert() {
  return (
    <section className="items-center">
      <H2 icon={<Info />}>Alert</H2>

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
}

function SectionToast() {
  return (
    <section className="items-center">
      <H2 icon={<Wine />}>Toast</H2>

      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() =>
            toast(
              sample(["Apple", "Banana", "Cantaloupe", "Durian", "Elderberry"]),
            )
          }
        >
          Unique Toast
        </Button>
        <Button
          onClick={() => {
            toast(
              <>
                Toast modified in place <b>{sample(words)}</b>
              </>,
              sample(["info", "success", "warning", "error"]),
              "ABC",
            );
          }}
        >
          Overwriting Toast
        </Button>
      </div>
    </section>
  );
}

function SectionTooltip() {
  return (
    <section className="items-center">
      <H2 icon={<MessageSquare />}>Tooltip</H2>

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
}

function SectionPopover() {
  return (
    <section className="items-center">
      <H2 icon={<MessageSquareDot />}>Popover</H2>

      <Popover
        content={
          <>
            <p>
              <Link to="https://medschool.cuanschutz.edu/dbmi">
                Interactive
              </Link>{" "}
              content
            </p>
            <Button>Save</Button>
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
          <Button>Popover</Button>
        </Tooltip>
      </Popover>
    </section>
  );
}

function SectionDialog() {
  return (
    <section className="items-center">
      <H2 icon={<AppWindowMac />}>Dialog</H2>

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
                  viverra ultricies mus aenean ligula. Donec dis torquent orci
                  in odio. Nulla cras ex orci ridiculus augue malesuada. Mattis
                  urna congue imperdiet dolor sapien himenaeos praesent vitae
                  ut. Congue sapien a dapibus bibendum dolor feugiat etiam
                  sodales. Phasellus mattis feugiat augue iaculis; non venenatis
                  dolor. Litora magnis nec fames quam phasellus placerat.
                  Maximus fusce volutpat convallis taciti quam nam posuere.
                </p>

                <Collapsible title="Collapsible">
                  <p>
                    Odio semper orci ante varius porttitor. Ultricies torquent
                    venenatis cursus praesent vel lacus ligula nostra iaculis.
                    Parturient mauris id eget metus varius. Nulla suscipit
                    suspendisse natoque praesent ridiculus nisi molestie. Taciti
                    suscipit luctus morbi mauris; sem ante id orci. Venenatis
                    suspendisse dui finibus ipsum mus lorem placerat vitae.
                    Mattis nullam quisque morbi tempor, ex consectetur urna
                    odio. Class cras dapibus, augue suspendisse volutpat justo.
                    Blandit imperdiet conubia penatibus euismod condimentum
                    maecenas pharetra. Per ad ultricies viverra erat et massa
                    ante.
                  </p>
                </Collapsible>

                <Popover content="Odio semper orci ante varius porttitor.">
                  <Tooltip content="Click to open">
                    <Button>Popover</Button>
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
              onClick={() => {
                console.debug("Cancel");
                close();
              }}
            >
              Nevermind
            </Button>
            <Button
              design="critical"
              onClick={() => {
                console.debug("Delete");
                close();
              }}
            >
              Yes, delete
            </Button>
          </>
        )}
      >
        <Tooltip content="Click to open">
          <Button>Dialog</Button>
        </Tooltip>
      </Dialog>
    </section>
  );
}

function SectionTable() {
  return (
    <section className="items-center">
      <H2 icon={<TableIcon />}>Table</H2>

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
}

function SectionTile() {
  return (
    <section className="items-center">
      <H2 icon={<CustomIcon />}>Tile</H2>

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
}

function SectionAgo() {
  return (
    <section className="items-center">
      <H2 icon={<Hourglass />}>Ago</H2>

      <div className="flex flex-wrap items-center gap-4">
        <Ago date={new Date()} />
        <Ago date="Nov 12 2023" />
        <Ago date="Jun 1 2020" />
      </div>
    </section>
  );
}

function SectionForm() {
  return (
    <section className="items-center">
      <H2 icon={<TextCursorInput />}>Form</H2>

      <Form onSubmit={() => console.info("Form submitted")}>
        <div className="flex flex-wrap items-center gap-4">
          <TextBox label="Name" value="Test" onChange={() => null} />
          <Button>Button</Button>
          <Button type="submit">Submit</Button>
        </div>
      </Form>
    </section>
  );
}

function SectionIcons() {
  return (
    <section>
      <div className="flex size-100 items-center justify-center bg-deep text-white">
        <Logo className="size-90" />
      </div>
      <div className="flex h-100 w-200 items-center justify-center gap-8 bg-deep text-5xl tracking-wide text-white uppercase">
        <Logo className="size-32" />
        {import.meta.env.VITE_TITLE}
      </div>
    </section>
  );
}

const useData = <Data,>(initial: Data) => {
  const [data, setData] = useState<Data>(initial);
  const [text, setText] = useState(JSON.stringify(initial, null, 2));

  useDeepCompareEffect(() => {
    setData(initial);
    setText(JSON.stringify(initial, null, 2));
  }, [initial]);

  const control = (
    <TextBox
      placeholder="raw data"
      multi
      value={text}
      onChange={(value) => {
        setText(value);
        try {
          setData(JSON.parse(value));
        } catch {}
      }}
    />
  );

  return { data, control };
};
