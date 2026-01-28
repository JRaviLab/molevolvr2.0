import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  useClickOutside,
  useDebounceFn,
  useEventListener,
} from "@reactuses/core";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { Menu, X } from "lucide-react";
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
 * floating table of contents that outlines sections/headings on page.
 * singleton.
 */
const TableOfContents = () => {
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const { pathname } = useLocation();

  /** open/closed state */
  const [open, setOpen] = useState(false);

  /** auto-close if covering something important */
  const autoClose = useDebounceFn(() => {
    if (open && isCovering(ref.current)) setOpen(false);
  }, 1000);

  /** when path changes */
  if (useChanged(pathname)) autoClose.flush();

  /** full heading details */
  const headings = useAtomValue(headingsAtom);

  /** active index */
  const [active, setActive] = useState(0);

  /** on click off */
  useClickOutside(ref, async () => {
    /** wait for any element inside toc to lose focus */
    await sleep();
    /** auto-close */
    autoClose.flush();
  });

  /** auto-close on window scroll */
  useEventListener("scroll", autoClose.run);
  /** auto-close on window resize */
  useEventListener("resize", autoClose.run);

  /** on window scroll */
  useEventListener("scroll", () => {
    /** get active heading */
    setActive(firstInView(headings.map((heading) => heading.element)));

    if (
      open &&
      /** prevent jitter when pinch-zoomed in */
      window.visualViewport?.scale === 1
    )
      /** scroll active toc item into view */
      scrollTo(activeRef.current, { behavior: "instant", block: "center" });
  });

  /** if not much value in showing toc, hide */
  if (pathname === "/" || headings.length <= 2) return <></>;

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
            icon={open ? <X /> : <Menu />}
            tooltip={open ? "Close" : "Table of contents"}
            design="hollow"
            className="rounded-none"
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
