import React, { useEffect, useRef } from 'react';
import '@nightingale-elements/nightingale-msa'; 
import { Region, SequencesMSA } from '@nightingale-elements/nightingale-msa'; 

interface NightingaleMSAWrapperProps {
sequences: SequencesMSA;
features: Array<Region>;
}

// Define the type for the custom element
interface NightingaleMSAElement extends HTMLElement {
data: SequencesMSA;
features: Array<Region>;
}

const NightingaleMSAWrapper: React.FC<NightingaleMSAWrapperProps> = ({ sequences, features }) => {
const msaRef = useRef<NightingaleMSAElement>(null);

useEffect(() => {
if (msaRef.current) {
msaRef.current.data = sequences;
msaRef.current.features = features;
}
}, [sequences, features]);

return <nightingale-msa ref={msaRef}></nightingale-msa>;
};

export default NightingaleMSAWrapper;