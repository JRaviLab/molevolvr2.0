import { useMemo, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useClickAway, useEvent } from "react-use";
import classNames from "classnames";
import { debounce } from "lodash";
import Tooltip from "@/components/Tooltip";
import { debouncedScrollTo, firstInView } from "@/util/dom";
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

  /** if covering something important, close */
  const isCovering = useMemo(
    () =>
      debounce(() => {
        if (!root.current) return;

        /** don't close if user interacting with toc */
        if (root.current.matches(":hover, :focus-within")) return;

        /** density of points to check */
        const gap = 10;
        /** check a grid of points under element */
        const { left, top, width, height } =
          root.current.getBoundingClientRect() ?? {};
        for (let x = left; x < width; x += gap) {
          for (let y = top; y < height; y += gap) {
            /** get element under toc at point */
            const covering = document
              .elementsFromPoint(x, y)
              .filter(
                (element) =>
                  element !== root.current && !root.current?.contains(element),
              )
              .shift();
            /** is "important" element */
            if (!covering?.matches("section")) return setOpen(false);
          }
        }
      }, 1000),
    [],
  );

  /** on window scroll */
  useEvent("scroll", () => {
    /** get active heading */
    setActiveId(firstInView(getHeadings())?.id || "");
    if (open) {
      isCovering();
      debouncedScrollTo(active.current ?? list.current?.firstElementChild, {
        block: "center",
      });
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
