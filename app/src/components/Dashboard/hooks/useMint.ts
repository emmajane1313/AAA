import { SetStateAction, useEffect, useState } from "react";
import { Agent, MintData } from "../types/dashboard.types";
import { COLLECTION_MANAGER_CONTRACT } from "@/lib/constants";
import CollectionManagerAbi from "@abis/CollectionManagerAbi.json";
import { createWalletClient, custom, PublicClient } from "viem";
import { chains } from "@lens-network/sdk/viem";

const useMint = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void,
  publicClient: PublicClient,
  address: `0x${string}` | undefined
) => {
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [mintData, setMintData] = useState<MintData>({
    agentIds: [],
    prices: [],
    tokens: [],
    dropId: 0,
    dropCover: undefined,
    dropTitle: "",
    title: "",
    description: "",
    image: undefined,
    amount: 2,
  });

  const handleMint = async () => {
    if (
      !mintData.image ||
      mintData.prices?.length < 1 ||
      mintData.tokens?.length < 1 ||
      (mintData.dropId === 0 &&
        (!mintData?.dropCover || mintData?.dropTitle?.trim() == ""))
    )
      return;
    setMintLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      let dropMetadata = "";

      if (
        mintData?.dropCover &&
        mintData?.dropId > 0 &&
        mintData?.dropTitle?.trim() !== ""
      ) {
        const responseCover = await fetch("/api/ipfs", {
          method: "POST",
          body: mintData?.dropCover,
        });

        if (!responseCover.ok) {
          const errorText = await responseCover.text();
          console.error("Error from API:", errorText);
          setMintLoading(false);
          return;
        }

        const responseCoverJSON = await responseCover.json();
        const response = await fetch("/api/ipfs", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            cover: "ipfs://" + responseCoverJSON.cid,
            title: mintData?.dropTitle,
          }),
        });

        let responseJSON = await response.json();
        dropMetadata = "ipfs://" + responseJSON?.cid;
      }

      const responseImage = await fetch("/api/ipfs", {
        method: "POST",
        body: mintData?.image,
      });

      if (!responseImage.ok) {
        const errorText = await responseImage.text();
        console.error("Error from API:", errorText);
        setMintLoading(false);
        return;
      }

      const responseImageJSON = await responseImage.json();

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: mintData.title,
          description: mintData.description,
          image: "ipfs://" + responseImageJSON.cid,
        }),
      });

      let responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: COLLECTION_MANAGER_CONTRACT,
        abi: CollectionManagerAbi,
        functionName: "create",
        chain: chains.testnet,
        args: [
          {
            tokens: mintData?.tokens,
            prices: mintData?.prices,
            agentIds: mintData?.agentIds,
            metadata: "ipfs://" + responseJSON?.cid,
            amount: Number(mintData?.amount),
          },
          dropMetadata,
          mintData?.dropId,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      setMintData({
        agentIds: [],
        prices: [],
        tokens: [],
        dropId: 0,
        dropCover: undefined,
        dropTitle: "",
        title: "",
        description: "",
        image: undefined,
        amount: 2,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setMintLoading(false);
  };

  const loadAgents = async () => {
    setAgentsLoading(true);

    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  useEffect(() => {
    if (!agents || agents?.length < 1) {
      loadAgents();
    }
  }, []);

  return {
    mintLoading,
    handleMint,
    mintData,
    setMintData,
    agentsLoading,
  };
};

export default useMint;
