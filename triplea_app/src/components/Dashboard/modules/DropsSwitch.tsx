import { FunctionComponent, JSX, useState } from "react";
import {
  DropInterface,
  DropSwitcher,
  DropsSwitchProps,
} from "../types/dashboard.types";
import Drops from "./Drops";
import Collection from "./Collection";

const DropsSwitch: FunctionComponent<DropsSwitchProps> = ({
  allDropsLoading,
  setSwitcher,
  allDrops,
  lensClient,
}): JSX.Element => {
  const [dropSwitcher, setDropSwitcher] = useState<DropSwitcher>(
    DropSwitcher.Drops
  );
  const [drop, setDrop] = useState<DropInterface | undefined>();

  switch (dropSwitcher) {
    case DropSwitcher.Collection:
      return (
        <Collection
          setDrop={setDrop}
          setDropSwitcher={setDropSwitcher}
          drop={drop}
          lensClient={lensClient}
        />
      );

    default:
      return (
        <Drops
          allDropsLoading={allDropsLoading}
          allDrops={allDrops}
          setSwitcher={setSwitcher}
          setDropSwitcher={setDropSwitcher}
          setDrop={setDrop}
        />
      );
  }
};

export default DropsSwitch;
