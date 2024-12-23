import { LensConnected } from "@/components/Common/types/common.types";
import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useState } from "react";
import { createWalletClient, custom } from "viem";
import { Maybe, ProfilePicture } from "../../../../generated";
import { Account, evmAddress } from "@lens-protocol/client";
import pollResult from "@/lib/helpers/pollResult";
import fetchAccount from "../../../../graphql/lens/queries/account";
import updateAccount from "../../../../graphql/lens/mutations/updateAccount";

const useAccount = (
  address: `0x${string}` | undefined,
  lensConnected: LensConnected | undefined,
  setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void
) => {
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<{
    localname: string;
    bio: string;
    pfp?: Blob | Maybe<ProfilePicture>;
  }>({
    pfp: lensConnected?.profile?.metadata?.picture,
    localname: lensConnected?.profile?.username?.localName || "",
    bio:
      lensConnected?.profile?.username?.namespace?.metadata?.description || "",
  });

  const handleUpdateAccount = async () => {
    if (!lensConnected?.sessionClient) return;
    setAccountLoading(true);
    try {
      const signer = createWalletClient({
        chain: chains.testnet,
        transport: custom(window.ethereum!),
        account: address,
      });

      let picture = {};
      if (newAccount?.pfp) {
        const response = await fetch("/api/ipfs", {
          method: "POST",
          body: newAccount?.pfp,
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
          name: newAccount?.localname,
          bio: newAccount?.bio,
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
      const accountResponse = await updateAccount(
        {
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
              address: evmAddress(signer.account?.address!),
            },
            lensConnected?.sessionClient
          );
          console.log({ result });

          if ((result as any)?.__typename == "Account") {
            setLensConnected?.({
              ...lensConnected,
              profile: result as Account,
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

  return { accountLoading, handleUpdateAccount, newAccount, setNewAccount };
};

export default useAccount;
