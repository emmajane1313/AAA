import { FunctionComponent, JSX, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { AnimationContext, ModalContext } from "@/app/providers";
import useAgentGallery from "../hooks/useAgentGallery";
import { Agent } from "@/components/Dashboard/types/dashboard.types";

const AgentGallery: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
  const { agentGalleryLoading, handleMoreAgents, hasMore } = useAgentGallery(
    context?.agents,
    context?.setAgents!,
    context?.lensClient
  );
  const router = useRouter();

  return (
    <div id="scroll" className="relative w-full h-full overflow-scroll pt-4">
      <div className="relative w-fit h-full">
        <InfiniteScroll
          key={"agentGallery"}
          dataLength={context?.agents?.length || 1}
          next={handleMoreAgents}
          hasMore={hasMore}
          loader={<div key={0} />}
          scrollableTarget="scroll"
          className="grid grid-cols-6 gap-7 w-max h-fit pb-10"
        >
          {(agentGalleryLoading || Number(context?.agents?.length) < 1
            ? [...(context?.agents || []), ...Array.from({ length: 20 })]
            : context?.agents || []
          ).map((agent: Agent | unknown, indice: number) =>
            (agent as any)?.id !== undefined &&
            Number((agent as any)?.id) > 0 ? (
              <div
                key={`agent-${(agent as Agent).id}`}
                className={`w-fit h-fit flex relative flex-col gap-3`}
              >
                <div className="w-96 h-96 bg-white flex p-4 relative pixel-border-2 gap-2">
                  <div className="relative w-full h-full flex bg-mochi pixel-border-3 rounded-lg">
                    <div className="relative w-full h-full  rounded-sm bg-mochi p-2">
                      <div
                        className="relative w-full h-full flex bg-mochi cursor-pixel"
                        onClick={() => {
                          animationContext?.setPageChange?.(true);
                          router.push(`/agent/${(agent as Agent)?.id}`);
                        }}
                      >
                        <Image
                          src={`${INFURA_GATEWAY}/ipfs/${
                            (agent as Agent)?.cover?.includes("ipfs")
                              ? (agent as Agent)?.cover?.split("ipfs://")?.[1]
                              : (agent as Agent)?.cover
                          }`}
                          alt={"NFT " + (agent as Agent).id}
                          className="w-full h-full flex relative"
                          layout="fill"
                          objectFit="contain"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-fit flex text-left font-start text-base">
                  {(agent as Agent)?.title}
                </div>
                <div className="relative h-1 w-full flex bg-black"></div>
                <div className="relative w-full h-fit flex justify-between flex-row gap-2 font-jackey2">
                  <div className="relative w-fit h-fit flex flex-row gap-2">
                    <svg
                      className="size-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path d="M13 2h-2v4h2V2Zm2 6H9v2H7v4h2v4h6v-4h2v-4h-2V8Zm0 2v4h-2v2h-2v-2H9v-4h6ZM9 20h6v2H9v-2Zm14-9v2h-4v-2h4ZM5 13v-2H1v2h4Zm12-7h2v2h-2V6Zm2 0h2V4h-2v2ZM5 6h2v2H5V6Zm0 0V4H3v2h2Z" />{" "}
                    </svg>
                  </div>
                  <div className="relative w-fit h-fit flex items-center justify-center text-black">
                    Activity --{" "}
                    {Number((agent as Agent)?.activeCollectionIds?.length) || 0}
                  </div>
                </div>
                <div className="relative w-full justify-end h-fit flex">
                  <div
                    className="relative flex w-fit h-fit pixel-border-2 font-start text-xxs text-black py-2 px-3 cursor-pixel"
                    onClick={() => {
                      animationContext?.setPageChange?.(true);
                      router.push(`/agent/${(agent as Agent)?.id}`);
                    }}
                  >
                    See More?
                  </div>
                </div>
              </div>
            ) : (
              <div className={`w-fit h-fit flex relative`}>
                <div
                  key={`placeholder-${indice}`}
                  className={`w-96 h-96 bg-white flex p-4 relative pixel-border-2 animate-pulse`}
                >
                  <div className="relative w-full h-full flex bg-mochi pixel-border-3 rounded-lg">
                    <div className="relative w-full h-full bg-mochi p-2 rounded-sm"></div>
                  </div>
                </div>
              </div>
            )
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default AgentGallery;
