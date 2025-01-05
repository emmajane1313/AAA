import { useEffect, useState } from "react";
import { getDevTreasury } from "../../../../graphql/queries/getDevTreasury";

const useDevTreasury = () => {
  const [treasuryLoading, setTreasuryLoading] = useState<boolean>(false);
  const [treasury, setTreasury] = useState<
    | {
        amount: number;

        token: string;
      }
    | undefined
  >();

  const handleTreasury = async () => {
    setTreasuryLoading(true);
    try {
      const dev = await getDevTreasury();

      setTreasury(dev?.data?.devTreasuryAddeds?.[0]);
    } catch (err: any) {
      console.error(err.message);
    }
    setTreasuryLoading(false);
  };

  useEffect(() => {
    if (!treasury) {
      handleTreasury();
    }
  }, []);

  return {
    treasury,
    treasuryLoading,
  };
};

export default useDevTreasury;
