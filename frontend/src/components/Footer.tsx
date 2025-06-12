import { FaEnvelope, FaGithub } from "react-icons/fa6";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import classes from "./Footer.module.css";

/** at bottom of every page. singleton. */
const Footer = () => (
  <Flex tag="footer" column gap="sm" className={classes.footer}>
    <Flex gap="sm" className={classes.icons}>
      <Link
        to="mailto:janani.ravi@cuanschutz.edu"
        showArrow={false}
        tooltip="Email us"
      >
        <FaEnvelope />
      </Link>
      <Link to="https://github.com/JRaviLab" showArrow={false} tooltip="GitHub">
        <FaGithub />
      </Link>
    </Flex>

    <div>
      A project of the{" "}
      <Link to="https://jravilab.github.io/" showArrow={false}>
        JRaviLab
      </Link>{" "}
      &copy; 2024
    </div>
  </Flex>
);

export default Footer;
