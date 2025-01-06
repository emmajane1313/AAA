import { SetStateAction, useEffect, useState } from "react";
import { Agent } from "../types/dashboard.types";
import { evmAddress, PublicClient } from "@lens-protocol/client";
import {
  createWalletClient,
  custom,
  PublicClient as LensPublicClient,
} from "viem";
import { getUserAgents } from "../../../../graphql/queries/getUserAgents";
import { AGENTS_CONTRACT, INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { chains } from "@lens-network/sdk/viem";
import AgentAbi from "@abis/AgentAbi.json";

const useUserAgents = (
  lensClient: PublicClient,
  publicClient: LensPublicClient,
  address: `0x${string}` | undefined,
  setNotification: (e: SetStateAction<string | undefined>) => void
) => {
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [agentEditLoading, setAgentEditLoading] = useState<boolean>(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [agentMetadata, setAgentMetadata] = useState<{
    cover?: string | Blob;
    title: string;
    description: string;
    customInstructions: string;
  }>({
    title: "",
    description: "",
    customInstructions: "",
  });
  const [currentAgent, setCurrentAgent] = useState<Agent | undefined>();

  const handleUserAgents = async () => {
    if (!address) return;
    setAgentsLoading(true);
    try {
      const data = await getUserAgents(address);

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
            customInstructions: agent?.metadata?.customInstructions,
            wallet: agent?.wallets?.[0],
            balance: agent?.balances,
            details: agent?.details,
            owner: agent?.owner,
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

      setUserAgents(allAgents);
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  const handleEditAgent = async () => {
    if (
      !agentMetadata.cover ||
      (typeof agentMetadata.cover == "string" &&
        (agentMetadata.cover as string)?.trim() == "") ||
      agentMetadata.title?.trim() == "" ||
      agentMetadata.description?.trim() == "" ||
      agentMetadata.customInstructions?.trim() == ""
    )
      return;
    setAgentEditLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      let agentImage = agentMetadata?.cover;

      if (typeof agentImage !== "string") {
        const responseImage = await fetch("/api/ipfs", {
          method: "POST",
          body: agentImage,
        });

        if (!responseImage.ok) {
          const errorText = await responseImage.text();
          console.error("Error from API:", errorText);
          setAgentEditLoading(false);
          return;
        }

        const responseImageJSON = await responseImage.json();

        agentImage = "ipfs://" + responseImageJSON?.cid;
      }

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: agentMetadata.title,
          description: agentMetadata.description,
          customInstructions: agentMetadata.customInstructions,
          cover: agentImage,
        }),
      });

      const responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: AGENTS_CONTRACT,
        abi: AgentAbi,
        functionName: "editAgent",
        chain: chains.testnet,
        args: [
          [currentAgent?.wallet],
          "ipfs://" + responseJSON?.cid,
          currentAgent?.id,
        ],
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
    setAgentEditLoading(false);
  };

  useEffect(() => {
    if (userAgents?.length < 1 && lensClient && address) {
      handleUserAgents();
    }
  }, [lensClient, address]);

  return {
    agentsLoading,
    userAgents,
    handleEditAgent,
    currentAgent,
    setCurrentAgent,
    agentEditLoading,
    agentMetadata,
    setAgentMetadata,
  };
};

export default useUserAgents;
