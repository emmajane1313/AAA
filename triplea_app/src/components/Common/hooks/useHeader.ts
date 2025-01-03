import { chains } from "@lens-network/sdk/viem";
import {
  Account,
  Context,
  evmAddress,
  PageSize,
  PublicClient,
} from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { LensConnected, NFTData } from "../types/common.types";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { getCollectionSearch } from "../../../../graphql/queries/getCollectionSearch";
import { INFURA_GATEWAY, STORAGE_NODE } from "@/lib/constants";
import revoke from "../../../../graphql/lens/mutations/revoke";
import { fetchAccounts } from "@lens-protocol/client/actions";

const useHeader = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient<Context> | undefined,
  setIndexer: ((e: SetStateAction<string | undefined>) => void) | undefined,
  setCreateAccount: ((e: SetStateAction<boolean>) => void) | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined,
  lensConnected: LensConnected | undefined
) => {
  const [openAccount, setOpenAccount] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [lensLoading, setLensLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchItems, setSearchItems] = useState<{
    nfts: NFTData[];
    handles: Account[];
  }>({
    nfts: [],
    handles: [],
  });
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
            id: collection?.collectionId,
            image: collection?.metadata?.image,
            title: collection?.metadata?.title,
            description: collection?.metadata?.description,
            artist: collection?.artist,
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

      const res = await fetchAccounts(
        lensConnected?.sessionClient || lensClient!,
        {
          pageSize: PageSize.Ten,
          filter: {
            searchBy: {
              localNameQuery: search,
            },
          },
        }
      );
      let handles: Account[] = [];

      if (res.isOk()) {
        handles = res.value?.items as Account[];
      }

      handles = await Promise.all(
        handles?.map(async (han) => {
          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${han?.metadata?.picture?.split("lens://")?.[1]}`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          return {
            ...han,
            metadata: {
              ...han?.metadata,
              picture,
            },
          } as Account;
        })
      );

      setSearchItems({
        nfts: colls,
        handles,
      });
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
          includeOwned: true,
        },
        lensClient
      );

      if ((accounts as any)?.[0]?.account?.address) {
        const authenticated = await lensClient.login({
          accountOwner: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            account: evmAddress((accounts as any)?.[0]?.account?.address),
            owner: signer.account.address?.toLowerCase(),
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticated.isErr()) {
          console.error(authenticated.error);
          setIndexer?.("Error Authenticating");
          setLensLoading(false);
          return;
        }

        const sessionClient = authenticated.value;

        let picture = "";
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            (accounts as any)?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          picture = json.item;
        }

        setLensConnected?.({
          sessionClient,
          profile: {
            ...(accounts as any)?.[0]?.account,
            metadata: {
              ...(accounts as any)?.[0]?.account?.metadata,
              picture,
            },
          },
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
          setIndexer?.("Error Onboarding");

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

  const resumeLensSession = async () => {
    try {
      const resumed = await lensClient?.resumeSession();

      if (resumed?.isOk()) {
        const accounts = await fetchAccountsAvailable(
          {
            managedBy: evmAddress(address!),
          },
          lensClient!
        );

        let picture = "";
        const cadena = await fetch(
          `${STORAGE_NODE}/${
            (accounts as any)?.[0]?.account?.metadata?.picture?.split(
              "lens://"
            )?.[1]
          }`
        );

        if (cadena) {
          const json = await cadena.json();
          picture = json.item;
        }

        setLensConnected?.({
          ...lensConnected,
          profile: {
            ...(accounts as any)?.[0]?.account,
            metadata: {
              ...(accounts as any)?.[0]?.account?.metadata,
              picture,
            },
          },
          sessionClient: resumed?.value,
        });
      }
    } catch (err) {
      console.error("Error al reanudar la sesión:", err);
      return null;
    }
  };

  const logout = async () => {
    setLensLoading(true);
    try {
      const auth = await lensConnected?.sessionClient?.getAuthenticatedUser();

      if (auth?.isOk()) {
        const res = await revoke(
          {
            authenticationId: auth.value?.authentication_id,
          },
          lensConnected?.sessionClient!
        );

        if (res) {
          setLensConnected?.(undefined);
          window.localStorage.removeItem("lens.testnet.credentials");
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setLensLoading(false);
  };

  useEffect(() => {
    if (address && lensClient && !lensConnected?.profile) {
      resumeLensSession();
    }
  }, [address, lensClient]);

  useEffect(() => {
    if (!address && lensConnected?.profile && lensClient) {
      logout();
    }
  }, [address]);

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
    logout,
  };
};

export default useHeader;
