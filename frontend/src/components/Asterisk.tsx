import { FaAsterisk } from "react-icons/fa6";
import Tooltip from "@/components/Tooltip";

/** asterisk for things like required form fields */
const Asterisk = () => (
  <Tooltip content="Required">
    {/* https://github.com/react-icons/react-icons/issues/336 */}
    <span aria-hidden>
      <FaAsterisk className="text-error relative -ml-1 -translate-y-2 scale-75" />
    </span>
  </Tooltip>
);

export default Asterisk;
