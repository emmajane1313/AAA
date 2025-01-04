import { FunctionComponent, JSX, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useGallery from "../hooks/useGallery";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import { NFTData } from "../types/common.types";
import { useRouter } from "next/navigation";
import { AnimationContext, ModalContext } from "@/app/providers";

const Gallery: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
  const { handleMoreGallery, nfts, hasMore, galleryLoading } = useGallery(
    context?.lensClient!
  );
  const router = useRouter();
  return (
    <div id="scroll"  className="relative w-full h-full overflow-scroll pt-4">
      <div className="relative w-fit h-full">
        <InfiniteScroll
          key={"gallery"}
          dataLength={nfts?.length}
          next={handleMoreGallery}
          hasMore={hasMore}
          loader={<div key={0} />}
          scrollableTarget="scroll"
          className="grid grid-cols-6 gap-10 w-max h-fit pb-10"
        >
          {(galleryLoading || Number(nfts?.length) < 1
            ? [...nfts, ...Array.from({ length: 20 })]
            : nfts
          ).map((nft: NFTData | unknown, indice: number) =>
            (nft as any)?.id !== undefined && Number((nft as any)?.id) > 0 ? (
              <div
                key={`nft-${(nft as NFTData).id}`}
                className={`w-fit h-fit flex relative flex-col gap-3`}
              >
                <div className="w-96 h-96 bg-white flex p-4 relative pixel-border-2 gap-2">
                  <div className="relative w-full h-full flex bg-mochi pixel-border-3 rounded-lg">
                    <div className="relative w-full h-full rounded-sm bg-mochi p-2">
                      <div
                        className="relative w-full h-full flex bg-mochi cursor-pixel"
                        onClick={() => {
                          animationContext?.setPageChange?.(true);
                          router.push(
                            `/nft/${
                              (nft as NFTData)?.profile?.username?.value?.split(
                                "lens/"
                              )?.[1]
                            }/${(nft as NFTData)?.id}`
                          );
                        }}
                      >
                        <Image
                          src={`${INFURA_GATEWAY}/ipfs/${
                            (nft as NFTData).image?.split("ipfs://")?.[1]
                          }`}
                          alt={"NFT " + (nft as NFTData).id}
                          className="w-full h-full flex relative"
                          layout="fill"
                          objectFit="cover"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative w-full h-fit flex text-left font-start text-base">
                  {(nft as NFTData)?.title?.length > 15 ?(nft as NFTData)?.title?.slice(0,12) + "..." : (nft as NFTData)?.title }
                </div>
                <div className="relative h-1 w-full flex bg-black"></div>
                <div className="relative w-full h-fit flex justify-between flex-row gap-2 font-jackey2">
                  <div className="relative w-fit h-fit flex flex-row gap-2">
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-6"
                    >
                      <path
                        d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z"
                        fill="currentColor"
                      />
                    </svg>
                    <div className="relative w-fit h-fit flex items-center justify-center text-black">
                      {Number((nft as NFTData)?.prices?.[0]) / 10 ** 18}{" "}
                      {
                        TOKENS?.find(
                          (tok) =>
                            (nft as NFTData)?.tokens?.[0]?.toLowerCase() ==
                            tok.contract?.toLowerCase()
                        )?.symbol
                      }
                    </div>
                  </div>
                  <div className="relative text-sm text-black flex">
                    {(nft as NFTData)?.amountSold || 0} /{" "}
                    {(nft as NFTData)?.amount}
                  </div>
                </div>
                <div className="relative w-full justify-end h-fit flex">
                  <div
                    className="relative flex w-fit h-fit pixel-border-2 font-start text-xxs text-black py-2 px-3 cursor-pixel"
                    onClick={() => {
                      animationContext?.setPageChange?.(true);
                      router.push(
                        `/nft/${
                          (nft as NFTData)?.profile?.username?.value?.split(
                            "lens/"
                          )?.[1]
                        }/${(nft as NFTData)?.id}`
                      );
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

export default Gallery;
