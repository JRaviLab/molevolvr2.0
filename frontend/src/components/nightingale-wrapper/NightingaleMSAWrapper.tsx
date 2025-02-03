import { useEffect, useRef } from "react";
import "@nightingale-elements/nightingale-msa";
import type {
  Region,
  SequencesMSA,
} from "@nightingale-elements/nightingale-msa";
import "./NightingaleMSAWrapper.css";

type Props = {
  sequences: SequencesMSA;
  features?: Region[];
};

type NightingaleMSAElement = {
  data: SequencesMSA;
  features?: Region[];
} & HTMLElement;

const NightingaleMSAWrapper = ({ sequences, features }: Props) => {
  const msaRef = useRef<NightingaleMSAElement>(null);

  useEffect(() => {
    if (msaRef.current) {
      msaRef.current.data = sequences;
      if (features) {
        msaRef.current.features = features.map((feature) => ({
          ...feature,
        }));
      }
    }
  }, [sequences, features]);

  return (
    <nightingale-msa
      ref={msaRef}
      id="msa"
      height="100"
      width="900"
      color-scheme="clustal"
      label-width="100"
    ></nightingale-msa>
  );
};

export default NightingaleMSAWrapper;
