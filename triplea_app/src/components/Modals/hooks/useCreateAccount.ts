import { SetStateAction, useState } from "react";
import { createAccountWithUsername } from "@lens-protocol/client/actions";
import { LensConnected } from "@/components/Common/types/common.types";
import { Account, evmAddress } from "@lens-protocol/client";
import { createWalletClient, custom } from "viem";
import { chains } from "@lens-network/sdk/viem";
import fetchAccount from "./../../../../graphql/lens/queries/account";
import pollResult from "@/lib/helpers/pollResult";
import createAccount from "../../../../graphql/lens/mutations/createAccount";

const useCreateAccount = (
  address: `0x${string}` | undefined,
  lensConnected: LensConnected | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined,
  setCreateAccount: (e: SetStateAction<boolean>) => void
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
          name: account?.localname,
          bio: account?.bio,
          ...picture,
        }),
      });

      if (!accountIPFSResponse.ok) {
        const errorText = await accountIPFSResponse.text();
        console.error("Error from API:", errorText);
        setAccountLoading(false);
        return;
      }

      const accountResponseJSON = await accountIPFSResponse.json();
      const accountResponse = await createAccount(
        {
          accountManager: [evmAddress(signer.account.address)],
          username: {
            localName: account?.username,
          },
          metadataUri: "ipfs://" + accountResponseJSON.cid,
        },
        lensConnected?.sessionClient
      );

      console.log(accountResponse);

      if ((accountResponse as any)?.hash) {
        if (
          await pollResult(
            (accountResponse as any)?.hash,
            lensConnected?.sessionClient
          )
        ) {
          const result = await fetchAccount(
            {
              address: evmAddress(signer.account.address),
            },
            lensConnected?.sessionClient
          );
          console.log({ result });

          if ((result as any)?.__typename == "Account") {
            setLensConnected?.({
              ...lensConnected,
              profile: result as Account,
            });
            setCreateAccount(false);
            setAccount({
              localname: "",
              bio: "",
              username: "",
            });
          }
        } else {
          console.error(accountResponse);
          setAccountLoading(false);
          return;
        }
      } else {
        console.error(accountResponse);
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
