import { LuAsterisk } from "react-icons/lu";
import Tooltip from "@/components/Tooltip";

/** asterisk for things like required form fields */
const Asterisk = () => (
  <Tooltip content="Required">
    {/* https://github.com/react-icons/react-icons/issues/336 */}
    <span aria-hidden>
      <LuAsterisk className="relative -ml-1 -translate-y-2 scale-75 text-error" />
    </span>
  </Tooltip>
);

export default Asterisk;
