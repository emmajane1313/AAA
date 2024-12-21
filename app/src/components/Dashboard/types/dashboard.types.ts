import { SetStateAction } from "react";

export enum Switcher {
  Home,
  Sales,
  Agents,
  Mint,
  Drops,
}

export enum MintSwitcher {
  Collection,
  Agent,
  Drop,
  Mint,
}

export type MintSwitchProps = {
  mintSwitcher: MintSwitcher;
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void;
};

export type DropsProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
};

export type SalesProps = {
  setSwitcher: (e: SetStateAction<Switcher>) => void;
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
  name: string;
  description: string;
  wallet: string;
}

export interface DropInterface {
  id: string;
  title: string;
  cover: string;
  collectionIds: string[];
}
