import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction, useState } from "react";
import { Maybe, ProfilePicture } from "../../../../generated";
import { Account } from "@lens-protocol/client";
import pollResult from "@/lib/helpers/pollResult";
import fetchAccount from "../../../../graphql/lens/queries/account";
import updateAccount from "../../../../graphql/lens/mutations/updateAccount";
import { v4 as uuidv4 } from "uuid";
import { StorageClient } from "@lens-protocol/storage-node-client";

const useAccount = (
  lensConnected: LensConnected | undefined,
  setLensConnected: (e: SetStateAction<LensConnected | undefined>) => void,
  storageClient: StorageClient
) => {
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<{
    localname: string;
    bio: string;
    pfp?: Blob | Maybe<ProfilePicture>;
  }>({
    pfp: lensConnected?.profile?.username?.namespace?.metadata?.picture,
    localname: lensConnected?.profile?.username?.localName || "",
    bio:
      lensConnected?.profile?.username?.namespace?.metadata?.description || "",
  });

  const handleUpdateAccount = async () => {
    if (!lensConnected?.sessionClient) return;
    setAccountLoading(true);
    try {
      let picture = {};

      if (newAccount?.pfp && newAccount.pfp instanceof Blob) {
        const { uri } = await storageClient.uploadAsJson(newAccount?.pfp);

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
