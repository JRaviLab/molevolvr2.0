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

// Use type augmentation instead of namespace
declare global {
  type CustomElement<T> = Partial<
    T &
      React.DOMAttributes<T> & { children: React.ReactNode; ref?: React.Ref<T> }
  >;

  type CustomElementTag = {
    "nightingale-interpro-track": CustomElement<HTMLElement>;
  };

  // Augment the JSX.IntrinsicElements interface
  namespace JSX {
    interface IntrinsicElements extends CustomElementTag {}
  }
}

export default NightingaleIPRWrapper;
