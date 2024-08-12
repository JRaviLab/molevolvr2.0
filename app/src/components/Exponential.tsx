import classes from "./Exponential.module.css";

type Props = {
  value: number;
};

/** number as exponential */
const Exponential = ({ value }: Props) => {
  const number = value.toExponential();
  const mantissa = Number(number.split("e")[0]);
  const exponent = Number(number.split("e")[1]);
  return (
    <span className={classes.exponential}>
      {mantissa.toFixed(2)} &times; 10<sup>{exponent}</sup>
    </span>
  );
};

export default Exponential;
