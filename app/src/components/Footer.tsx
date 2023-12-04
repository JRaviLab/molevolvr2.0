import { FaEnvelope, FaGithub, FaHouse, FaTwitter } from "react-icons/fa6";
import classNames from "classnames";
import Link from "@/components/Link";
import classes from "./Footer.module.css";

/** at bottom of every page. singleton. */
const Footer = () => {
  return (
    <footer className={classNames(classes.footer, "flex-col", "gap-sm")}>
      <div className={classNames(classes.icons, "flex-row", "gap-xs")}>
        <Link to="" tooltip="JRaviLab website">
          <FaHouse />
        </Link>
        <Link to="" tooltip="Email us">
          <FaEnvelope />
        </Link>
        <Link to="" tooltip="GitHub">
          <FaGithub />
        </Link>
        <Link to="" tooltip="Twitter">
          <FaTwitter />
        </Link>
      </div>

      <div>
        A project of the{" "}
        <Link to="https://jravilab.github.io/" noIcon={true}>
          JRaviLab
        </Link>{" "}
        &copy; 2023
      </div>
    </footer>
  );
};

export default Footer;
