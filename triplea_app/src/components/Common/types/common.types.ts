import { Account, Post, SessionClient } from "@lens-protocol/client";

export interface NFTData {
  id: number;
  image: string;
  title: string;
  description: string;
  blocktimestamp: string;
  prices: string[];
  tokens: string[];
  agents: string[];
  artist: string;
  amountSold: number;
  tokenIds: string[];
  amount: number;
  profile: Account;
  collectors?: Collector[];
  agentActivity?: Post[];
  active: boolean;
}

export interface LensConnected {
  profile?: Account;
  sessionClient?: SessionClient;
}

export interface Collector {
  pfp?: string;
  name?: string;
  address: string;
  transactionHash: string;
  amount: number;
  blockTimestamp: string;
  localName?: string;
}

export interface TokenThreshold {
  token: string;
  threshold: string;
  rent: string;
}
