import { COLLECTION_MANAGER_CONTRACT } from "@/lib/constants";
import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import CollectionManagerAbi from "@abis/CollectionManagerAbi.json";
import { NFTData } from "@/components/Common/types/common.types";
import { Agent } from "../types/dashboard.types";

const useAgentsCollection = (
  address: `0x${string}` | undefined,
  publicClient: PublicClient,
  collection: NFTData,
  agents: Agent[],
  setNotification: (e: SetStateAction<string | undefined>) => void
) => {
  const [priceAdjustLoading, setPriceAdjustLoading] = useState<boolean>(false);
  const [editAgentsLoading, setEditAgentsLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string[]>([]);
  const [dailyFrequency, setDailyFrequency] = useState<number[]>([]);
  const [priceAdjusted, setPriceAdjusted] = useState<number>(
    Number(collection?.prices?.[0]) / 10 ** 18 || 0
  );

  const handlePriceAdjust = async () => {
    if (priceAdjusted <= 0) return;

    setPriceAdjustLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "adjustCollectionPrice",
        chain: chains.testnet,
        args: [
          collection?.tokens?.[0],
          Number(collection?.id),
          priceAdjusted * 10 ** 18,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setPriceAdjustLoading(false);
  };

  const handleEditAgents = async () => {
    setEditAgentsLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });
      let ids = agents
        ?.filter((ag) => collection?.agents?.includes(ag?.id))
        ?.map((ag) => Number(ag?.id));

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "updateAgentCollectionDetails",
        chain: chains.testnet,
        args: [customInstructions, dailyFrequency, ids, Number(collection?.id)],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.("Success! Everything will be on chain soon :)");
    } catch (err: any) {
      console.error(err.message);
    }
    setEditAgentsLoading(false);
  };

  const handleCollectionStatus = async () => {
    setStatusLoading(true);
    try {
      const functionName =
        Number(collection?.amountSold || 0) == 0
          ? "deleteCollecton"
          : collection?.active
          ? "deactivateCollection"
          : "activateCollection";

      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: functionName,
        chain: chains.testnet,
        args: [Number(collection?.id)],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.(
        `Success! Collection ${
          Number(collection?.amountSold || 0) == 0
            ? "Deleted"
            : collection?.active
            ? "Deactivated"
            : "Activated"
        } `
      );
    } catch (err: any) {
      console.error(err.message);
    }
    setStatusLoading(false);
  };

  useEffect(() => {
    if (collection) {
      setPriceAdjusted(Number(collection?.prices?.[0]) / 10 ** 18);
      if (collection?.agents?.length > 0) {
        let nftAgents = agents?.filter((ag) =>
          collection?.agents?.includes(ag?.id)
        );
        if (nftAgents) {
          setDailyFrequency(
            nftAgents?.map(
              (ag) =>
                Number(
                  ag?.details?.find(
                    (col) => Number(col?.collectionId) == Number(collection?.id)
                  )?.dailyFrequency
                ) || 0
            )
          );
          setCustomInstructions(
            nftAgents?.map(
              (ag) =>
                ag?.details?.find(
                  (col) => Number(col?.collectionId) == Number(collection?.id)
                )?.instructions || ""
            )
          );
        }
      }
    }
  }, [collection, agents]);

  return {
    handlePriceAdjust,
    priceAdjustLoading,
    handleEditAgents,
    editAgentsLoading,
    priceAdjusted,
    setPriceAdjusted,
    dailyFrequency,
    setCustomInstructions,
    setDailyFrequency,
    customInstructions,
    statusLoading,
    handleCollectionStatus,
  };
};

export default useAgentsCollection;
