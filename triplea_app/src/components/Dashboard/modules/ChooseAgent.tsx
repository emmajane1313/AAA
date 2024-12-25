import { FunctionComponent, JSX } from "react";
import { ChooseAgentProps } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const ChooseAgent: FunctionComponent<ChooseAgentProps> = ({
  agents,
  agentsLoading,
  setMintData,
  mintData,
}): JSX.Element => {
  return (
    <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
      <div className="relative w-fit h-full flex flex-row gap-6">
        {agentsLoading || agents?.length < 1
          ? Array.from({ length: 10 }).map((_, key) => {
              return (
                <div
                  key={key}
                  className="relative w-60 h-full bg-morado rounded-md animate-pulse"
                ></div>
              );
            })
          : agents?.map((agent, key) => {
              return (
                <div
                  key={key}
                  className={`relative w-60 h-full bg-morado rounded-md flex flex-col items-center justify-between cursor-pointer p-2 ${
                    mintData.agentIds.includes(agent.id) &&
                    "border border-black opacity-70"
                  }`}
                  onClick={() =>
                    setMintData((prev) => {
                      const newMintData = {
                        ...prev,
                      };

                      if (newMintData.agentIds.includes(agent.id)) {
                        newMintData.agentIds = newMintData.agentIds?.filter(
                          (ag) => ag !== agent.id
                        );
                      } else {
                        newMintData.agentIds = [
                          ...newMintData.agentIds,
                          agent.id,
                        ];
                      }

                      return newMintData;
                    })
                  }
                >
                  <div className="relative w-full h-full rounded-md flex">
                    <Image
                      objectFit="contain"
                      layout="fill"
                      draggable={false}
                      alt={agent?.title}
                      src={`${INFURA_GATEWAY}/ipfs/${
                        agent?.cover?.includes("ipfs")
                          ? agent?.cover?.split("ipfs://")?.[1]
                          : agent?.cover
                      }`}
                      className="rounded-md"
                    />
                  </div>
                  <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3">
                    <div className="relative w-fit h-fit flex text-lg">
                      {agent.title}
                    </div>
                    <div className="relative w-fit overflow-y-scroll max-h-40 h-fit flex text-sm">
                      {agent.description}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ChooseAgent;
