import { SetStateAction, useState } from "react";
import { LensConnected } from "@/components/Common/types/common.types";
import { evmAddress } from "@lens-protocol/client";
import { createWalletClient, custom } from "viem";
import { chains } from "@lens-network/sdk/viem";
import fetchAccount from "./../../../../graphql/lens/queries/account";
import pollResult from "@/lib/helpers/pollResult";
import createAccount from "../../../../graphql/lens/mutations/createAccount";
import { v4 as uuidv4 } from "uuid";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { STORAGE_NODE } from "@/lib/constants";

const useCreateAccount = (
  address: `0x${string}` | undefined,
  lensConnected: LensConnected | undefined,
  setLensConnected:
    | ((e: SetStateAction<LensConnected | undefined>) => void)
    | undefined,
  setCreateAccount: (e: SetStateAction<boolean>) => void,
  setIndexer: (e: SetStateAction<string | undefined>) => void,
  storageClient: StorageClient,
  setNotification: (e: SetStateAction<string | undefined>) => void,
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
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: account?.pfp,
        });
        const json = await res.json();
        const { uri } = await storageClient.uploadAsJson({
          type: "image/png",
          item: "ipfs://" + json?.cid,
        });

        picture = {
          picture: uri,
        };
      }

      const { uri } = await storageClient.uploadAsJson({
        $schema: "https://json-schemas.lens.dev/account/1.0.0.json",
        lens: {
          id: uuidv4(),
          name: account?.localname,
          bio: account?.bio,
          ...picture,
        },
      });

      const accountResponse = await createAccount(
        {
          accountManager: [evmAddress(signer.account.address)],
          username: {
            localName: account?.username,
          },
          metadataUri: uri,
        },
        lensConnected?.sessionClient
      );


      if ((accountResponse as any)?.message?.includes("username already exists")) {
        setNotification("Username Already Taken. Try something else?");
        setAccountLoading(false);
        return;
      }

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
            const ownerSigner =
              await lensConnected?.sessionClient?.switchAccount({
                account: (newAcc as any)?.address,
              });

            if (ownerSigner?.isOk()) {
              let picture = "";
              const cadena = await fetch(
                `${STORAGE_NODE}/${
                  (newAcc as any)?.metadata?.picture?.split("lens://")?.[1]
                }`
              );

              if (cadena) {
                const json = await cadena.json();
                picture = json.item;
              }

              setLensConnected?.({
                ...lensConnected,
                profile: {
                  ...(newAcc as any),
                  metadata: {
                    ...(newAcc as any)?.metadata,
                    picture,
                  },
                },
                sessionClient: ownerSigner?.value,
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
            setIndexer?.("Error with Fetching New Account");
            setAccountLoading(false);
            return;
          }
        } else {
          console.error(accountResponse);
          setIndexer?.("Error with Account Creation");
          setAccountLoading(false);
          return;
        }
      } else {
        console.error(accountResponse);
        setIndexer?.("Error with Account Creation");
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
