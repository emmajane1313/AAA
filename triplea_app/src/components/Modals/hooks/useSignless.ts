import { LensConnected } from "@/components/Common/types/common.types";
import { SetStateAction, useState } from "react";
import { enableSignless } from "@lens-protocol/client/actions";

const useSignless = (
  lensConnected: LensConnected | undefined,
  setSigner: (e: SetStateAction<boolean>) => void
) => {
  const [signlessLoading, setSignlessLoading] = useState<boolean>(false);

  const handleSignless = async () => {
    if (!lensConnected?.sessionClient) return;
    setSignlessLoading(true);
    try {
      const res = await enableSignless(lensConnected?.sessionClient);

      if (res.isErr()) {
        console.error(res.error);
      } else {
        setSigner?.(false);
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setSignlessLoading(false);
  };

  return {
    signlessLoading,
    handleSignless,
  };
};

export default useSignless;
