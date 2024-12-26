import { chains } from "@lens-network/sdk/viem";
import {
  AccountManagersQuery,
  Context,
  evmAddress,
  PublicClient,
  UpdateAccountManagerMutation,
} from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { LensConnected, NFTData } from "../types/common.types";
import fetchAccountsAvailable from "../../../../graphql/lens/queries/availableAccounts";
import { getCollectionSearch } from "../../../../graphql/queries/getCollectionSearch";
import { INFURA_GATEWAY } from "@/lib/constants";
import revoke from "../../../../graphql/lens/mutations/revoke";
import { enableSignless } from "@lens-protocol/client/actions";
import { ethers } from "ethers";
const useHeader = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient<Context> | undefined,
  setError: ((e: SetStateAction<string | undefined>) => void) | undefined,
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
          includeOwned: true,
        },
        lensClient
      );
      console.log({ accounts });
      console.log((accounts as any)?.[0]?.account?.address);
      if ((accounts as any)?.[0]?.account?.address) {
        const authenticated = await lensClient.login({
          accountOwner: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            account: evmAddress((accounts as any)?.[0]?.account?.address),
            owner: signer.account.address?.toLowerCase(),
            // manager: evmAddress(signer.account.address),
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

  const handleSignless = async () => {
    try {
      const result = await fetchAccountsAvailable(
        {
          managedBy: evmAddress(address!),
        },
        lensClient!
      );

      const switchAcc = await lensConnected?.sessionClient?.switchAccount({
        account: lensConnected?.profile?.address,
      });
      if (switchAcc?.isOk()) {
        setLensConnected?.({
          ...lensConnected,
          sessionClient: switchAcc?.value,
        });

        const signer = createWalletClient({
          chain: chains.testnet,
          transport: custom(window.ethereum!),
          account: address,
        });

        // console.log({ switchAcc });
        console.log({
          manager: await lensConnected?.sessionClient?.getAuthenticatedUser(),
        });

   
        // const mut = await lensConnected?.sessionClient?.mutation(
        //   UpdateAccountManagerMutation,
        //   {
        //     request: {
        //       permissions: {
        //         canSetMetadataUri: true,
        //         canTransferNative: true,
        //         canTransferTokens: true,
        //         canExecuteTransactions: true,
        //       },
        //       manager: evmAddress(signer.account?.address!),
        //     },
        //   }
        // );

        // if (mut?.isOk()) {
        //   console.log(mut.value);
        //   const provider = new ethers.BrowserProvider(window.ethereum);

        //   const signer = await provider.getSigner();

        //   const tx = {
        //     chainId: mut.value?.raw?.chainId,
        //     from: mut.value?.raw?.from,
        //     to: mut.value?.raw?.to,
        //     nonce: mut.value?.raw?.nonce,
        //     gasLimit: mut.value?.raw?.gasLimit,
        //     maxFeePerGas: mut.value?.raw?.maxFeePerGas,
        //     maxPriorityFeePerGas: mut.value?.raw?.maxPriorityFeePerGas,
        //     value: mut.value?.raw?.value,
        //     // type: mut.value?.raw?.type,
        //     data: mut.value?.raw?.data,
        //   };
        //   const txResponse = await signer.sendTransaction(tx);
        //   const receipt = await txResponse.wait();
        //   console.log("Transaction confirmed:", receipt);
        //   // const signedTx = await signer.signTransaction(tx);
        //   // const txResponse = await signer.sendTransaction(signedTx);
        //   // console.log("Transaction sent:", txResponse);
        // }
      }
    } catch (err: any) {
      console.error(err.message);
    }
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

        setLensConnected?.({
          ...lensConnected,
          profile: (accounts as any)?.[0]?.account,
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
    handleSignless,
  };
};

export default useHeader;
