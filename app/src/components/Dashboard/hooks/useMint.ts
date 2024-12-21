import { SetStateAction, useEffect, useState } from "react";
import { Agent, MintData } from "../types/dashboard.types";

const useMint = (
  agents: Agent[],
  setAgents: (e: SetStateAction<Agent[]>) => void
) => {
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [mintData, setMintData] = useState<MintData>({
    agentIds: [],
    prices: [],
    tokens: [],
    dropId: 0,
    dropCover: undefined,
    dropTitle: "",
    title: "",
    description: "",
    image: undefined,
    amount: 2,
  });

  const handleMint = async () => {
    if (
      !mintData.image ||
      mintData.prices?.length < 1 ||
      mintData.tokens?.length < 1 ||
      (mintData.dropId === 0 &&
        (!mintData?.dropCover || mintData?.dropTitle?.trim() == ""))
    )
      return;
    setMintLoading(true);
    try {
      setMintData({
        agentIds: [],
        prices: [],
        tokens: [],
        dropId: 0,
        dropCover: undefined,
        dropTitle: "",
        title: "",
        description: "",
        image: undefined,
        amount: 2,
      });
    } catch (err: any) {
      console.error(err.message);
    }
    setMintLoading(false);
  };

  const loadAgents = async () => {
    setAgentsLoading(true);

    try {
    } catch (err: any) {
      console.error(err.message);
    }
    setAgentsLoading(false);
  };

  useEffect(() => {
    if (!agents || agents?.length < 1) {
      loadAgents();
    }
  }, []);

  return {
    mintLoading,
    handleMint,
    mintData,
    setMintData,
    agentsLoading,
  };
};

export default useMint;
