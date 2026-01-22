import { useEffect, useRef, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { useLocation } from "react-router";
import { useElementSize } from "@reactuses/core";
import clsx from "clsx";
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
const Header = () => {
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
  }, [height]);

  const buttonClass =
    "rounded p-2 tracking-wide hover:bg-current/10 leading-none";

  return (
    <header
      ref={ref}
      className="
        sticky top-0 z-10 flex flex-wrap items-center justify-between gap-8
        bg-deep p-4 text-white shadow-lg
      "
    >
      <div className="flex items-center gap-2">
        <Logo className="size-8" />
        <Link
          to="/"
          className={clsx("text-lg tracking-wider uppercase", buttonClass)}
        >
          {import.meta.env.VITE_TITLE}
        </Link>
      </div>

      {/* nav toggle */}
      <Tooltip content={open ? "Collapse menu" : "Expand menu"}>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="nav"
          className={clsx("md:hidden", buttonClass)}
        >
          {open ? <LuX /> : <LuMenu />}
        </button>
      </Tooltip>

      {/* nav menu */}
      <nav
        id="nav"
        className={clsx(
          `
            flex items-center gap-2
            max-md:w-full max-md:flex-col max-md:items-end
          `,
          !open && "max-md:hidden",
        )}
      >
        {links.map(({ to, name }) => (
          <Link
            key={to}
            to={to}
            className={clsx(pathname === to && "bg-current/10", buttonClass)}
          >
            {name}
          </Link>
        ))}

        <DarkMode className={buttonClass} />
      </nav>
    </header>
  );
};

export default Header;
