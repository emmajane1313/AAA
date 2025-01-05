import { NFTData } from "@/components/Common/types/common.types";
import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom, PublicClient } from "viem";
import MarketAbi from "@abis/MarketAbi.json";
import { MARKET_CONTRACT, TOKENS, WGRASS_CONTRACT } from "@/lib/constants";
import { CollectData } from "../types/nft.types";

const usePurchase = (
  nft: NFTData,
  setNft: (e: SetStateAction<NFTData | undefined>) => void,
  address: `0x${string}` | undefined,
  publicClient: PublicClient,
  setNotification: (e: SetStateAction<string | undefined>) => void
) => {
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [collectData, setCollectData] = useState<CollectData>({
    amount: 1,
    token: TOKENS[0]?.contract,
  });
  const [screen, setScreen] = useState<number>(0);
  const [approved, setApproved] = useState<boolean>(false);

  const checkAllowance = async () => {
    if (!address) return;
    try {
      const data = await publicClient.readContract({
        address: WGRASS_CONTRACT,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "owner",
                type: "address",
              },
              {
                internalType: "address",
                name: "spender",
                type: "address",
              },
            ],
            name: "allowance",
            outputs: [
              {
                internalType: "uint256",
                name: "",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "allowance",
        args: [address as `0x${string}`, MARKET_CONTRACT],
        account: address,
      });

      if (
        data >=
        BigInt(Number(Number(nft?.prices[0]) * collectData?.amount).toFixed(0))
      ) {
        setApproved(true);
      } else {
        setApproved(false)
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleApprove = async () => {
    setPurchaseLoading(true);

    try {
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

      if (
        balance <
        BigInt(Number(Number(nft?.prices[0]) * collectData?.amount).toFixed(0))
      ) {
        setNotification?.("Not Enough Tokens in Your Wallet :(");
        setPurchaseLoading(false);
        return;
      }

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
        args: [
          MARKET_CONTRACT,
          BigInt(
            Number(Number(nft?.prices[0]) * collectData?.amount).toFixed(0)
          ),
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
    if (collectData?.amount < 1) return;
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

      setNotification?.("It's All Yours! Check sales in your dashboard.");
      setNft({
        ...nft,
        amountSold: Number(nft?.amountSold) + Number(collectData?.amount),
      });
      checkAllowance();
    } catch (err: any) {
      if (err?.message?.includes("NotAvailable")) {
        setNotification?.(
          "We know you're eager, but you've reached this creations' collect limit!"
        );
      }
      console.error(err?.message);
    }
    setPurchaseLoading(false);
  };

  useEffect(() => {
    if (nft && address) {
      checkAllowance();
    }
  }, [address, nft, collectData?.amount]);

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
