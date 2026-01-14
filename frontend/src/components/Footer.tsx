import { FaEnvelope, FaGithub } from "react-icons/fa6";
import Link from "@/components/Link";

const { VITE_EMAIL, VITE_LAB_NAME, VITE_LAB_WEBSITE, VITE_LAB_GITHUB } =
  import.meta.env;

/** at bottom of every page. singleton. */
const Footer = () => (
  <footer className="bg-deep flex flex-col items-center gap-2 p-6 text-white">
    <div className="*:hover:text-gray flex gap-2 *:p-2">
      <Link to={`mailto:${VITE_EMAIL}`} showArrow={false} tooltip="Email us">
        <FaEnvelope />
      </Link>
      <Link to={VITE_LAB_GITHUB} showArrow={false} tooltip="GitHub">
        <FaGithub />
      </Link>
    </div>

    <p>
      A project of the{" "}
      <Link
        to={VITE_LAB_WEBSITE}
        showArrow={false}
        className="text-accent-light"
      >
        {VITE_LAB_NAME}
      </Link>{" "}
      &copy; 2025
    </p>
  </footer>
);

export default Footer;
