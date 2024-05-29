import { FaEnvelope, FaGithub, FaTwitter } from "react-icons/fa6";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import classes from "./Footer.module.css";

/** at bottom of every page. singleton. */
const Footer = () => (
  <Flex tag="footer" direction="column" gap="sm" className={classes.footer}>
    <Flex gap="sm" className={classes.icons}>
      <Link to="" tooltip="Email us">
        <FaEnvelope />
      </Link>
      <Link to="" tooltip="GitHub">
        <FaGithub />
      </Link>
      <Link to="" tooltip="Twitter">
        <FaTwitter />
      </Link>
    </Flex>

    <div>
      A project of the{" "}
      <Link to="https://www.thekrishnanlab.org" noIcon>
        Krishnan Lab
      </Link>{" "}
      &copy; 2023
    </div>
  </Flex>
);

export default Footer;
