import { useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import clsx from "clsx";
import { debounce } from "lodash";
import {
  useClickOutside,
  useEventListener,
  useMutationObserver,
} from "@reactuses/core";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import { firstInView, isCovering, scrollTo } from "@/util/dom";
import { sleep } from "@/util/misc";
import classes from "./TableOfContents.module.css";

/** all used heading elements */
const headingSelector = "h1, h2, h3, h4";

/** get all used heading elements */
const getHeadings = () => [
  ...document.querySelectorAll<HTMLHeadingElement>(headingSelector),
];

/**
 * check if covering something important and run func to close. debounce to
 * avoid closing if just briefly scrolling over important element.
 */
const debouncedIsCovering = debounce(
  (element: Parameters<typeof isCovering>[0], close: () => void) => {
    if (isCovering(element)) close();
  },
  1000,
);

/**
 * floating table of contents that outlines sections/headings on page. can be
 * turned on/off at route level. singleton.
 */
const TableOfContents = () => {
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  /** open/closed state */
  const [open, setOpen] = useState(window.innerWidth > 1500);

  /** full heading details */
  const [headings, setHeadings] = useState<
    { text: string; id: string; level: number }[]
  >([]);

  /** active heading id (first in view) */
  const [activeId, setActiveId] = useState("");

  /** click off to close */
  useClickOutside(ref, async () => {
    /** wait for any element inside toc to lose focus */
    await sleep();
    if (isCovering(ref.current) || window.innerWidth < 1000) setOpen(false);
  });

  /** on window scroll */
  useEventListener("scroll", () => {
    /** get active heading */
    setActiveId(firstInView(getHeadings())?.id || "");
    if (open) {
      /** if covering something important, close */
      debouncedIsCovering(ref.current, () => setOpen(false));
      /** prevent jitter when pinch-zoomed in */
      if (window.visualViewport?.scale === 1)
        /** scroll active toc item into view */
        scrollTo(activeRef.current ?? listRef.current?.firstElementChild, {
          behavior: "instant",
          block: "center",
        });
    }
  });

  useMutationObserver(
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
    /** listen to changes on page */
    document.documentElement,
    /** only listen for elements added/removed */
    {
      subtree: true,
      childList: true,
    },
  );

  /** if not much value in showing toc, hide */
  if (headings.length <= 1) return <></>;

  return (
    <aside ref={ref} className={classes.table} aria-label="Table of contents">
      <div className={classes.heading}>
        {/* top text */}
        {open && (
          <span className={clsx("primary", classes.title)}>
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
        <div ref={listRef} className={classes.list}>
          {headings.map((heading, index) => (
            <Link
              key={index}
              ref={heading.id === activeId ? activeRef : undefined}
              data-active={heading.id === activeId ? "" : undefined}
              className={classes.link}
              to={{ hash: "#" + heading.id }}
              replace
              style={{ paddingLeft: 10 * heading.level }}
              onClick={() => scrollTo("#" + heading.id)}
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
