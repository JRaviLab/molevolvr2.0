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
  FaSliders,
  FaStop,
  FaTableCells,
  FaTag,
} from "react-icons/fa6";
import { sample } from "lodash";
import CustomIcon from "@/assets/custom-icon.svg?react";
import Ago from "@/components/Ago";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Collapsible from "@/components/Collapsible";
import Form from "@/components/Form";
import Heading from "@/components/Heading";
import Label from "@/components/Label";
import Link from "@/components/Link";
import Meta from "@/components/Meta";
import NumberBox from "@/components/NumberBox";
import Popover from "@/components/Popover";
import Radios from "@/components/Radios";
import Section from "@/components/Section";
import Select from "@/components/Select";
import Slider from "@/components/Slider";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import TextBox from "@/components/TextBox";
import Tile from "@/components/Tile";
import { toast } from "@/components/Toasts";
import Tooltip from "@/components/Tooltip";
import { formatDate, formatNumber } from "@/util/string";
import tableData from "../../fixtures/table.json";

/** util func to log change to components for testing */
const logChange = (...args: unknown[]) => {
  console.info(...args);
};

/** test and example usage of formatting, elements, components, etc. */
const Testbed = () => {
  return (
    <>
      <Meta title="Testbed" />

      <Section>
        <Heading level={1} icon={<CustomIcon />}>
          Testbed
        </Heading>
      </Section>

      {/* regular html elements and css classes for basic formatting */}
      <Section>
        <Heading level={2} icon={<FaBrush />}>
          Elements
        </Heading>

        {/* color palette */}
        <div className="flex-row">
          {[
            "accent",
            "accent-light",
            "deep",
            "deep-mid",
            "deep-light",
            "black",
            "dark-gray",
            "gray",
            "light-gray",
            "white",
            "success",
            "warning",
            "error",
          ].map((color, index) => (
            <Tooltip key={index} content={color}>
              <div
                className="flex-row center"
                style={{
                  width: 50,
                  height: 50,
                  background: `var(--${color})`,
                }}
              />
            </Tooltip>
          ))}
        </div>

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

        <pre>
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
        <div className="flex-row gap-sm">
          <Link to="/">Internal Link</Link>
          <Link to="https://medschool.cuanschutz.edu/dbmi">External Link</Link>
        </div>
      </Section>

      {/* button */}
      <Section>
        <Heading level={2} icon={<FaStop />}>
          Button
        </Heading>
        <div className="flex-row gap-sm">
          <Button
            to="/about"
            text="As Link"
            icon={<FaArrowRight />}
            tooltip="Tooltip"
          />
          <Button
            to="/about"
            text="As Link"
            design="accent"
            tooltip="Tooltip"
          />
          <Button
            to="/about"
            icon={<CustomIcon />}
            design="critical"
            tooltip="Tooltip"
          />
          <Button
            onClick={() => window.alert("Hello World")}
            text="As Button"
            tooltip="Tooltip"
          />
          <Button
            onClick={() => window.alert("Hello World")}
            text="As Button"
            icon={<FaArrowRight />}
            design="accent"
            tooltip="Tooltip"
          />
          <Button
            onClick={() => window.alert("Hello World")}
            icon={<CustomIcon />}
            design="critical"
            tooltip="Tooltip"
          />
        </div>
      </Section>

      {/* textbox */}
      <Section>
        <Heading level={2} icon={<FaFont />}>
          Text Box
        </Heading>
        <div className="grid full">
          <TextBox placeholder="Search" onChange={logChange} />
          <TextBox
            placeholder="Search"
            multi={true}
            icon={<FaMagnifyingGlass />}
          />
          <TextBox label="Label" placeholder="Search" />
        </div>
      </Section>

      {/* select */}
      <Section>
        <Heading level={2} icon={<FaListCheck />}>
          Select
        </Heading>
        <div className="flex-row gap-md">
          <Select
            label="Single"
            options={
              [
                { id: "1", text: "Lorem" },
                { id: "2", text: "Ipsum" },
                { id: "3", text: "Dolor" },
              ] as const
            }
            onChange={logChange}
          />
          <Select
            label="Multi"
            layout="horizontal"
            multi={true}
            options={
              [
                { id: "a", text: "Lorem" },
                { id: "b", text: "Ipsum", info: "123" },
                { id: "c", text: "Dolor", info: "123", icon: <FaHorse /> },
              ] as const
            }
            onChange={logChange}
          />
        </div>
      </Section>

      {/* checkbox */}
      <Section>
        <Heading level={2} icon={<FaRegSquareCheck />}>
          Check Box
        </Heading>
        <div className="flex-row gap-md">
          <CheckBox
            label="Accept terms and conditions"
            tooltip="Tooltip"
            name="accept"
            onChange={logChange}
          />
        </div>
      </Section>

      {/* slider */}
      <Section>
        <Heading level={2} icon={<FaSliders />}>
          Slider
        </Heading>
        <div className="flex-row gap-md">
          <Slider
            label="Single"
            min={0}
            max={100}
            step={1}
            onChange={logChange}
          />
          <Slider
            label="Range"
            layout="horizontal"
            multi={true}
            min={0}
            max={10000}
            step={100}
            onChange={logChange}
          />
        </div>
      </Section>

      {/* number box */}
      <Section>
        <Heading level={2} icon={<FaHashtag />}>
          Number Box
        </Heading>
        <div className="flex-row gap-md">
          <NumberBox
            label="Small"
            min={0}
            max={100}
            step={1}
            onChange={logChange}
          />
          <NumberBox
            label="Big"
            layout="horizontal"
            min={-10000}
            max={10000}
            step={100}
            onChange={logChange}
          />
        </div>
      </Section>

      {/* radios */}
      <Section>
        <Heading level={2} icon={<FaRegCircleDot />}>
          Radios
        </Heading>
        <div className="flex-row">
          <Radios
            label="Choice"
            options={[
              { id: "first", primary: "Primary lorem ipsum" },
              {
                id: "second",
                primary: "Primary lorem ipsum",
                secondary: "Secondary lorem ipsum",
              },
              {
                id: "third",
                primary: "Primar lorem ipsumy",
                icon: <FaCat />,
              },
            ]}
            onChange={logChange}
          />
        </div>
      </Section>

      {/* ago */}
      <Section>
        <Heading level={2} icon={<FaRegHourglass />}>
          Ago
        </Heading>
        <div className="flex-row gap-sm">
          <Ago date={new Date()} />
          <Ago date="Nov 12 2023" />
          <Ago date="Jun 1 2020" />
        </div>
      </Section>

      {/* alert */}
      <Section>
        <Heading level={2} icon={<FaCircleInfo />}>
          Alert
        </Heading>
        <div className="flex-col gap-md">
          <Alert>
            Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Alert>
          <Alert type="loading">Loading</Alert>
          <Alert type="success">Success</Alert>
          <Alert type="warning">Warning</Alert>
          <Alert type="error">Error</Alert>
        </div>
      </Section>

      {/* tabs */}
      <Section>
        <Heading level={2} icon={<FaRegFolder />}>
          Tabs
        </Heading>
        <Tabs syncWithUrl="tab">
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
        <div className="flex-row gap-sm">
          <Button
            text="Unique Toast"
            design="accent"
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
            design="accent"
            onClick={() =>
              toast(
                `ABC`,
                sample(["info", "loading", "success", "warning", "error"]),
                "abc",
              )
            }
          />
        </div>
      </Section>

      {/* collapsible */}
      <Section>
        <Heading level={2} icon={<FaArrowsUpDown />}>
          Collapsible
        </Heading>
        <Collapsible
          text="Expand Me"
          tooltip="Tooltip"
          className="flex-col gap-md"
        >
          <p>
            Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Facilisis sed odio morbi quis commodo odio aenean sed. Urna cursus
            eget nunc scelerisque viverra mauris in aliquam. Elementum integer
            enim neque volutpat ac tincidunt vitae semper quis. Non diam
            phasellus vestibulum lorem sed risus. Amet luctus venenatis lectus
            magna.
          </p>
          <div className="flex-row gap-md">
            <span>abc</span>
            <span>123</span>
            <span>xyz</span>
          </div>
        </Collapsible>
      </Section>

      {/* tile */}
      <Section>
        <Heading level={2} icon={<CustomIcon />}>
          Tile
        </Heading>
        <div className="flex-row gap-md">
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
        </div>
      </Section>

      {/* table */}
      <Section>
        <Heading level={2} icon={<FaTableCells />}>
          Table
        </Heading>
        <Table
          cols={[
            { key: "name", name: "Name" },
            { key: "age", name: "Age", filterable: "number" },
            { key: "status", name: "Status", filterable: "enum" },
            {
              key: "text",
              name: "Long text",
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
        <div className="flex-row gap-sm">
          <Tooltip content="Minimal, non-interactive help or contextual info">
            <span className="text-tooltip">Plain content</span>
          </Tooltip>
          <Tooltip
            content={
              <>
                <em>Minimal</em>, <strong>non-interactive</strong> help or
                contextual info
              </>
            }
          >
            <span className="text-tooltip">Rich content</span>
          </Tooltip>
        </div>
      </Section>

      {/* popover (for testing; not typically used directly) */}
      <Section>
        <Heading level={2} icon={<FaMessage />}>
          Popover
        </Heading>
        <div className="flex-row gap-sm">
          <Popover
            label="Interactive content"
            content={
              <>
                <p>
                  <Link to="https://medschool.cuanschutz.edu/dbmi">
                    Interactive
                  </Link>{" "}
                  content
                </p>
                <div className="flex-row gap-sm">
                  <Button text="Save" />
                  <Select
                    options={
                      [
                        { id: "csv", text: "CSV" },
                        { id: "tsv", text: "TSV" },
                        { id: "pdf", text: "PDF" },
                      ] as const
                    }
                    onChange={logChange}
                  />
                </div>
              </>
            }
          >
            <Button text="Menu" />
          </Popover>
        </div>
      </Section>

      {/* label (for testing; not typically used directly) */}
      <Section>
        <Heading level={2} icon={<FaTag />}>
          Label
        </Heading>
        <div className="flex-row gap-sm">
          <Label htmlFor="123" label="Label" required={true} tooltip="Tooltip">
            <input id="123" name="suppress lighthouse" />
          </Label>
          <Label htmlFor="456" label="Label" layout="horizontal">
            <input id="456" name="suppress lighthouse" />
          </Label>
          <Label htmlFor="789" label="Label" layout="none">
            <input id="789" name="suppress lighthouse" />
          </Label>
        </div>
      </Section>

      {/* form */}
      <Section>
        <Heading level={2} icon={<FaClipboardList />}>
          Form
        </Heading>
        <div className="flex-col gap-lg full">
          <Form onSubmit={console.info}>
            <div className="grid full">
              <TextBox
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
              />
              <TextBox
                label="Description"
                multi={true}
                name="description"
                required={true}
              />
              <NumberBox label="Age" name="age" />
              <Slider label="Cutoff" name="cutoff" />
              <Slider label="Range" multi={true} name="range" width="100%" />
              <Radios
                label="Order"
                options={[
                  { id: "one", primary: "One" },
                  { id: "two", primary: "Two" },
                  { id: "three", primary: "Three" },
                ]}
                name="order"
              />
              <Select
                label="Select"
                multi={true}
                options={
                  [
                    { id: "a", text: "Lorem" },
                    { id: "b", text: "Ipsum", info: "123" },
                    { id: "c", text: "Dolor", info: "123", icon: <FaHorse /> },
                  ] as const
                }
                name="select"
              />
            </div>
            <CheckBox label="I consent" name="consent" />
            <Button type="submit" text="Submit" design="critical" />
          </Form>
        </div>
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

      {/* section */}
      <Section fill={true} full={true}>
        <div className="placeholder pulse" />
      </Section>
    </>
  );
};

export default Testbed;
