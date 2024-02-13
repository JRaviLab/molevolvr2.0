import { useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { useClickAway, useEvent } from "react-use";
import classNames from "classnames";
import Tooltip from "@/components/Tooltip";
import { firstInView } from "@/util/dom";
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
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);

  /** open/closed state */
  const [open, setOpen] = useState(window.innerWidth > 1500);

  /** full heading details */
  const [headings, setHeadings] = useState<
    { text: string; id: string; level: number }[]
  >([]);

  /** active heading (first in view) */
  const [active, setActive] = useState("");

  /** click off to close on small screens */
  useClickAway(root, () => {
    if (window.innerWidth < 1500) setOpen(false);
  });

  /** on window scroll */
  useEvent("scroll", () => {
    /** get active heading */
    setActive(firstInView(getHeadings())?.id || "");
  });

  /** scroll toc list active item into view */
  useEffect(() => {
    list.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView({ block: "center" });
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
  if (
    headings.length <= 1 ||
    document.documentElement.getBoundingClientRect().height < 2000
  )
    return <></>;

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
            <a
              key={index}
              className={classes.link}
              href={"#" + heading.id}
              data-active={heading.id === active ? "" : undefined}
              style={{ paddingLeft: heading.level * 10 }}
            >
              {heading.text}
            </a>
          ))}
        </div>
      )}
    </aside>
  );
};

export default TableOfContents;
