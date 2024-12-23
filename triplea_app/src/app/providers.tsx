"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createContext, SetStateAction, useState } from "react";
import { chains } from "@lens-network/sdk/viem";
import { Context, PublicClient, testnet } from "@lens-protocol/client";
import { Agent } from "@/components/Dashboard/types/dashboard.types";
import { LensConnected } from "@/components/Common/types/common.types";

export const config = getDefaultConfig({
  appName: "Triple A",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains: [chains.testnet],
  transports: {
    [chains.testnet.id]: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
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
      lensClient: PublicClient<Context>;
      createAccount: boolean;
      setCreateAccount: (e: SetStateAction<boolean>) => void;
      lensConnected: LensConnected | undefined;
      setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void;
    }
  | undefined
>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lensConnected, setLensConnected] = useState<
    LensConnected | undefined
  >();
  const [imageView, setImageView] = useState<string | undefined>();
  const [createAccount, setCreateAccount] = useState<boolean>(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const lensClient = PublicClient.create({
    environment: testnet
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
              lensClient,
              createAccount,
              setCreateAccount,
              lensConnected,
              setLensConnected,
            }}
          >
            {children}
          </ModalContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
