import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { useLocation } from "react-router";
import { useClickOutside, useEventListener } from "@reactuses/core";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { debounce } from "lodash";
import Button from "@/components/Button";
import { headingsAtom } from "@/components/Heading";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import {
  firstInView,
  isCovering,
  scrollTo,
  scrollToSelector,
} from "@/util/dom";
import { useChanged } from "@/util/hooks";
import { sleep } from "@/util/misc";

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
  if (useChanged(pathname))
    setOpen(pathname === "/" ? false : window.innerWidth > 1500);

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
    setActive(firstInView(headings.map((heading) => heading.element)));

    if (open) {
      /** if covering something important, close */
      debouncedIsCovering(ref.current, () => setOpen(false));

      /** prevent jitter when pinch-zoomed in */
      if (window.visualViewport?.scale === 1)
        /** scroll active toc item into view */
        scrollTo(activeRef.current, { behavior: "instant", block: "center" });
    }
  });

  /** if not much value in showing toc, hide */
  if (
    headings.length <= 2 ||
    document.body.scrollHeight < window.innerHeight * 2
  )
    return <></>;

  return (
    <aside
      ref={ref}
      className="fixed z-20 flex max-w-60 flex-col bg-white shadow-sm"
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-4">
        {/* top text */}
        {open && (
          <span className="grow p-3 font-medium">Table Of Contents</span>
        )}

        {/* toggle button */}
        <Tooltip content={open ? "Close" : "Table of contents"}>
          <Button
            design="hollow"
            className="rounded-none"
            icon={open ? <LuX /> : <LuMenu />}
            tooltip={open ? "Close" : "Table of contents"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          ></Button>
        </Tooltip>
      </div>

      {/* links */}
      {open && (
        <div
          ref={listRef}
          className="flex max-h-[40dvh] flex-col overflow-y-auto"
        >
          {headings.map(({ id, level, content, icon }, index) => (
            <Link
              key={index}
              ref={active === index ? activeRef : undefined}
              style={{ "--level": level } as CSSProperties}
              className={clsx(
                `
                  flex items-center gap-2 p-1
                  pl-[calc(var(--level)*--spacing(4))]
                  hover:bg-off-white hover:text-deep
                `,
                active === index && "bg-off-white text-deep",
              )}
              data-active={active === index}
              to={{ hash: "#" + id }}
              replace
              onClick={() => scrollToSelector("#" + id)}
            >
              {icon}
              <span className="grow truncate py-1">{content}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
};

export default TableOfContents;
