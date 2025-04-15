import { Fragment, useMemo } from "react";
import { mapValues } from "lodash";
import type NightingaleInterproTrack from "@nightingale-elements/nightingale-interpro-track";
import type NightingaleManager from "@nightingale-elements/nightingale-manager";
import type NightingaleNavigation from "@nightingale-elements/nightingale-navigation";
import type NightingaleSequence from "@nightingale-elements/nightingale-sequence";
import Legend from "@/components/Legend";
import { getColorMap } from "@/util/color";
import classes from "./IPR.module.css";
import "@nightingale-elements/nightingale-manager";
import "@nightingale-elements/nightingale-navigation";
import "@nightingale-elements/nightingale-sequence";
import "@nightingale-elements/nightingale-interpro-track";

/** track of features */
type Track = {
  label?: string;
  features: Feature[];
};

type Feature = {
  /** unique id */
  id: string;
  /** human-readable label */
  label?: string;
  /** arbitrary type/category */
  type?: string;
  /** starting position of feature in sequence (1-indexed) */
  start: number;
  /** ending position of feature in sequence (1-indexed) */
  end: number;
};

type Props = { sequence: string; tracks: Track[] };

const IPR = ({ sequence, tracks }: Props) => {
  /** props for all nightingale components */
  const commonProps = {
    length: sequence.length,
    height: 50,
    "display-start": 1,
    "display-end": -1,
    "margin-top": 0,
    "margin-bottom": 0,
    "margin-left": 0,
    "margin-right": 0,
  };

  const managerProps: Partial<NightingaleManager> = {};

  const navigationProps: Partial<NightingaleNavigation> = {
    ...commonProps,
  };

  const sequenceProps: Partial<NightingaleSequence> = {
    sequence,
    ...commonProps,
  };

  const interproProps: Partial<NightingaleInterproTrack> = {
    ...commonProps,
    label: ".feature.label",
    "show-label": true,
    expanded: true,
  };

  /** map of feature types to colors */
  const featureColors = useMemo(
    () =>
      getColorMap(
        tracks
          .map((track) => track.features.map((feature) => feature.type ?? ""))
          .flat(),
      ),
    [tracks],
  );

  return (
    <>
      <nightingale-manager {...managerProps} class={classes.manager}>
        <div className={classes.grid}>
          <div>Navigator</div>
          <nightingale-navigation {...navigationProps} />
          <div>Sequence</div>
          <nightingale-sequence {...sequenceProps} />
          {tracks.map((track, index) => (
            <Fragment key={index}>
              <div>{track.label ?? "-"}</div>
              <nightingale-interpro-track
                ref={(ref: Partial<NightingaleInterproTrack> | null) => {
                  if (!ref) return;

                  ref.data = track.features.map(
                    ({ id, label, type, start, end }) => ({
                      accession: id,
                      label: label ?? id,
                      locations: [{ fragments: [{ start, end }] }],
                      residues: [],
                      color: featureColors[type ?? ""],
                    }),
                  );

                  return ref;
                }}
                {...interproProps}
                height={50}
              />
            </Fragment>
          ))}
        </div>
      </nightingale-manager>

      <Legend entries={mapValues(featureColors, (color) => ({ color }))} />
    </>
  );
};

export default IPR;
