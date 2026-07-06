import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useElementSize, useWindowScroll } from "@reactuses/core";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Logo from "@/assets/logo.svg?react";
import { DarkMode } from "@/components/DarkMode";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import { round } from "@/util/math";

/** doc element abbrev */
const doc = document.documentElement;

const links = [
  { to: "/new-analysis", name: "New Analysis" },
  { to: "/load-analysis", name: "Load Analysis" },
  { to: "/about", name: "About" },
];

/** at top of every page. singleton. */
export default function Header() {
  const { pathname } = useLocation();

  /** nav menu expanded/collapsed state */
  const [open, setOpen] = useState(false);

  /** header height */
  const ref = useRef<HTMLElement | null>(null);
  let [, height] = useElementSize(ref, { box: "border-box" });
  height = round(height);

  useEffect(() => {
    /** make sure all scrolls take into account header height */
    doc.style.scrollPaddingTop = height + "px";
    /** add var */
    doc.style.setProperty("--header-height", height + "px");
  }, [height]);

  const className = "rounded-md p-2 hover:bg-current/10";

  const { y } = useWindowScroll();

  return (
    <header
      ref={ref}
      className={clsx(
        "sticky top-0 z-10 flex flex-wrap items-center justify-between gap-8 bg-deep text-white shadow-md transition-all **:no-underline max-md:p-2 [&_a]:text-lg [&_a]:leading-none [&_a]:text-white",
        y > 0 ? "p-2" : "p-4",
      )}
    >
      <div className="flex items-center gap-2">
        <Logo className="size-8" />
        <Link to="/" className={clsx("tracking-wide uppercase", className)}>
          {import.meta.env.VITE_TITLE}
        </Link>
      </div>

      {/* nav toggle */}
      <Tooltip content={open ? "Collapse menu" : "Expand menu"}>
        <button
          className={clsx("md:hidden", className)}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="nav"
        >
          {open ? <X /> : <Menu />}
        </button>
      </Tooltip>

      {/* nav menu */}
      <nav
        id="nav"
        className={clsx(
          "flex items-center gap-2 max-md:w-full max-md:flex-col max-md:items-end",
          !open && "max-md:hidden",
        )}
      >
        {links.map(({ to, name }) => (
          <Link
            key={to}
            to={to}
            className={clsx(pathname === to && "opacity-50", className)}
          >
            {name}
          </Link>
        ))}

        <DarkMode className={className} />
      </nav>
    </header>
  );
}
