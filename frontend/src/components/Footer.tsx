import { FaEnvelope, FaGithub } from "react-icons/fa6";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import classes from "./Footer.module.css";

const { VITE_EMAIL, VITE_LAB_NAME, VITE_LAB_WEBSITE, VITE_LAB_GITHUB } =
  import.meta.env;

/** at bottom of every page. singleton. */
const Footer = () => (
  <Flex tag="footer" column gap="sm" className={classes.footer}>
    <Flex gap="sm" className={classes.icons}>
      <Link to={`mailto:${VITE_EMAIL}`} showArrow={false} tooltip="Email us">
        <FaEnvelope />
      </Link>
      <Link to={VITE_LAB_GITHUB} showArrow={false} tooltip="GitHub">
        <FaGithub />
      </Link>
    </Flex>

    <div>
      A project of the{" "}
      <Link to={VITE_LAB_WEBSITE} showArrow={false}>
        {VITE_LAB_NAME}
      </Link>{" "}
      &copy; 2025
    </div>
  </Flex>
);

export default Footer;
