import { LensConnected, NFTData } from "@/components/Common/types/common.types";
import { Account, PublicClient } from "@lens-protocol/client";
import { SetStateAction } from "react";
import { StorageClient } from "@lens-protocol/storage-node-client";

export enum Switcher {
  Home,
  Sales,
  Collects,
  Agents,
  Mint,
  Drops,
  Account,
}

export enum MintSwitcher {
  Collection,
  Agent,
  Drop,
  Mint,
  Success,
}

export enum DropSwitcher {
  Drops,
  Collection,
}

export type MintSwitchProps = {
  mintSwitcher: MintSwitcher;
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void;
  setAgents: (e: SetStateAction<Agent[]>) => void;
  agents: Agent[];
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  lensConnected: LensConnected;
};

export type DropsProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void;
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void;
};

export type SalesProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
};

export type CollectsProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
};

export type DropProps = {
  mintData: MintData;
  setMintData: (e: SetStateAction<MintData>) => void;
  mintLoading: boolean;
  allDrops: DropInterface[];
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void;
};

export type MintProps = {
  handleMint: () => Promise<void>;
  mintLoading: boolean;
  mintData: MintData;
  setMintData: (e: SetStateAction<MintData>) => void;
  agents: Agent[];
  allDrops: DropInterface[];
};

export type ChooseAgentProps = {
  agents: Agent[];
  agentsLoading: boolean;
  mintData: MintData;
  setMintData: (e: SetStateAction<MintData>) => void;
};

export type AgentProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  agents: Agent[];
  setAgents: (e: SetStateAction<Agent[]>) => void;
  lensConnected: LensConnected | undefined;
};

export type AccountProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensConnected: LensConnected | undefined;
  setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void;
  storageClient: StorageClient;
};

export type MintData = {
  agentIds: string[];
  prices: number[];
  tokens: string[];
  dropId: number;
  dropCover: Blob | undefined;
  dropTitle: string;
  image: Blob | undefined;
  title: string;
  description: string;
  amount: number;
};

export interface Agent {
  id: string;
  cover: string;
  title: string;
  description: string;
  wallet: string;
  balance: Balances[];
  profile?: Account;
}

export interface Balances {
  token: string;
  activeBalance: number;
  totalBalance: number;
  collectionId: number;
}

export interface DropInterface {
  id: string;
  title: string;
  cover: string;
  collectionIds: string[];
}

export interface Order {
  id: string;
  totalPrice: string;
  token: string;
  amount: string;
  collectionId: string;
  mintedTokenIds: string[];
  blockTimestamp: string;
  transactionHash: string;
  collection: NFTData;
  buyer: string;
}

export type DropsSwitchProps = {
  allDrops: DropInterface[];
  allDropsLoading: boolean;
  setSwitcher: (e: SetStateAction<Switcher>) => void;
  lensClient: PublicClient;
};

export type CollectionProps = {
  setDropSwitcher: (e: SetStateAction<DropSwitcher>) => void;
  drop: DropInterface | undefined;
  setDrop: (e: SetStateAction<DropInterface | undefined>) => void;
  lensClient: PublicClient;
};
