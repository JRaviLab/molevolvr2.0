import { FaAngleUp } from "react-icons/fa6";
import { useWindowScroll } from "react-use";
import classes from "./FloatButtons.module.css";

/** buttons that stay in corner of view at all times. singleton. */
const FloatButtons = () => {
  const { y } = useWindowScroll();

  return (
    <div className={classes.list}>
      {y > 1000 && (
        <button
          className={classes.button}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top of page"
        >
          <FaAngleUp />
        </button>
      )}

      {/* possibly other buttons/actions in future */}
    </div>
  );
};

export default FloatButtons;
