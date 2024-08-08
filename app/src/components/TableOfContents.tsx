import { useMemo, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useClickAway, useEvent } from "react-use";
import classNames from "classnames";
import { debounce } from "lodash";
import Tooltip from "@/components/Tooltip";
import { firstInView, scrollTo } from "@/util/dom";
import { useMutation } from "@/util/hooks";
import classes from "./TableOfContents.module.css";

/** all used heading elements */
const headingSelector = "h1, h2, h3, h4";
/** get all used heading elements */
const getHeadings = () => [
  ...document.querySelectorAll<HTMLHeadingElement>(headingSelector),
];

/**
 * floating table of contents that outlines sections/headings on page. can be
 * turned on/off at route level. singleton.
 */
const TableOfContents = () => {
  /** elements */
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const active = useRef<HTMLAnchorElement>(null);

  const { state } = useLocation();

  /** open/closed state */
  const [open, setOpen] = useState(window.innerWidth > 1500);

  /** full heading details */
  const [headings, setHeadings] = useState<
    { text: string; id: string; level: number }[]
  >([]);

  /** active heading id (first in view) */
  const [activeId, setActiveId] = useState("");

  /** click off to close on small screens */
  useClickAway(root, () => {
    if (window.innerWidth < 1000) setOpen(false);
  });

  /** scroll toc list active item into view */
  const scrollActive = useMemo(
    /**
     * debounce to avoid chrome issue
     * https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
     */
    () =>
      debounce(
        () =>
          scrollTo(active.current ?? list.current?.firstElementChild, {
            block: "center",
          }),
        100,
      ),
    [],
  );

  /** close if covering something important */
  const closeIfCovering = useMemo(
    () =>
      /**
       * debounce so doesn't run if briefly passing over element. has to rest
       * over it for a while.
       */
      debounce(() => {
        if (!root.current) return;
        if (root.current.matches(":hover, :focus-within")) return;
        const { x, y, width, height } =
          root.current.getBoundingClientRect() ?? {};
        /** top-most element under bottom right corner of toc */
        const covering = document.elementFromPoint(x + width, y + height);
        if (!covering?.matches("section")) setOpen(false);
      }, 1000),
    [],
  );

  /** on window scroll */
  useEvent("scroll", () => {
    /** get active heading */
    setActiveId(firstInView(getHeadings())?.id || "");
    if (open) {
      closeIfCovering();
      scrollActive();
    }
  });

  useMutation(
    /** listen to changes on page */
    document.documentElement,
    /** only listen for elements added/removed */
    {
      subtree: true,
      childList: true,
    },
    () => {
      /** read headings from page */
      setHeadings(
        getHeadings().map((heading) => ({
          text: heading.innerText,
          id: heading.id,
          level: parseInt(heading.tagName.slice(1)) || 0,
        })),
      );
    },
  );

  /** if not much value in showing toc, hide */
  if (headings.length <= 1) return <></>;

  return (
    <aside ref={root} className={classes.table} aria-label="Table of contents">
      <div className={classes.heading}>
        {/* top text */}
        {open && (
          <span className={classNames(classes.title, "primary")}>
            Table Of Contents
          </span>
        )}

        {/* toggle button */}
        <Tooltip content={open ? "Close" : "Table of contents"}>
          <button
            type="button"
            className={classes.button}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <FaXmark /> : <FaBars />}
          </button>
        </Tooltip>
      </div>

      {/* links */}
      {open && (
        <div ref={list} className={classes.list}>
          {headings.map((heading, index) => (
            <Link
              key={index}
              ref={heading.id === activeId ? active : undefined}
              data-active={heading.id === activeId ? "" : undefined}
              className={classes.link}
              to={{ hash: "#" + heading.id }}
              /** preserve state */
              state={state}
              replace={true}
              style={{ paddingLeft: heading.level * 10 }}
            >
              {heading.text}
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
};

export default TableOfContents;
