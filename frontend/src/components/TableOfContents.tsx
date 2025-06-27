import { useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { useLocation } from "react-router";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { debounce } from "lodash";
import { useClickOutside, useEventListener } from "@reactuses/core";
import { headingsAtom } from "@/components/Heading";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import { firstInView, isCovering, scrollTo } from "@/util/dom";
import { sleep } from "@/util/misc";
import classes from "./TableOfContents.module.css";

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

  const { pathname } = useLocation();

  /** open/closed state */
  const [open, setOpen] = useState(false);

  /** when path changes, hide/show */
  useEffect(() => {
    setOpen(pathname === "/" ? false : window.innerWidth > 1500);
  }, [pathname]);

  /** full heading details */
  const headings = useAtomValue(headingsAtom);

  /** active index */
  const [active, setActive] = useState(0);

  /** click off to close */
  useClickOutside(ref, async () => {
    /** wait for any element inside toc to lose focus */
    await sleep();
    if (isCovering(ref.current) || window.innerWidth < 1000) setOpen(false);
  });

  /** on window scroll */
  useEventListener("scroll", () => {
    /** get active heading */
    setActive(firstInView(headings.map((h) => h.ref)));

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

  /** if not much value in showing toc, hide */
  if (
    headings.length <= 2 ||
    document.body.scrollHeight < window.innerHeight * 2
  )
    return <></>;

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
          {headings.map(({ id, level, text, icon }, index) => (
            <Link
              key={index}
              ref={active === index ? activeRef : undefined}
              className={classes.link}
              data-active={active === index}
              to={{ hash: "#" + id }}
              replace
              style={{ paddingLeft: 20 * (level - 0.5) }}
              onClick={() => scrollTo("#" + id)}
            >
              {icon && <span className={classes["link-icon"]}>{icon}</span>}
              <span className={classes["link-text"]}>{text}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
};

export default TableOfContents;
