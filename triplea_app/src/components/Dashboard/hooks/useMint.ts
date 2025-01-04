import { SetStateAction, useEffect, useState } from "react";
import { Agent, MintData, MintSwitcher } from "../types/dashboard.types";
import {
  COLLECTION_MANAGER_CONTRACT,
  INFURA_GATEWAY,
  STORAGE_NODE,
  TOKENS,
} from "@/lib/constants";
import CollectionManagerAbi from "@abis/CollectionManagerAbi.json";
import { createWalletClient, custom, decodeEventLog, PublicClient } from "viem";
import { chains } from "@lens-network/sdk/viem";
import { getAgents } from "../../../../graphql/queries/getAgents";
import { evmAddress, SessionClient } from "@lens-protocol/client";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";

const useMint = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void,
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setMintSwitcher: (e: SetStateAction<MintSwitcher>) => void,
  lensClient: SessionClient
) => {
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [id, setId] = useState<string | undefined>();
  const [mintData, setMintData] = useState<MintData>({
    agents: [],
    prices: [],
    tokens: [
      TOKENS[0].contract
    ],
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
        mintData?.dropId == 0 &&
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
            customInstructions: mintData?.agents?.map(
              (ag) => ag?.customInstructions
            ),
            tokens: mintData?.tokens,
            prices: mintData?.prices?.map((price) => Number(price) * 10 ** 18),
            agentIds: mintData?.agents?.map((ag) => Number(ag?.agent?.id)),
            dailyFrequency: mintData?.agents?.map(
              (ag) => Number(ag?.dailyFrequency)
            ),
            metadata: "ipfs://" + responseJSON?.cid,
            amount: Number(mintData?.amount),
          },
          dropMetadata,
          mintData?.dropId,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: res,
      });
      const logs = receipt.logs;

      logs
        .map((log) => {
          try {
            const event = decodeEventLog({
              abi: CollectionManagerAbi,
              data: log.data,
              topics: log.topics,
            });
            if (event.eventName == "CollectionCreated") {
              setId(Number((event.args as any)?.collectionId).toString());
            }
          } catch (err) {
            return null;
          }
        })
        .filter((event) => event !== null);

      setMintData({
        agents: [],
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
      setMintSwitcher(MintSwitcher.Success);
    } catch (err: any) {
      console.error(err.message);
    }
    setMintLoading(false);
  };

  const loadAgents = async () => {
    setAgentsLoading(true);

    try {
      const data = await getAgents();
      const allAgents: Agent[] = await Promise.all(
        data?.data?.agentCreateds.map(async (agent: any) => {
          if (!agent.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${agent.uri.split("ipfs://")?.[1]}`
            );
            agent.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(agent?.wallets?.[0]),
            },
            lensClient
          );

          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              (result as any)?.[0]?.account?.metadata?.picture?.split(
                "lens://"
              )?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            id: agent?.AAAAgents_id,
            cover: agent?.metadata?.cover,
            title: agent?.metadata?.title,
            description: agent?.metadata?.description,
            wallet: agent?.wallets?.[0],
            balance: agent?.balances,
            profile: {
              ...(result as any)?.[0]?.account,
              metadata: {
                ...(result as any)?.[0]?.account?.metadata,
                picture,
              },
            },
          };
        })
      );

      setAgents(allAgents);
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  useEffect(() => {
    if (!agents || (agents?.length < 1 && lensClient)) {
      loadAgents();
    }
  }, [lensClient]);

  return {
    mintLoading,
    handleMint,
    mintData,
    setMintData,
    agentsLoading,
    id,
  };
};

export default useMint;
