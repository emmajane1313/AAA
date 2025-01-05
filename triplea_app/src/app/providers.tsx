"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { chains } from "@lens-network/sdk/viem";
import { Context, PublicClient, testnet } from "@lens-protocol/client";
import { Agent } from "@/components/Dashboard/types/dashboard.types";
import {
  LensConnected,
  TokenThreshold,
} from "@/components/Common/types/common.types";
import {
  StorageClient,
  testnet as storageTestnet,
} from "@lens-protocol/storage-node-client";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    appName: "Triple A",
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appUrl: "https://triplea.agentmeme.xyz",
    appIcon: "https://triplea.agentmeme.xyz/favicon.ico",
    chains: [chains.testnet],
    transports: {
      [chains.testnet.id]: http("https://rpc.testnet.lens.dev"),
    },
    ssr: true,
  
  })
);

const queryClient = new QueryClient();

export const AnimationContext = createContext<
  | {
      pageChange: boolean;
      setPageChange: (e: SetStateAction<boolean>) => void;
    }
  | undefined
>(undefined);

export const ModalContext = createContext<
  | {
      imageView: string | undefined;
      setImageView: (e: SetStateAction<string | undefined>) => void;
      indexer: string | undefined;
      setIndexer: (e: SetStateAction<string | undefined>) => void;
      notification: string | undefined;
      setNotification: (e: SetStateAction<string | undefined>) => void;
      agents: Agent[];
      setAgents: (e: SetStateAction<Agent[]>) => void;
      lensClient: PublicClient<Context> | undefined;
      createAccount: boolean;
      setCreateAccount: (e: SetStateAction<boolean>) => void;
      signless: boolean;
      setSignless: (e: SetStateAction<boolean>) => void;
      lensConnected: LensConnected | undefined;
      setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void;
      storageClient: StorageClient;
      tokenThresholds: TokenThreshold[];
      setTokenThresholds: (e: SetStateAction<TokenThreshold[]>) => void;
    }
  | undefined
>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lensConnected, setLensConnected] = useState<
    LensConnected | undefined
  >();
  const [indexer, setIndexer] = useState<string | undefined>();
  const [imageView, setImageView] = useState<string | undefined>();
  const [notification, setNotification] = useState<string | undefined>();
  const [tokenThresholds, setTokenThresholds] = useState<TokenThreshold[]>([]);
  const [pageChange, setPageChange] = useState<boolean>(false);
  const [signless, setSignless] = useState<boolean>(false);
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [lensClient, setLensClient] = useState<PublicClient | undefined>();
  const storageClient = StorageClient.create(storageTestnet);

  useEffect(() => {
    if (!lensClient) {
      setLensClient(
        PublicClient.create({
          environment: testnet,
          storage: window.localStorage,
        })
      );
    }
  }, []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-font-family": '"Jackey2", cursive',
          }}
        
        >
          <AnimationContext.Provider
            value={{
              pageChange,
              setPageChange,
            }}
          >
            <ModalContext.Provider
              value={{
                imageView,
                setImageView,
                agents,
                setAgents,
                lensClient,
                createAccount,
                setCreateAccount,
                lensConnected,
                setLensConnected,
                indexer,
                setIndexer,
                notification,
                setNotification,
                storageClient,
                signless,
                setSignless,
                tokenThresholds,
                setTokenThresholds,
              }}
            >
              {children}
            </ModalContext.Provider>
          </AnimationContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
