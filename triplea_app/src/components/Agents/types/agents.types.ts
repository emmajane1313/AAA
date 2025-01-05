import { LensConnected } from "@/components/Common/types/common.types";
import { PublicClient } from "@lens-protocol/client";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { SetStateAction } from "react";

export enum AgentSwitcher {
  Create,
  Gallery,
}

export enum CreateSwitcher {
  Details,
  Profile,
  Create,
  Success,
}

export type CreateSwitchProps = {
  createSwitcher: CreateSwitcher;
  setCreateSwitcher: (e: SetStateAction<CreateSwitcher>) => void;
  lensConnected: LensConnected | undefined;
  setIndexer: (e: SetStateAction<string | undefined>) => void;
  storageClient: StorageClient;
  setNotifcation: (e: SetStateAction<string | undefined>) => void;
  lensClient: PublicClient;
};

export type AgentSwitchProps = {
  agentSwitcher: AgentSwitcher;
  setAgentSwitcher: (e: SetStateAction<AgentSwitcher>) => void;
  createSwitcher: CreateSwitcher;
  setCreateSwitcher: (e: SetStateAction<CreateSwitcher>) => void;
};

export type AgentCreateProps = {
  setAgentSwitcher: (e: SetStateAction<AgentSwitcher>) => void;
};

export interface AgentDetails {
  title: string;
  cover: Blob | undefined;
  description: string;
  customInstructions: string;
}
