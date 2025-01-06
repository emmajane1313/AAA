import { FunctionComponent, JSX, useContext } from "react";
import { CreateSwitcher, CreateSwitchProps } from "../types/agents.types";
import { useRouter } from "next/navigation";
import useCreateAgent from "../hooks/useCreateAgent";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { chains } from "@lens-network/sdk/viem";
import Image from "next/legacy/image";
import { AnimationContext } from "@/app/providers";

const CreateSwitch: FunctionComponent<CreateSwitchProps> = ({
  createSwitcher,
  setCreateSwitcher,
  lensConnected,
  setIndexer,
  storageClient,
  setNotifcation,
  lensClient
}): JSX.Element => {
  const router = useRouter();
  const { address } = useAccount();
  const animationContext = useContext(AnimationContext);
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const {
    createAgentLoading,
    handleCreateAgent,
    id,
    agentDetails,
    setAgentDetails,
    agentLensDetails,
    setAgentLensDetails,
    lensLoading,
    handleCreateAccount,
    agentWallet
  } = useCreateAgent(
    publicClient,
    address,
    setCreateSwitcher,
    lensConnected,
    setIndexer,
    storageClient,
    setNotifcation,
    lensClient
  );
  switch (createSwitcher) {
    case CreateSwitcher.Success:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-center font-jacey">
          <div className="relative flex w-fit h-10 text-center text-black font-start uppercase text-3xl">
            Created!
          </div>
          <div className="relative w-full h-fit flex items-center justify-center">
            <div
              className={`relative w-fit px-6 py-1 h-12 bg-black text-white cursor-pixel hover:opacity-70 text-base rounded-md flex items-center justify-center font-jack`}
              onClick={() => {
                animationContext?.setPageChange?.(true);
                router.push(`/agent/${id}`);
              }}
            >
              Go to Agent
            </div>
          </div>
        </div>
      );

    case CreateSwitcher.Create:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-between">
          <div className="relative w-full h-full flex flex-row items-center justify-center gap-4">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-80 h-80 md:h-full flex items-center justify-center">
                {agentDetails.cover && (
                  <Image
                    src={URL.createObjectURL(agentDetails.cover)}
                    objectFit="contain"
                    layout="fill"
                    draggable={false}
                  />
                )}
              </div>
            </div>
            <div className="relative w-full h-full flex flex-col gap-4 items-start justify-start">
              <div className="relative flex w-fit h-10 text-center text-black font-start uppercase text-2xl">
                {agentDetails.title}
              </div>
              <div className="relative flex w-fit h-fit max-h-32 overflow-y-scroll text-left text-black text-base font-jack">
                {agentDetails.description}
              </div>
              <div className="relative flex w-fit h-fit max-h-32 overflow-y-scroll text-left text-black text-base font-jack">
                {agentDetails.customInstructions}
              </div>
            </div>
          </div>
          <div className="relative w-full h-fit flex items-center justify-center">
            <div
              className={`relative w-full sm:w-1/2 h-14 font-jackey pixel-border-2 text-black flex items-center justify-center md:text-base text-sm text-center ${
                !createAgentLoading ? "cursor-pixel" : "opacity-70"
              }`}
              onClick={() => !createAgentLoading && handleCreateAgent()}
            >
              {createAgentLoading ? (
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
                "Create Agent"
              )}
            </div>
          </div>
        </div>
      );

    case CreateSwitcher.Profile:
      return (
        <div className="relative font-jackey2 w-full h-full flex flex-col gap-6 items-center justify-center">
          <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
            Create Agent Lens Account
          </div>
          <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
            <div className="relative items-center justify-center flex w-fit h-fit">
              <label
                className="relative w-20 rounded-full h-20 flex items-center justify-center border border-black cursor-pixel bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {(agentDetails?.cover || agentLensDetails?.pfp) && (
                  <Image
                    src={URL.createObjectURL(
                      agentLensDetails?.pfp
                        ? agentLensDetails?.pfp
                        : agentDetails?.cover!
                    )}
                    objectFit="cover"
                    layout="fill"
                    draggable={false}
                    className="rounded-full"
                  />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  required
                  id="files"
                  multiple={false}
                  name="pfp"
                  disabled={createAgentLoading || lensLoading}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (!e.target.files || e.target.files.length === 0) return;
                    setAgentLensDetails({
                      ...agentLensDetails,
                      pfp: e?.target?.files?.[0],
                    });
                  }}
                />
              </label>
            </div>
            <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3 text-black">
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Username</div>
                <input
                  disabled={createAgentLoading || lensLoading}
                  onChange={(e) =>
                    setAgentLensDetails({
                      ...agentLensDetails,
                      username: e.target.value,
                    })
                  }
                  className="relative w-full bg-white h-8 border border-black focus:outline-none p-1"
                  value={agentLensDetails?.username}
                />
              </div>
              <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
                <div className="relative w-fit h-fit flex">Local Name</div>
                <input
                  disabled={createAgentLoading || lensLoading}
                  onChange={(e) =>
                    setAgentLensDetails({
                      ...agentLensDetails,
                      localname: e.target.value,
                    })
                  }
                  className="relative w-full bg-white h-8 border border-black focus:outline-none p-1"
                  value={
                    agentLensDetails?.localname?.trim() == ""
                      ? agentDetails?.title
                      : agentLensDetails?.localname
                  }
                />
              </div>
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Bio</div>
              <textarea
                disabled={createAgentLoading || lensLoading}
                onChange={(e) =>
                  setAgentLensDetails({
                    ...agentLensDetails,
                    bio: e.target.value,
                  })
                }
                className="relative w-full bg-white h-14 overflow-y-scroll border border-black focus:outline-none p-1"
                value={
                  agentLensDetails?.bio?.trim() == ""
                    ? agentDetails?.description
                    : agentLensDetails.bio
                }
                style={{
                  resize: "none",
                }}
              ></textarea>
            </div>
          </div>
          <div
            className={`relative px-3 py-1 flex items-center justify-center pixel-border-3 text-black w-28 h-8 ${
              !(createAgentLoading || lensLoading) &&
              "cursor-pixel active:scale-95"
            }`}
            onClick={() =>
              !(createAgentLoading || lensLoading) && handleCreateAccount()
            }
          >
            {createAgentLoading || lensLoading ? (
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
              "Create"
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="relative font-jackey2 w-full h-full flex flex-col sm:flex-row gap-6 items-center justify-center">
          <label
            className="relative w-full h-60 sm:h-full flex items-center justify-center cursor-pixel"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {agentDetails.cover ? (
              <Image
                src={URL.createObjectURL(agentDetails.cover)}
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
              disabled={createAgentLoading}
              onChange={(e) => {
                e.stopPropagation();
                if (!e.target.files || e.target.files.length === 0) return;
                setAgentDetails({
                  ...agentDetails,
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
                  setAgentDetails({
                    ...agentDetails,
                    title: e.target.value,
                  })
                }
                value={agentDetails.title}
                disabled={createAgentLoading}
              />
              <textarea
                className="relative flex w-full h-1/2 overflow-y-scroll text-left text-black pixel-border-2 p-1.5 focus:outline-none text-lg"
                placeholder="Description"
                onChange={(e) =>
                  setAgentDetails({
                    ...agentDetails,
                    description: e.target.value,
                  })
                }
                value={agentDetails.description}
                disabled={createAgentLoading}
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
                  setAgentDetails({
                    ...agentDetails,
                    customInstructions: e.target.value,
                  })
                }
                value={agentDetails.customInstructions}
                disabled={createAgentLoading}
                style={{
                  resize: "none",
                }}
              ></textarea>
            </div>
          </div>
        </div>
      );
  }
};

export default CreateSwitch;
