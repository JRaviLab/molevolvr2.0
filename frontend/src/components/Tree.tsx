export type Item = {
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** children items */
  children?: Item[];
};

type Props = {
  /** chart data */
  data: Item[];
};

const Tree = ({ data }: Props) => <>Hello </>;

export default Tree;
