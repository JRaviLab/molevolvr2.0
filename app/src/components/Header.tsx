import { useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import clsx from "clsx";
import { useElementSize } from "@reactuses/core";
import Logo from "@/assets/logo.svg?react";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import classes from "./Header.module.css";

/** doc element abbrev */
const doc = document.documentElement;

/** set page scroll as css variable */
const updateY = () => doc.style.setProperty("--y", doc.scrollTop + "px");
window.addEventListener("scroll", updateY);
updateY();

/** at top of every page. singleton. */
const Header = () => {
  /** nav menu expanded/collapsed state */
  const [open, setOpen] = useState(false);

  /** header height */
  const ref = useRef<HTMLElement | null>(null);
  const [, height] = useElementSize(ref, { box: "border-box" });

  useEffect(() => {
    /** make sure all scrolls take into account header height */
    doc.style.scrollPaddingTop = height + 20 + "px";
  }, [height]);

  return (
    <Flex ref={ref} tag="header" hAlign="space" className={classes.header}>
      {/* logo and text */}
      <div className={classes.title}>
        <Logo className={classes.logo} />
        <Link className={clsx(classes.link, classes["title-link"])} to="/">
          {import.meta.env.VITE_TITLE}
        </Link>
      </div>

      {/* nav toggle */}
      <Tooltip content={open ? "Collapse menu" : "Expand menu"}>
        <button
          type="button"
          className={classes.toggle}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="nav"
        >
          {open ? <FaXmark /> : <FaBars />}
        </button>
      </Tooltip>

      {/* nav menu */}
      <nav id="nav" className={classes.nav} data-open={open}>
        <Link className={classes.link} to="/new-analysis">
          New Analysis
        </Link>
        <Link className={classes.link} to="/load-analysis">
          Load Analysis
        </Link>
        <Link className={classes.link} to="/about">
          About
        </Link>
      </nav>
    </Flex>
  );
};

export default Header;
