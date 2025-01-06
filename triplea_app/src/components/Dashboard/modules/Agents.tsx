import { FunctionComponent, JSX } from "react";
import { AgentProps, Switcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import useUserAgents from "../hooks/useUserAgents";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";

const Agents: FunctionComponent<AgentProps> = ({
  setSwitcher,
  lensClient,
  setNotification,
  address,
}): JSX.Element => {
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    agentsLoading,
    userAgents,
    handleEditAgent,
    currentAgent,
    setCurrentAgent,
    agentEditLoading,
    agentMetadata,
    setAgentMetadata,
  } = useUserAgents(lensClient, publicClient, address, setNotification);

  switch (currentAgent) {
    case undefined:
      return (
        <div className="relative  w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
          <div className="relative w-full h-full  pixel-border-2 p-3 flex flex-col items-center justify-between gap-6">
            <div className="relative w-full h-fit flex items-start justify-start">
              <div
                className="relative flex w-fit h-fit cursor-pixel hover:opacity-70"
                onClick={() => setSwitcher(Switcher.Home)}
              >
                <svg
                  className="size-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
              </div>
            </div>
            <div className="flex relative w-full h-full items-center justify-start overflow-x-scroll">
            <div
            className={`relative h-full flex flex-row gap-6 ${
              !agentsLoading && userAgents?.length < 1 ? "w-full" : "w-fit"
            }`}
          >
                {agentsLoading ? (
                  Array.from({ length: 10 }).map((_, key) => {
                    return (
                      <div
                        key={key}
                        className="relative w-60 h-full bg-morado pixel-border-4 animate-pulse rounded-xl"
                      ></div>
                    );
                  })
                ) : userAgents?.length < 1 ? (
                  <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
                    No Agents Yet.
                  </div>
                ) : (
                  userAgents?.map((agent, key) => {
                    return (
                      <div
                        key={key}
                        className={`relative w-60 h-96 md:h-full bg-morado rounded-xl pixel-border-4 flex flex-col items-center justify-between p-2 cursor-pixel`}
                        onClick={() => {
                          setCurrentAgent(agent);

                          setAgentMetadata({
                            title: agent?.title,
                            cover: agent?.cover,
                            description: agent?.description,
                            customInstructions: agent?.customInstructions,
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
                          />
                        </div>
                        <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                          <div className="relative w-fit h-fit flex text-lg font-start uppercase">
                            {agent.title}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
          <div className="relative w-full h-full  pixel-border-2 p-3 flex flex-col items-center justify-between gap-6">
            <div className="relative w-full h-fit flex items-start justify-start">
              <div
                className="relative flex w-fit h-fit cursor-pixel hover:opacity-70"
                onClick={() => setCurrentAgent(undefined)}
              >
                <svg
                  className="size-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
              </div>
            </div>
            <div className="relative font-jackey2 w-full h-full flex flex-col md:flex-row gap-6 items-center justify-center">
              <label
                className="relative w-full h-80 md:h-full flex items-center justify-center cursor-pixel"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {agentMetadata.cover ? (
                  <Image
                    src={
                      typeof agentMetadata?.cover == "string"
                        ? `${INFURA_GATEWAY}/ipfs/${
                            agentMetadata?.cover?.split("ipfs://")?.[1]
                          }`
                        : URL.createObjectURL(agentMetadata?.cover)
                    }
                    objectFit="contain"
                    layout="fill"
                    draggable={false}
                  />
                ) : (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-6-8h4v2h-4v4h-2v-4H7v-2h4V7h2v4z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  required
                  id="files"
                  multiple={false}
                  name="pfp"
                  disabled={agentEditLoading}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!e.target.files || e.target.files.length === 0) return;
                    setAgentMetadata({
                      ...agentMetadata,
                      cover: e?.target?.files?.[0],
                    });
                  }}
                />
              </label>
              <div className="relative w-full h-full flex flex-col gap-5 items-start justify-start">
                <div className="relative w-full h-full flex flex-col justify-start items-start gap-5">
                  <input
                    className="relative flex w-full h-10 text-left text-black pixel-border-2 focus:outline-none text-3xl p-1.5"
                    placeholder="Title"
                    onChange={(e) =>
                      setAgentMetadata({
                        ...agentMetadata,
                        title: e.target.value,
                      })
                    }
                    value={agentMetadata.title}
                    disabled={agentEditLoading}
                  />

                  <textarea
                    className="relative flex w-full h-1/2 overflow-y-scroll text-left text-black pixel-border-2 p-1.5 focus:outline-none text-lg"
                    placeholder="Description"
                    onChange={(e) =>
                      setAgentMetadata({
                        ...agentMetadata,
                        description: e.target.value,
                      })
                    }
                    value={agentMetadata.description}
                    disabled={agentEditLoading}
                    style={{
                      resize: "none",
                    }}
                  ></textarea>
                </div>
                <div className="relative w-full h-fit flex items-center justify-center gap-1 flex-col">
                  <div className="h-1 w-full flex bg-black" />
                  <div className="h-1 w-full flex bg-black" />
                </div>
                <div className="relative w-full h-full flex items-start justify-start flex-col gap-2">
                  <div className="relative w-fit h-fit flex items-start justify-start text-gray-600">
                    Custom Instructions
                  </div>
                  <textarea
                    className="relative flex w-full h-full overflow-y-scroll text-left text-black pixel-border-2 p-1.5 focus:outline-none text-lg"
                    placeholder="Custom Instructions"
                    onChange={(e) =>
                      setAgentMetadata({
                        ...agentMetadata,
                        customInstructions: e.target.value,
                      })
                    }
                    value={agentMetadata.customInstructions}
                    disabled={agentEditLoading}
                    style={{
                      resize: "none",
                    }}
                  ></textarea>
                </div>
                <div className="relative w-full h-fit flex items-center justify-center">
                  <div
                    className={`relative w-full md:w-1/2 h-14 font-jackey pixel-border-2 text-black flex items-center justify-center md:text-sm text-center text-xs ${
                      !agentEditLoading ? "cursor-pixel" : "opacity-70"
                    }`}
                    onClick={() => !agentEditLoading && handleEditAgent()}
                  >
                    {agentEditLoading ? (
                      <svg
                        fill="none"
                        className="size-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M13 2h-2v6h2V2zm0 14h-2v6h2v-6zm9-5v2h-6v-2h6zM8 13v-2H2v2h6zm7-6h2v2h-2V7zm4-2h-2v2h2V5zM9 7H7v2h2V7zM5 5h2v2H5V5zm10 12h2v2h2v-2h-2v-2h-2v2zm-8 0v-2h2v2H7v2H5v-2h2z"
                          fill="currentColor"
                        />{" "}
                      </svg>
                    ) : (
                      "Edit Agent"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default Agents;
