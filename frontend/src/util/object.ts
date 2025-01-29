type Nested = Record<PropertyKey, unknown> & { children?: Nested[] };
type Key = keyof Omit<Nested, "children">;

/** map nested values */
export const flatMap = <N extends Nested, K extends Key>(
  layers: N[],
  key: K,
): N[K][] =>
  layers.flatMap((layer) => [
    layer[key],
    ...flatMap((layer.children ?? []) as N[], key),
  ]);
