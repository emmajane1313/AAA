"use client";

import { AnimationContext, ModalContext } from "@/app/providers";
import { NFTData } from "@/components/Common/types/common.types";
import {
  Agent,
  DropInterface,
} from "@/components/Dashboard/types/dashboard.types";
import useUser from "@/components/User/hooks/useUser";
import UserInfo from "@/components/User/modules/UserInfo";
import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function User() {
  const id = useParams();
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  const context = useContext(ModalContext);
  const {
    screen,
    setScreen,
    userInfo,
    drops,
    collected,
    agents,
    itemsLoading,
    hasMore,
    handleMoreItems,
  } = useUser(id?.id as string, context?.lensClient!);

  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
      <UserInfo userInfo={userInfo} />
      <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
        <div className="relative w-full h-fit flex items-center justify-center gap-1 flex-col">
          <div className="h-1 w-full flex bg-black" />
          <div className="h-1 w-full flex bg-black" />
        </div>
        <div className="relative w-full h-fit flex flex-row justify-between items-center">
          <div
            className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
            onClick={() => setScreen(screen > 0 ? screen - 1 : 2)}
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
          <div className="text-black font-start text-sm relative flex w-fit h-fit text-center text-black">
            {screen < 1 ? "Drops" : screen == 1 ? "Collected" : "Agents"}
          </div>
          <div
            className="relative w-fit h-fit flex items-center justiy-center cursor-pixel"
            onClick={() => setScreen(screen < 2 ? screen + 1 : 0)}
          >
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-6"
            >
              {" "}
              <path
                d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
        </div>
      </div>

      <div className="flex relative w-full h-full items-start justify-start overflow-y-scroll">
        <div className="relative w-full h-full flex flex-wrap gap-6 items-start justify-start">
          {itemsLoading ? (
            Array.from({ length: 10 }).map((_, key) => {
              return (
                <div
                  key={key}
                  className="relative w-60 h-80 bg-morado pixel-border-4 animate-pulse rounded-xl"
                ></div>
              );
            })
          ) : (screen < 1 ? drops : screen == 1 ? collected : agents)?.length <
            1 ? (
            <div className="relative w-full h-full flex items-center justify-center text-sm text-gray-600 font-jack">
              {`No ${
                screen < 1 ? "Drops" : screen == 1 ? "Collects" : "Agents"
              } yet.`}
            </div>
          ) : (
            (screen < 1 ? drops : screen == 1 ? collected : agents)?.map(
              (item, key) => {
                return (
                  <InfiniteScroll
                    dataLength={
                      (screen < 1 ? drops : screen == 1 ? collected : agents)
                        ?.length || 1
                    }
                    next={handleMoreItems}
                    hasMore={
                      screen < 1
                        ? hasMore?.drops
                        : screen == 1
                        ? hasMore?.collected
                        : hasMore?.agents
                    }
                    loader={<div key={0} />}
                    className="relative w-full pb-10"
                  >
                    {screen > 1 ? (
                      <div
                        key={key}
                        className={`relative w-60 h-80 rounded-xl pixel-border-4 flex flex-col items-center justify-between p-2 cursor-pixel`}
                        onClick={() => {
                          animationContext?.setPageChange?.(true);
                          router.push(`/agent/${(item as any)?.AAAAgents_id}`);
                        }}
                      >
                        <div className="relative w-full h-full rounded-md flex">
                          <Image
                            objectFit="contain"
                            layout="fill"
                            draggable={false}
                            alt={item?.title}
                            src={`${INFURA_GATEWAY}/ipfs/${
                              (item as any).metadata?.cover?.includes("ipfs")
                                ? (item as any).metadata?.cover?.split(
                                    "ipfs://"
                                  )?.[1]
                                : (item as any).metadata?.cover
                            }`}
                          />
                        </div>
                        <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                          <div className="relative w-fit h-fit flex text-lg font-start uppercase">
                            {(item as any).metadata?.title}
                          </div>
                        </div>
                      </div>
                    ) : screen == 1 ? (
                      <div
                        key={key}
                        className={`relative w-60 h-80 rounded-xl pixel-border-4 flex flex-col items-center justify-between p-2 cursor-pixel`}
                        onClick={() => {
                          animationContext?.setPageChange?.(true);
                          router.push(
                            `/nft/${userInfo?.username?.localName}/${
                              (item as any)?.collection?.id
                            }`
                          );
                        }}
                      >
                        <div className="relative w-full h-full rounded-md flex">
                          <Image
                            objectFit="cover"
                            layout="fill"
                            draggable={false}
                            className="rounded-md"
                            alt={(item as any)?.collection?.metadata?.title}
                            src={`${INFURA_GATEWAY}/ipfs/${
                              (
                                item as any
                              )?.collection?.metadata?.image?.includes(
                                "ipfs://"
                              )
                                ? (
                                    item as any
                                  )?.collection?.metadata?.image?.split(
                                    "ipfs://"
                                  )?.[1]
                                : (item as any)?.collection?.metadata?.image
                            }`}
                          />
                        </div>
                        <div className="relative w-full h-fit flex flex-row items-start justify-between gap-3 pt-4">
                          <div className="relative w-fit h-fit flex text-sm font-start uppercase">
                            {(item as any)?.collection?.metadata?.title}
                          </div>
                          <div className="relative w-fit h-fit flex text-sm font-start uppercase">
                            x {Number((item as any)?.amount || 0)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={key}
                        className={`relative w-60 h-80 rounded-xl pixel-border-4 flex flex-col items-center justify-between p-2`}
                      >
                        <div className="relative w-full h-full rounded-md flex">
                          <Image
                            objectFit="cover"
                            layout="fill"
                            className="rounded-md"
                            draggable={false}
                            alt={item?.title}
                            src={`${INFURA_GATEWAY}/ipfs/${
                              (item as any)?.metadata?.cover?.includes(
                                "ipfs://"
                              )
                                ? (item as any)?.metadata?.cover?.split(
                                    "ipfs://"
                                  )?.[1]
                                : (item as any)?.metadata?.cover
                            }`}
                          />
                        </div>
                        <div className="relative w-full h-fit flex flex-col items-start justify-start gap-3 pt-4">
                          <div className="relative w-fit h-fit flex text-lg font-start uppercase">
                            {(item as any)?.metadata?.title?.length > 12
                              ? (item as any)?.metadata?.title?.slice(0, 9) +
                                "..."
                              : (item as any)?.metadata?.title}
                          </div>
                        </div>
                        <div className="relative w-full h-full overflow-y-scroll flex items-start justify-between flex-wrap gap-2">
                          {(item as DropInterface)?.collections?.map(
                            (col, index) => {
                              return (
                                <div
                                  key={index}
                                  className="relative w-fit h-fit flex rounded-md items-center justify-center cursor-pixel"
                                  onClick={() => {
                                    animationContext?.setPageChange?.(true);
                                    router.push(
                                      `/nft/${userInfo?.username?.localName}/${
                                        (col as any)?.collectionId
                                      }`
                                    );
                                  }}
                                  title={(col as any)?.metadata?.title}
                                >
                                  <div className="relative w-14 h-14 flex rounded-md items-center justify-center border border-morado">
                                    <Image
                                      objectFit="cover"
                                      layout="fill"
                                      className="rounded-md"
                                      draggable={false}
                                      alt={(col as any)?.metadata?.title}
                                      src={`${INFURA_GATEWAY}/ipfs/${
                                        (col as any)?.metadata?.image?.includes(
                                          "ipfs://"
                                        )
                                          ? (
                                              col as any
                                            )?.metadata?.image?.split(
                                              "ipfs://"
                                            )?.[1]
                                          : (col as any)?.metadata?.image
                                      }`}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </InfiniteScroll>
                );
              }
            )
          )}
        </div>
      </div>
    </div>
  );
}
