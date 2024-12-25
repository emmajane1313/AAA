import { FunctionComponent, JSX } from "react";
import { AgentProps, Switcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import useAgents from "../hooks/useAgents";

const Agents: FunctionComponent<AgentProps> = ({
  setSwitcher,
  agents,
  setAgents,
  lensConnected,
}): JSX.Element => {
  const { agentsLoading } = useAgents(
    agents,
    setAgents,
    lensConnected?.sessionClient!
  );
  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-start px-20 pb-20 py-10 justify-start">
      <div className="relative w-full h-full bg-gray-200 p-3 shadow-lg rounded-md flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-pointer hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
        </div>
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
                      className={`relative w-60 h-full bg-morado rounded-md flex flex-col items-center justify-between p-2`}
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
      </div>
    </div>
  );
};

export default Agents;
