import { FunctionComponent, JSX } from "react";
import { ChooseAgentProps } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const ChooseAgent: FunctionComponent<ChooseAgentProps> = ({
  agents,
  agentsLoading,
  setMintData,
  mintData,
  tokenThresholds,
}): JSX.Element => {
  return (
    <div
      className={`flex relative w-full h-full items-center justify-start ${
        Number(mintData?.amount || 0) <= 2 ||
        Number(mintData?.prices?.[0]) * 10 ** 18 <
          Number(
            tokenThresholds?.find(
              (t) =>
                t?.token?.toLowerCase() == mintData?.tokens?.[0]?.toLowerCase()
            )?.threshold
          )
          ? "overflow-hidden"
          : "overflow-x-scroll"
      }`}
    >
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
                  className={`relative w-60 pixel-border-4 h-96 md:h-full bg-morado rounded-xl flex flex-col items-center justify-between cursor-pixel p-2 ${
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
                      } else if (newMintData.agents?.length < 3) {
                        newMintData.agents = [
                          ...newMintData.agents,
                          {
                            agent: agent,
                            customInstructions: "",
                            dailyFrequency: 1,
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
                      className="relative w-full h-fit flex pt-4 flex-col gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <input
                        className="relative w-full h-10 p-1 bg-white text-sm text-black font-jackey2 focus:outline-none"
                        placeholder="1"
                        type="number"
                        min={1}
                        max={3}
                        step={1}
                        value={
                          mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.dailyFrequency
                        }
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value > 3) {
                            value = 3;
                          }
                          (e.target.value as any) = value;
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
                              dailyFrequency: value,
                            };

                            newMint.agents = newAgents;
                            return newMint;
                          });
                        }}
                      />
                      <textarea
                        className="relative w-full h-40 flex overflow-y-scroll p-1 bg-white text-sm text-black font-jackey2 cursor-text focus:outline-none"
                        placeholder="Add custom instructions for your agent."
                        style={{
                          resize: "none",
                        }}
                        value={
                          mintData?.agents?.find(
                            (ag) => ag?.agent?.id == agent?.id
                          )?.customInstructions
                        }
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
      {(Number(mintData?.amount || 0) <= 2 ||
        Number(mintData?.prices?.[0]) * 10 ** 18 <
          Number(
            tokenThresholds?.find(
              (t) =>
                t?.token?.toLowerCase() == mintData?.tokens?.[0]?.toLowerCase()
            )?.threshold
          )) && (
        <div className="absolute top-0 left-0 flex items-center justify-center bg-white/90 w-full h-full font-jackey2 text-black text-center">
          <div className="relative sm:w-1/2 w-full flex items-center justify-center">
            Set a minimum edition of 3 and a price above the Token Threshold to
            activate Agents for this collection!
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseAgent;
