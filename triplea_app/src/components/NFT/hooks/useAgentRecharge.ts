import { Agent } from "@/components/Dashboard/types/dashboard.types";
import { AGENTS_CONTRACT, WGRASS_CONTRACT } from "@/lib/constants";
import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import AgentAbi from "@abis/AgentAbi.json";

const useAgentRecharge = (
  nftAgents: string[],
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  collectionId: number
) => {
  const [rechargeLoading, setRechargeLoading] = useState<boolean[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState<number[]>([]);
  const [approvedRecharge, setApprovedRecharge] = useState<boolean[]>([]);

  const handleApproveRecharge = async (agent: Agent) => {
    const amount =
      rechargeAmount[
        nftAgents?.findIndex((ag) => Number(ag) == Number(agent.id))
      ];
    if (amount <= 0) {
      setNotification?.("Invalid Recharge Amount :/");
      return;
    }

    setRechargeLoading((prev) => {
      let ref = [...prev];

      let index = nftAgents?.findIndex((ag) => Number(ag) == Number(agent.id));

      ref[index] = true;

      return ref;
    });

    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: WGRASS_CONTRACT,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "spender",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "approve",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        chain: chains.testnet,
        args: [AGENTS_CONTRACT, BigInt(amount * 10 ** 18)],
        account: address,
      });
      const res = await clientWallet.writeContract(request);

      await publicClient.waitForTransactionReceipt({ hash: res });

      setApprovedRecharge((prev) => {
        let ref = [...prev];

        let index = nftAgents?.findIndex(
          (ag) => Number(ag) == Number(agent.id)
        );

        ref[index] = true;

        return ref;
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setRechargeLoading((prev) => {
      let ref = [...prev];

      let index = nftAgents?.findIndex((ag) => Number(ag) == Number(agent.id));

      ref[index] = false;

      return ref;
    });
  };

  const handleRecharge = async (agent: Agent, token: string) => {
    const amount =
      rechargeAmount[
        nftAgents?.findIndex((ag) => Number(ag) == Number(agent.id))
      ];
    if (amount <= 0) {
      setNotification?.("Invalid Recharge Amount :/");
      return;
    }
    setRechargeLoading((prev) => {
      let ref = [...prev];

      let index = nftAgents?.findIndex((ag) => Number(ag) == Number(agent.id));

      ref[index] = true;

      return ref;
    });
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const balance = await publicClient.readContract({
        address: WGRASS_CONTRACT,
        abi: [
          {
            constant: true,
            inputs: [
              {
                name: "_owner",
                type: "address",
              },
            ],
            name: "balanceOf",
            outputs: [
              {
                name: "balance",
                type: "uint256",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        account: address,
      });

      if (balance < BigInt(amount)) {
        setNotification?.("Not Enough Tokens in Your Wallet :(");
        setRechargeLoading((prev) => {
          let ref = [...prev];

          let index = nftAgents?.findIndex(
            (ag) => Number(ag) == Number(agent.id)
          );

          ref[index] = false;

          return ref;
        });
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: AGENTS_CONTRACT,
        abi: AgentAbi,
        functionName: "rechargeAgentActiveBalance",
        chain: chains.testnet,
        args: [
          token,
          Number(agent?.id),
          Number(collectionId),
          amount * 10 ** 18,
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: res,
      });

      setNotification?.("Success! You recharged the agent!");
      setApprovedRecharge((prev) => {
        let ref = [...prev];

        let index = nftAgents?.findIndex(
          (ag) => Number(ag) == Number(agent.id)
        );

        ref[index] = false;

        return ref;
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setRechargeLoading((prev) => {
      let ref = [...prev];

      let index = nftAgents?.findIndex((ag) => Number(ag) == Number(agent.id));

      ref[index] = false;

      return ref;
    });
  };

  useEffect(() => {
    if (nftAgents?.length > 0) {
      setRechargeLoading(
        Array.from({ length: nftAgents?.length }, () => false)
      );
      setApprovedRecharge(
        Array.from({ length: nftAgents?.length }, () => false)
      );
      setRechargeAmount(Array.from({ length: nftAgents?.length }, () => 1));
    }
  }, [nftAgents]);

  return {
    rechargeLoading,
    handleRecharge,
    setRechargeAmount,
    rechargeAmount,
    handleApproveRecharge,
    approvedRecharge,
  };
};

export default useAgentRecharge;
