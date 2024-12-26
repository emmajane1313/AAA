import { SetStateAction, useState } from "react";
import { LensConnected } from "@/components/Common/types/common.types";
import {
  Account,
  AuthenticationTokens,
  evmAddress,
} from "@lens-protocol/client";
import { createWalletClient, custom } from "viem";
import { chains } from "@lens-network/sdk/viem";
import fetchAccount from "./../../../../graphql/lens/queries/account";
import pollResult from "@/lib/helpers/pollResult";
import createAccount from "../../../../graphql/lens/mutations/createAccount";
import switchAccount from "../../../../graphql/lens/mutations/switchAccount";
import { v4 as uuidv4 } from "uuid";

const useCreateAccount = (
  address: `0x${string}` | undefined,
  lensConnected: LensConnected | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined,
  setCreateAccount: (e: SetStateAction<boolean>) => void,
  setError: (e: SetStateAction<string | undefined>) => void
) => {
  const [account, setAccount] = useState<{
    localname: string;
    bio: string;
    username: string;
    pfp?: Blob;
  }>({
    localname: "",
    bio: "",
    username: "",
  });
  const [accountLoading, setAccountLoading] = useState<boolean>(false);

  const handleCreateAccount = async () => {
    if (!address || !lensConnected?.sessionClient) return;
    setAccountLoading(true);
    try {
      const signer = createWalletClient({
        chain: chains.testnet,
        transport: custom(window.ethereum!),
        account: address,
      });

      let picture = {};

      if (account?.pfp) {
        const response = await fetch("/api/ipfs", {
          method: "POST",
          body: account?.pfp,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error from API:", errorText);
          setAccountLoading(false);
          setError?.("Error with IPFS");
          return;
        }

        const responseJSON = await response.json();
        picture = {
          picture: "ipfs://" + responseJSON.cid,
        };
      }

      const accountIPFSResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: JSON.stringify({
          $schema: "https://json-schemas.lens.dev/account/1.0.0.json",
          lens: {
            id: uuidv4(),
            name: account?.localname,
            bio: account?.bio,
            ...picture,
          },
        }),
      });

      if (!accountIPFSResponse.ok) {
        const errorText = await accountIPFSResponse.text();
        console.error("Error from API:", errorText);
        setAccountLoading(false);
        setError?.("Error with IPFS API");
        return;
      }

      const accountResponseJSON = await accountIPFSResponse.json();
      const accountResponse = await createAccount(
        {
          accountManager: [evmAddress(signer.account.address)],
          username: {
            localName: account?.username,
          },
          metadataUri: "lens://" + accountResponseJSON.cid,
        },
        lensConnected?.sessionClient
      );

      if ((accountResponse as any)?.hash) {
        const res = await pollResult(
          (accountResponse as any)?.hash,
          lensConnected?.sessionClient
        );
        if (res) {
          const newAcc = await fetchAccount(
            {
              username: {
                localName: account?.username,
              },
            },
            lensConnected?.sessionClient
          );

          if ((newAcc as any)?.address) {
            const authTokens = await switchAccount(
              {
                account: (newAcc as any)?.address,
              },
              lensConnected?.sessionClient
            );

            if ((authTokens as any)?.accessToken) {
              setLensConnected?.({
                ...lensConnected,
                profile: newAcc as Account,
                authTokens: authTokens as AuthenticationTokens,
              });
              setCreateAccount(false);
              setAccount({
                localname: "",
                bio: "",
                username: "",
              });
            } else {
              console.error(accountResponse);
              setError?.("Error with Auth Tokens");
              setAccountLoading(false);
              return;
            }
          } else {
            console.error(accountResponse);
            setError?.("Error with Fetching New Account");
            setAccountLoading(false);
            return;
          }
        } else {
          console.error(accountResponse);
          setError?.("Error with Account Creation");
          setAccountLoading(false);
          return;
        }
      } else {
        console.error(accountResponse);
        setError?.("Error with Account Creation");
        setAccountLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setAccountLoading(false);
  };

  return {
    account,
    setAccount,
    accountLoading,
    handleCreateAccount,
  };
};

export default useCreateAccount;
