import { random, range, sample, uniqueId } from "lodash";
import { type Item } from "@/components/Sunburst";

/** log change to components for testing */
export const logChange = (...args: unknown[]) => {
  console.debug(...args);
};

/** random words of varying length */
export const words =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

/** generate random phrases of varying length */
export const phrases = () =>
  range(1, 10 + 1).map((index) =>
    Array(index)
      .fill("")
      .map(() => sample(words))
      .join(" "),
  );

/** generate fake label */
export const label = () => sample([...phrases(), undefined]);

/** generate fake "type" */
export const type = () =>
  sample([
    "gene",
    "disease",
    "compound",
    "anatomy",
    "phenotype",
    "symptom",
    "genotype",
    "variant",
    "pathway",
    undefined,
  ]);

/** generate fake sequence char */
export const char = (chars?: string) =>
  sample((chars ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ-").split(""));

/** generate fake sequence data */
export const sequence = (chars?: string, min = 10, max = 100) =>
  Array(random(min, max))
    .fill(null)
    .map(() => char(chars))
    .join("");

/** generate fake sunburst item data */
export const sunburstItem = (depth: number): Item => ({
  label: label(),
  type: type(),
  value: random(10, 100),
  ...(depth > 0 && {
    children: Array(random(1, 2))
      .fill({})
      .map(() => sunburstItem(depth - 1)),
  }),
});

/** fake sunburst data */
export const sunburst = [
  sunburstItem(random(1, 3)),
  sunburstItem(random(1, 3)),
  sunburstItem(random(1, 3)),
];

/** fake node data */
export const nodes = Array(200)
  .fill(null)
  .map(() => ({
    id: uniqueId(),
    label: label(),
    type: type(),
    strength: sample([0, 0.1, 0.02, 0.003, 0.0004, 0.00005, undefined]),
    extra: sample(["cat", "dog", "bird"]),
  }));

export const nodeIds = nodes.map((node) => node.id);

/** generate fake edge data */
export const edges = Array(500)
  .fill(null)
  .map(() => ({
    id: uniqueId(),
    label: label(),
    source: sample(nodeIds)!,
    target: sample(nodeIds)!,
    type: sample([
      "causes",
      "interacts with",
      "upregulates",
      "includes",
      "presents",
      undefined,
    ]),
    direction: sample([-1, 0, 1, undefined] as const),
    strength: sample([10, 11, 12, 13, 14, 15, undefined]),
  }));

/** add some duplicate edges */
for (let times = 0; times < 10; times++)
  edges.push({ ...sample(edges)!, id: uniqueId() });

/** add some loop edges */
for (let times = 0; times < 10; times++) {
  const { id } = sample(nodes)!;
  const edge = sample(edges)!;
  edges.push({ ...edge, id: uniqueId(), source: id, target: id });
}

/** fake interproscan sequence */
export const iprSequence = sequence("GATC");

/** fake interproscan track data */
export const iprTracks = Array(random(5, 10))
  .fill(null)
  .map(() => ({
    label: label(),
    features: Array(random(1, 3))
      .fill(null)
      .map(() => {
        const start = random(1, Math.floor(iprSequence.length / 2));
        const end = random(
          start + Math.floor(iprSequence.length / 4),
          iprSequence.length,
        );
        return { id: uniqueId(), label: label(), type: type(), start, end };
      }),
  }));

/** fake msa sequence */
export const msaSequence = sequence(undefined, 10, 1000);

/** fake msa track data */
export const msaTracks = Array(random(5, 10))
  .fill(null)
  .map(() => ({
    label: label(),
    extraField: label(),
    sequence: [...msaSequence]
      .map((c) => (Math.random() > 0.9 ? char() : c))
      .join(""),
  }));
