import type { UnionToIntersection, ValueOf } from "type-fest";

/** https://stackoverflow.com/questions/52856496/typescript-object-keys-return-string */
export const getEntries = <Obj extends object>(object: Obj) =>
  Object.entries(object) as [
    keyof Obj,
    NonNullable<UnionToIntersection<ValueOf<Obj>>>,
  ][];
