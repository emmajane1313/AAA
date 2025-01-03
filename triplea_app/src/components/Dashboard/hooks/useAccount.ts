import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction, useState } from "react";
import pollResult from "@/lib/helpers/pollResult";
import updateAccount from "../../../../graphql/lens/mutations/updateAccount";
import { v4 as uuidv4 } from "uuid";
import { StorageClient } from "@lens-protocol/storage-node-client";
import fetchAccount from "../../../../graphql/lens/queries/account";
import { STORAGE_NODE } from "@/lib/constants";

const useAccount = (
  lensConnected: LensConnected | undefined,
  setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void,
  storageClient: StorageClient,
  setSignless: (e: SetStateAction<boolean>) => void
) => {
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<{
    localname: string;
    bio: string;
    pfp?: Blob | string;
  }>({
    pfp: lensConnected?.profile?.metadata?.picture,
    localname: lensConnected?.profile?.metadata?.name || "",
    bio: lensConnected?.profile?.metadata?.bio || "",
  });

  const handleUpdateAccount = async () => {
    if (!lensConnected?.sessionClient) return;
    setAccountLoading(true);
    try {
      let picture = {};

      if (newAccount?.pfp && newAccount.pfp instanceof Blob) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: newAccount?.pfp,
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
          name: newAccount?.localname,
          bio: newAccount?.bio,
          ...picture,
        },
      });

      const accountResponse = await updateAccount(
        {
          metadataUri: uri,
        },
        lensConnected?.sessionClient
      );

      if ((accountResponse as any)?.hash) {
        if (
          await pollResult(
            (accountResponse as any)?.hash,
            lensConnected?.sessionClient
          )
        ) {
          const result = await fetchAccount(
            {
              address: lensConnected?.profile?.address,
            },
            lensConnected?.sessionClient
          );

          let picture = "";
          const cadena = await fetch(
            `${STORAGE_NODE}/${
              (result as any)?.metadata?.picture?.split("lens://")?.[1]
            }`
          );

          if (cadena) {
            const json = await cadena.json();
            picture = json.item;
          }

          if ((result as any)?.__typename == "Account") {
            setLensConnected?.({
              ...lensConnected,
              profile: {
                ...(result as any),
                metadata: {
                  ...(result as any)?.metadata,
                  picture,
                },
              },
            });
          }
        } else {
          setSignless?.(true);
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
