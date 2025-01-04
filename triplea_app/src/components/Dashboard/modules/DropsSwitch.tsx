import { FunctionComponent, JSX, useState } from "react";
import {
  DropInterface,
  DropSwitcher,
  DropsSwitchProps,
} from "../types/dashboard.types";
import Drops from "./Drops";
import Collection from "./Collection";
import AgentsCollection from "./AgentsCollection";
import { NFTData } from "@/components/Common/types/common.types";

const DropsSwitch: FunctionComponent<DropsSwitchProps> = ({
  allDropsLoading,
  setSwitcher,
  allDrops,
  lensClient,
  setNotification,
  agents
}): JSX.Element => {
  const [dropSwitcher, setDropSwitcher] = useState<DropSwitcher>(
    DropSwitcher.Drops
  );
  const [drop, setDrop] = useState<DropInterface | undefined>();
  const [collection, setCollection] = useState<NFTData | undefined>();

  switch (dropSwitcher) {
    case DropSwitcher.Collection:
      return (
        <Collection
          setDrop={setDrop}
          setDropSwitcher={setDropSwitcher}
          drop={drop}
          lensClient={lensClient}
          setCollection={setCollection}
        />
      );

    case DropSwitcher.AgentsCollection:
      return (
        <AgentsCollection
          setCollection={setCollection}
          setDrop={setDrop}
          setDropSwitcher={setDropSwitcher}
          collection={collection!}
          setNotification={setNotification}
          agents={agents}
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
