import { FaAsterisk } from "react-icons/fa6";
import Tooltip from "@/components/Tooltip";
import classes from "./Asterisk.module.css";

/** asterisk for things like required form fields */
const Asterisk = () => (
  <Tooltip content="Required">
    {/* https://github.com/react-icons/react-icons/issues/336 */}
    <span>
      <FaAsterisk className={classes.asterisk} />
    </span>
  </Tooltip>
);

export default Asterisk;
