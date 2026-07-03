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
import { firstInView, isCovering, scrollTo } from "@/util/dom";
import { useChanged } from "@/util/hooks";
import { sleep } from "@/util/misc";

/**
 * floating table of contents that outlines sections/headings on page.
 * singleton.
 */
export default function TableOfContents() {
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const { pathname } = useLocation();

  /** open/closed state */
  const [open, setOpen] = useState(false);

  /** auto-close if covering something important */
  const autoClose = useDebounceFn(() => {
    if (open && isCovering(ref.current)) setOpen(false);
  }, 500);

  /** when path changes */
  if (useChanged(pathname)) {
    autoClose.run();
    autoClose.flush();
  }

  /** full heading details */
  const headings = useAtomValue(headingsAtom);

  /** active index */
  const [active, setActive] = useState(0);

  /** on click off */
  useClickOutside(ref, async () => {
    /** wait for any element inside toc to lose focus */
    await sleep();
    /** auto-close */
    autoClose.run();
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
      className="fixed z-20 flex max-w-80 flex-col bg-white shadow-md"
      style={{ maxHeight: `calc(100vh - var(--header-height))` }}
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-4 shadow-md">
        {/* top text */}
        {open && (
          <span className="grow p-3 font-medium">Table Of Contents</span>
        )}

        {/* toggle button */}
        <Tooltip content={open ? "Close" : "Table of contents"}>
          <Button
            className="rounded-none"
            design="hollow"
            tooltip={open ? "Close" : "Table of contents"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </Tooltip>
      </div>

      {/* links */}
      {open && (
        <div ref={listRef} className="flex flex-col overflow-y-auto">
          {headings.map(({ id, level, content, icon }, index) => (
            <Link
              key={index}
              ref={active === index ? activeRef : undefined}
              style={{ "--level": level } as CSSProperties}
              className={clsx(
                "flex items-center gap-2 p-2 pl-[calc(var(--level)*(--spacing(4)))] text-black no-underline hover:bg-off-white hover:text-deep",
                active === index && "bg-off-white text-deep",
              )}
              to={{ hash: "#" + id }}
              replace
              onClick={() => scrollTo("#" + id)}
            >
              <span className="text-gray">{icon}</span>
              <span className="grow truncate">{content}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
