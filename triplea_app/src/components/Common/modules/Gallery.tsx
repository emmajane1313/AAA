import { FunctionComponent, JSX, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import useGallery from "../hooks/useGallery";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";
import { NFTData } from "../types/common.types";
import { useRouter } from "next/navigation";
import { ModalContext } from "@/app/providers";

const Gallery: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const { handleMoreGallery, nfts, getRandomSize, hasMore, galleryLoading } =
    useGallery(context?.lensClient!);
  const router = useRouter();
  return (
    <div className="relative w-full h-full overflow-y-scroll pb-10">
      <InfiniteScroll
        dataLength={nfts.length}
        next={handleMoreGallery}
        hasMore={hasMore}
        loader={<></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {(galleryLoading
            ? [...nfts, ...Array.from({ length: 20 })]
            : nfts
          ).map((nft: NFTData | unknown, indice: number) =>
            (nft as any)?.id !== undefined ? (
              <div
                key={(nft as NFTData).id}
                className={`${getRandomSize()} bg-gray-200 flex relative cursor-pointer rounded-md shadow-sm border border-ligero`}
                onClick={() =>
                  router.push(
                    `/nft/${(nft as NFTData)?.profile?.username?.value}/${
                      (nft as NFTData)?.profile?.username?.value
                    }/${(nft as NFTData)?.id}`
                  )
                }
              >
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/${(nft as NFTData).image}`}
                  alt={"NFT " + (nft as NFTData).id}
                  className="w-full h-full flex relative"
                  layout="fill"
                  objectFit="cover"
                  draggable={false}
                />
              </div>
            ) : (
              <div
                key={indice}
                className={`${getRandomSize()} bg-gray-200 flex relative animate-pulse rounded-md shadow-sm border border-ligero`}
              ></div>
            )
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Gallery;
