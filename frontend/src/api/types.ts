export type InputFormat = "fasta" | "accnum" | "msa" | "blast" | "interproscan";
export type AnalysisType =
  | "phylogeny-domain"
  | "homology-domain"
  | "homology"
  | "domain";

/** homepage meta-stats */
export type Stats = {
  /** analyses currently running */
  running: number;
  /** analyses completed */
  performed: number;
  /** proteins processes */
  proteins: number;
};

type ID = string;

export type Analysis = {
  /** unique id */
  id: ID;
  /** human name */
  name: string;
  /** type of analysis */
  type: "fasta" | string;
  /** extra info */
  info?: string;
  /** started iso datetime */
  started?: string;
  /** high-level status and info */
  status?: { type: StatusType; info: string };
};

export type StatusType = "analyzing" | "complete" | "error";
