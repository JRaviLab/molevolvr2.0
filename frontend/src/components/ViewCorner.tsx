import { FaAngleUp } from "react-icons/fa6";
import { useWindowScroll } from "@reactuses/core";
import Flex from "@/components/Flex";
import Toasts from "@/components/Toasts";
import classes from "./ViewCorner.module.css";

/** buttons and other stuff that stays in corner of view at all times. singleton. */
const ViewCorner = () => {
  const { y } = useWindowScroll();

  return (
    <Flex direction="column" hAlign="right" gap="sm" className={classes.list}>
      <Toasts />
      {y > 100 && (
        <button
          type="button"
          className={classes.button}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top of page"
        >
          <FaAngleUp />
        </button>
      )}

      {/* possibly other buttons/actions in future */}
    </Flex>
  );
};

export default ViewCorner;
