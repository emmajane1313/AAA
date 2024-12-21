"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createContext, SetStateAction, useState } from "react";
import { chains } from "@lens-network/sdk/viem";
import { PublicClient, testnet } from "@lens-protocol/client";
import {
  Agent,
  DropInterface,
} from "@/components/Dashboard/types/dashboard.types";

export const config = getDefaultConfig({
  appName: "Triple A",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains: [chains.testnet],
  transports: {
    [chains.testnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export const ModalContext = createContext<
  | {
      imageView: string | undefined;
      setImageView: (e: SetStateAction<string | undefined>) => void;
      agents: Agent[];
      setAgents: (e: SetStateAction<Agent[]>) => void;
      allDrops: DropInterface[];
      setAllDrops: (e: SetStateAction<DropInterface[]>) => void;
    }
  | undefined
>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [imageView, setImageView] = useState<string | undefined>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allDrops, setAllDrops] = useState<DropInterface[]>([]);
  const clienteLens = PublicClient.create({
    environment: testnet,
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ModalContext.Provider
            value={{
              imageView,
              setImageView,
              agents,
              setAgents,
              allDrops,
              setAllDrops,
            }}
          >
            {children}
          </ModalContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
