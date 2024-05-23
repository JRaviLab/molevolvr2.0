import { useEffect, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { useWindowScroll } from "react-use";
import classNames from "classnames";
import Logo from "@/assets/logo.svg?react";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";
import classes from "./Header.module.css";

/** at top of every page. singleton. */
const Header = () => {
  /** nav menu expanded/collapsed state */
  const [open, setOpen] = useState(false);

  /** document scroll */
  const { y } = useWindowScroll();

  useEffect(() => {
    /** make sure all scrolls take into account header height */
    document.documentElement.style.scrollPaddingTop =
      (document.querySelector("header")?.clientHeight || 0) + 20 + "px";
  });

  return (
    <Flex
      hAlign="space"
      className={classes.header}
      data-scrolled={y > 0 ? "" : undefined}
    >
      {/* logo and text */}
      <div className={classes.title}>
        <Logo className={classes.logo} />
        <Link
          className={classNames(classes.link, classes["title-link"])}
          to="/"
        >
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
