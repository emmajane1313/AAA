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
                  className="relative w-60 pixel-border-4 h-full bg-morado rounded-xl animate-pulse"
                ></div>
              );
            })
          : agents?.map((agent, key) => {
              return (
                <div
                  key={key}
                  className={`relative w-60 pixel-border-4 h-full bg-morado rounded-xl flex flex-col items-center justify-between cursor-pixel p-2 ${
                    mintData.agents
                      ?.map((ag) => ag?.agent?.id)
                      .includes(agent?.id) && "border border-black opacity-70"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMintData((prev) => {
                      const newMintData = {
                        ...prev,
                      };

                      if (
                        newMintData.agents
                          ?.map((ag) => ag?.agent?.id)
                          .includes(agent?.id)
                      ) {
                        newMintData.agents = newMintData.agents?.filter(
                          (ag) => ag?.agent?.id !== agent.id
                        );
                      } else {
                        newMintData.agents = [
                          ...newMintData.agents,
                          {
                            agent: agent,
                            customInstructions: "",
                          },
                        ];
                      }

                      return newMintData;
                    });
                  }}
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
                  <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                    <div className="relative w-fit h-fit flex text-lg font-start uppercase">
                      {agent.title}
                    </div>
                    <div
                      className={`relative w-fit overflow-y-scroll font-jackey2 h-fit flex text-sm ${
                        mintData.agents
                          ?.map((ag) => ag?.agent?.id)
                          .includes(agent?.id)
                          ? "max-h-20"
                          : "max-h-40"
                      }`}
                    >
                      {agent.description}
                    </div>
                  </div>
                  {mintData.agents
                    ?.map((ag) => ag?.agent?.id)
                    .includes(agent?.id) && (
                    <div
                      className="relative w-full h-fit flex pt-4"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <textarea
                        className="relative w-full h-40 flex overflow-y-scroll p-1 bg-white text-sm text-black font-jackey2 cursor-text focus:outline-none"
                        placeholder="Add custom instructions for your agent."
                        style={{
                          resize: "none",
                        }}
                        value={agent?.customInstructions}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMintData((prev) => {
                            const newMint = { ...prev };

                            let newAgents = [...newMint?.agents];
                            const newIndex = newAgents?.findIndex(
                              (ag) => ag?.agent?.id == agent?.id
                            );

                            newAgents[newIndex] = {
                              ...newAgents[newIndex],
                              customInstructions: e.target.value,
                            };

                            newMint.agents = newAgents;
                            return newMint;
                          });
                        }}
                      ></textarea>
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default ChooseAgent;
