import { NFTData } from "@/components/Common/types/common.types";
import { chains } from "@lens-network/sdk/viem";
import { useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { MARKET_CONTRACT, TOKENS } from "@/lib/constants";
import { CollectData } from "../types/nft.types";

const usePurchase = (
  nft: NFTData,
  address: `0x${string}` | undefined,
  publicClient: PublicClient
) => {
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [collectData, setCollectData] = useState<CollectData>({
    amount: 1,
    token: TOKENS[0]?.contract,
  });
  const [screen, setScreen] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(false);

  const handleApprove = async () => {
    setPurchaseLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: MARKET_CONTRACT,
        abi: MarketAbi,
        functionName: "approve",
        chain: chains.testnet,
        args: [
          MARKET_CONTRACT,
          Number(Number(nft?.prices[0]) * 1.5 * collectData?.amount).toFixed(0),
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      setApproved(true);
    } catch (err: any) {
      console.error(err.message);
    }
    setPurchaseLoading(false);
  };

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: MARKET_CONTRACT,
        abi: MarketAbi,
        functionName: "buy",
        chain: chains.testnet,
        args: [Number(nft.id), collectData?.amount, collectData?.token],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });
    } catch (err: any) {
      console.error(err.message);
    }
    setPurchaseLoading(false);
  };

  return {
    purchaseLoading,
    handlePurchase,
    handleApprove,
    approved,
    setCollectData,
    collectData,
    screen,
    setScreen,
  };
};

export default usePurchase;
