"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createContext } from "react";
import { chains } from "@lens-network/sdk/viem";
import { PublicClient, testnet } from "@lens-protocol/client";

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

export const ModalContext = createContext<{} | undefined>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const clienteLens = PublicClient.create({
    environment: testnet,
    origin: "https://agentmemefactory.xyz",
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ModalContext.Provider value={{}}>{children}</ModalContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
