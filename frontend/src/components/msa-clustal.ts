import type { Hue } from "@/util/color";
import type { Props } from "./MSA";
import { sum } from "lodash";

/** https://www.jalview.org/help/html/colourSchemes/clustal.html */

/** raw table text */
const table = [
  ["Hydrophobic", "A,C,I,L,M,F,W,V", "{>60%,WLVIMAFCYHP}"],
  ["Hydrophobic", "C", "{>60%,WLVIMAFCYHP}"],
  ["Positive charge", "K,R", "{>60%,KR},{>85%,K,R,Q}"],
  ["Negative charge", "E", "{>60%,KR},{>50%,QE},{>50%,ED},{>85%,E,Q,D}"],
  ["Negative charge", "D", "{>60%,KR},{>85%,D,E,N},{>50%,ED}"],
  ["Polar", "N", "{>50%,N},{>85%,N,D}"],
  ["Polar", "Q", "{>60%,KR},{>50%,QE},{>85%,Q,T,K,R}"],
  ["Polar", "S,T", "{>60%,WLVIMAFCYHP},{>50%,TS},{>85%,S,T}"],
  ["Cysteines", "C", "{>85%,C}"],
  ["Glycines", "G", "{>0%,G}"],
  ["Prolines", "P", "{>0%,P}"],
  ["Aromatic", "H,Y", "{>60%,WLVIMAFCYHP},{>85%,W,Y,A,C,P,Q,F,H,I,L,M,V}"],
] as const;

/** parse raw table text into usable form */
const parsedTable = table.map(([category, residue, threshold]) => ({
  category,
  chars: residue.replaceAll(",", ""),
  conditions: [...threshold.matchAll(/\{.+?\}/g)].map(([condition]) => {
    const [, percent = "", chars = ""] =
      condition.match(/(\d+)%.*?([A-Z].*?)}/) ?? [];
    const type = chars.includes(",") ? "individually" : "combined";
    return {
      percent: parseFloat(percent || "0") / 100,
      type,
      chars: chars.split(""),
    } as const;
  }),
}));

/** map char to type */
export const clustalType: Props["getType"] = (char, combined) => {
  for (const { category, chars, conditions } of parsedTable)
    if (
      /** if char is a certain one */
      chars.includes(char) &&
      /** and if percentages meet some criteria */
      conditions.some(({ percent, type, chars }) => {
        if (type === "individually")
          /** consider each char individually */
          return chars.some((char) => (combined[char] ?? 0) > percent);
        else
          /** combine chars together */
          return sum(chars.map((char) => combined[char] ?? 0)) > percent;
      })
    )
      return category;

  return "";
};

/** map type to color */
export const clustalColors: Record<(typeof table)[number][0], Hue> = {
  Hydrophobic: "blue",
  "Positive charge": "red",
  "Negative charge": "fuchsia",
  Polar: "green",
  Cysteines: "pink",
  Glycines: "orange",
  Prolines: "lime",
  Aromatic: "cyan",
};
