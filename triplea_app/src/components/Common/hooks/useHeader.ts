import { chains } from "@lens-network/sdk/viem";
import { Context, evmAddress, PublicClient } from "@lens-protocol/client";
import { SetStateAction, useState } from "react";
import { createWalletClient, custom } from "viem";
import { LensConnected } from "../types/common.types";
import fetchAccount from "../../../../graphql/lens/queries/account";
import challenge from "../../../../graphql/lens/mutations/challenge";
import pollResult from "@/lib/helpers/pollResult";

const useHeader = (
  address: `0x${string}` | undefined,
  lensClient: PublicClient<Context> | undefined,
  setCreateAccount: ((e: SetStateAction<boolean>) => void) | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined
) => {
  const [openAccount, setOpenAccount] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [lensLoading, setLensLoading] = useState<boolean>(false);

  const handleSearch = async (target: string) => {
    setSearchLoading(true);
    try {
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

      const account = await fetchAccount(
        {
          address: evmAddress(signer.account.address),
        },
        lensClient
      );

      console.log({account})

      if (!(account as any)?.username) {
        const authenticatedOnboarding = await lensClient.login({
          onboardingUser: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            wallet: signer.account.address,
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticatedOnboarding.isErr()) {
          console.error(authenticatedOnboarding.error);

          setLensLoading(false);
          return;
        }

        const sessionClient = authenticatedOnboarding.value;

        setLensConnected?.({
          sessionClient,
        });

        setCreateAccount?.(true);
      } else {
        const authenticated = await lensClient.login({
          accountOwner: {
            app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
            account: evmAddress(signer.account.address),
            owner: evmAddress(signer.account.address),
          },
          signMessage: (message) => signer.signMessage({ message }),
        });

        if (authenticated.isErr()) {
          console.error(authenticated.error);
          setLensLoading(false);
          return;
        }

        const sessionClient = authenticated.value;

        const result = await fetchAccount(
          {
            address: evmAddress(signer.account.address),
          },
          sessionClient
        );

        if ((result as any)?.__typename !== "Account") {
          console.error(result);

          setLensConnected?.({
            sessionClient,
          });
        } else {
          setLensConnected?.({
            sessionClient,
            profile: result,
          });
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }

    setLensLoading(false);
  };

  return {
    openAccount,
    setOpenAccount,
    handleSearch,
    searchLoading,
    handleLensConnect,
    lensLoading,
  };
};

export default useHeader;
