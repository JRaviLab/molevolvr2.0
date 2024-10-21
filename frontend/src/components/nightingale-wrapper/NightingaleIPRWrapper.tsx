import React, { useEffect, useRef } from "react";
import "@nightingale-elements/nightingale-interpro-track";

// Define types
type Fragment = {
  start: number;
  end: number;
};

type Location = {
  fragments: Fragment[];
};

type Feature = {
  accession: string;
  color: string;
  locations: Location[];
  shape: string;
  type: string;
};

type Props = {
  sequence: string;
  features: Feature[];
};

type NightingaleIPRElement = {
  sequence: string;
  features: Feature[];
} & HTMLElement;

const NightingaleIPRWrapper = ({ sequence, features }: Props) => {
  const iprRef = useRef<NightingaleIPRElement>(null);

  useEffect(() => {
    if (iprRef.current) {
      iprRef.current.sequence = sequence;
      iprRef.current.features = features;
    }
  }, [sequence, features]);

  return <nightingale-interpro-track ref={iprRef}></nightingale-interpro-track>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'nightingale-interpro-track': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default NightingaleIPRWrapper;