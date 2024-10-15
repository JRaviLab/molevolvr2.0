import React, { useEffect, useRef } from "react";
import "@nightingale-elements/nightingale-msa";
import type { Region, SequencesMSA } from "@nightingale-elements/nightingale-msa";

type Props = {
  sequences: SequencesMSA;
  features?: Region[];
};

// Define the type for the custom element
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
        msaRef.current.features = features.map(feature => ({
          ...feature,
        }));
      }
    }
  }, [sequences, features]);

  return <nightingale-msa ref={msaRef}></nightingale-msa>;
};

export default NightingaleMSAWrapper;