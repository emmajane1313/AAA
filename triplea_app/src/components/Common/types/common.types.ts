import { Account, SessionClient } from "@lens-protocol/client";

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
}

export interface LensConnected {
  profile?: Account;
  sessionClient?: SessionClient;
}
