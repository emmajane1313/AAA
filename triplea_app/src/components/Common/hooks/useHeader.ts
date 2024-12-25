import { chains } from "@lens-network/sdk/viem";
import { Context, evmAddress, PublicClient } from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { LensConnected, NFTData } from "../types/common.types";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { getCollectionSearch } from "../../../../graphql/queries/getCollectionSearch";
import { INFURA_GATEWAY } from "@/lib/constants";

const useHeader = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient<Context> | undefined,
  setError: ((e: SetStateAction<string | undefined>) => void) | undefined,
  setCreateAccount: ((e: SetStateAction<boolean>) => void) | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined
) => {
  const [openAccount, setOpenAccount] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [lensLoading, setLensLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchItems, setSearchItems] = useState<NFTData[]>([]);

  const handleSearch = async () => {
    if (search?.trim() == "") return;
    setSearchLoading(true);
    try {
      const data = await getCollectionSearch(search);

      const colls: NFTData[] = await Promise.all(
        data?.data?.collectionCreateds?.map(async (collection: any) => {
          if (!collection.metadata) {
            const cadena = await fetch(
              `${INFURA_GATEWAY}/ipfs/${collection.uri.split("ipfs://")?.[1]}`
            );
            collection.metadata = await cadena.json();
          }

          const result = await fetchAccountsAvailable(
            {
              managedBy: evmAddress(collection?.artist),
            },
            lensClient!
          );

          return {
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            artist: collection?.artist,
            profile: (result as any)?.[0]?.account,
          };
        })
      );

      setSearchItems(colls);
    } catch (err: any) {
      console.error(err.message);
    }
    setSearchLoading(false);
  };

  const handleLensConnect = async () => {
    if (!address || !lensClient) return;
    setLensLoading(true);
    try {
      const signer = createWalletClient({
        chain: chains.testnet,
        transport: custom(window.ethereum!),
        account: address,
      });

      const accounts = await fetchAccountsAvailable(
        {
          managedBy: evmAddress(signer.account.address),
        },
        lensClient
      );

      if ((accounts as any)?.[0]?.account?.address) {
        const authenticated = await lensClient.login({
          accountManager: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            account: evmAddress((accounts as any)?.[0]?.account?.address),
            manager: evmAddress(signer.account.address),
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticated.isErr()) {
          console.error(authenticated.error);
          setError?.("Error Authenticating");
          setLensLoading(false);
          return;
        }

        const sessionClient = authenticated.value;

        setLensConnected?.({
          sessionClient,
          profile: (accounts as any)?.[0]?.account,
        });
      } else {
        const authenticatedOnboarding = await lensClient.login({
          onboardingUser: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            wallet: signer.account.address,
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticatedOnboarding.isErr()) {
          console.error(authenticatedOnboarding.error);
          setError?.("Error Onboarding");

          setLensLoading(false);
          return;
        }

        const sessionClient = authenticatedOnboarding.value;

        setLensConnected?.({
          sessionClient,
        });

        setCreateAccount?.(true);
      }
    } catch (err: any) {
      console.error(err.message);
    }

    setLensLoading(false);
  };

  return {
    openAccount,
    setOpenAccount,
    searchItems,
    searchLoading,
    handleLensConnect,
    lensLoading,
    search,
    setSearch,
    handleSearch,
    setSearchItems,
  };
};

export default useHeader;
