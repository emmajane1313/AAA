"use client";

import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { useRouter } from "next/navigation";
import { FunctionComponent, JSX, useContext } from "react";
import useHeader from "../hooks/useHeader";
import { useAccount } from "wagmi";
import { AnimationContext, ModalContext } from "@/app/providers";
import useAgents from "@/components/Common/hooks/useAgents";
import { NFTData } from "../types/common.types";
import { Account } from "@lens-protocol/client";
import { useModal } from "connectkit";

const Header: FunctionComponent = (): JSX.Element => {
  const router = useRouter();
  const { open, openProfile, openSwitchNetworks, openOnboarding } = useModal();
  const animationContext = useContext(AnimationContext);
  const { isConnected, address, chainId } = useAccount();
  const context = useContext(ModalContext);
  const {
    openAccount,
    setOpenAccount,
    searchItems,
    searchLoading,
    handleLensConnect,
    lensLoading,
    search,
    setSearch,
    handleSearch,
    setSearchItems,
    logout,
  } = useHeader(
    address,
    context?.lensClient,
    context?.setIndexer,
    context?.setCreateAccount,
    context?.setLensConnected,
    context?.lensConnected
  );

  const { agentsLoading } = useAgents(
    context?.agents!,
    context?.setAgents!,
    context?.lensClient!,
    context?.tokenThresholds!,
    context?.setTokenThresholds!
  );

  return (
    <div className="relative w-full h-fit sm:h-16 flex flex-col gap-4 sm:flex-row justify-between items-center z-50">
      <div
        className="relative flex items-center justify-center w-fit h-fit cursor-pixel"
        onClick={() => {
          animationContext?.setPageChange?.(true);
          router.push("/");
        }}
      >
        <div className="w-fit h-fit text-xl font-jackey text-black flex relative">
          Triple A
        </div>
      </div>
      <div className="relative flex flex-row gap-2 items-center justify-center w-full sm:w-fit h-fit">
        <label className="relative w-full sm:w-60 h-10 rounded-xl flex pixel-border-3 px-1.5 py-1 flex-row gap-2 items-center justify-between">
          {searchLoading ? (
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
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-6"
            >
              <path
                d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z"
                fill="currentColor"
              />
            </svg>
          )}
          <input
            className="relative flex w-full h-full text-left text-black font-jack focus:outline-none"
            placeholder="Search"
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                handleSearch();
              }
            }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              if (e.target.value?.trim() == "") {
                setSearchItems({
                  nfts: [],
                  handles: [],
                });
              }
            }}
          />
          {(searchItems?.handles?.length > 0 ||
            searchItems?.nfts?.length > 0) &&
            search?.trim() !== "" && (
              <div className="absolute w-full h-fit max-h-60 border-2 border-black flex bg-white right-0 top-10 flex-col gap-3 p-2 overflow-y-scroll">
                {[...searchItems?.handles, ...searchItems?.nfts]
                  ?.sort(() => Math.random() - 0.5)
                  ?.map((item, key) => {
                    return (
                      <>
                        {(item as NFTData)?.prices?.length > 0 ? (
                          <div
                            key={key}
                            className="cursor-pixel relative w-full h-fit flex flex-row gap-2 items-center justify-between hover:opacity-70 cursor-pixel"
                            onClick={() => {
                              animationContext?.setPageChange?.(true);
                              router.push(
                                `/nft/${
                                  (item as NFTData)?.profile?.username
                                    ?.localName
                                }/${(item as NFTData)?.id}`
                              );
                              setSearch("");
                              setSearchItems({
                                nfts: [],
                                handles: [],
                              });
                            }}
                          >
                            <div className="relative w-fit h-fit flex  items-center justify-center">
                              <div className="relative w-12 h-12 rounded-md flex items-center justify-center">
                                <Image
                                  src={`${INFURA_GATEWAY}/ipfs/${
                                    (item as NFTData)?.image?.split(
                                      "ipfs://"
                                    )?.[1]
                                  }`}
                                  alt="nft"
                                  draggable={false}
                                  objectFit="cover"
                                  layout="fill"
                                  className="rounded-md"
                                />
                              </div>
                            </div>
                            <div className="text-sm text-black flex w-fit h-fit font-jack">
                              {(item as NFTData)?.title?.slice(0, 20)}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={key}
                            className="cursor-pixel relative w-full h-fit flex flex-row gap-2 items-center justify-between hover:opacity-70 cursor-pixel"
                            onClick={() => {
                              animationContext?.setPageChange?.(true);
                              router.push(
                                `/user/${
                                  (item as Account)?.username?.localName
                                }`
                              );
                              setSearch("");
                              setSearchItems({
                                nfts: [],
                                handles: [],
                              });
                            }}
                          >
                            <div className="relative w-fit h-fit flex  items-center justify-center">
                              <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-morado">
                                <Image
                                  src={`${INFURA_GATEWAY}/ipfs/${
                                    (item as Account)?.metadata?.picture?.split(
                                      "ipfs://"
                                    )?.[1]
                                  }`}
                                  alt="nft"
                                  draggable={false}
                                  objectFit="cover"
                                  layout="fill"
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                            <div className="text-sm text-black flex w-fit h-fit font-jack">
                              {(item as Account)?.username?.localName?.slice(
                                0,
                                10
                              ) + "..."}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })}
              </div>
            )}
        </label>
        <div className="relative flex items-center justify-center w-fit h-fit">
          <div
            className="relative w-10 h-10 flex items-center justify-center cursor-pixel active:scale-95 cursor-pixel"
            onClick={() => setOpenAccount(!openAccount)}
          >
            {context?.lensConnected?.profile?.metadata?.picture ? (
              <div className="relative rounded-full w-10 h-10 bg-crema border border-morado">
                <Image
                  src={`${INFURA_GATEWAY}/ipfs/${
                    context?.lensConnected?.profile?.metadata?.picture?.split(
                      "ipfs://"
                    )?.[1]
                  }`}
                  draggable={false}
                  className="rounded-full"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ) : context?.lensConnected?.profile ? (
              <svg
                className="size-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-6"
              >
                <path
                  d="M18 2h-6v2h-2v6h2V4h6V2zm0 8h-6v2h6v-2zm0-6h2v6h-2V4zM7 16h2v-2h12v2H9v4h12v-4h2v6H7v-6zM3 8h2v2h2v2H5v2H3v-2H1v-2h2V8z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
          {openAccount && (
            <div className="absolute w-40 h-fit rounded-md flex right-0 top-12 flex-col gap-5 shadow-lg p-2 text-xxs font-jackey pixel-border-3">
              <div
                className={`relative w-full h-fit flex items-center justify-start flex-row gap-1 ${
                  context?.lensConnected?.profile && "cursor-pixel"
                }`}
                onClick={() => {
                  animationContext?.setPageChange?.(true);
                  router.push(
                    `/user/${context?.lensConnected?.profile?.username?.localName}`
                  );
                  setOpenAccount(false);
                }}
              >
                <div className="relative w-fit h-fit flex">
                  {context?.lensConnected?.profile?.metadata?.picture ? (
                    <div className="relative rounded-full w-6 h-6 bg-crema border border-morado">
                      <Image
                        src={`${INFURA_GATEWAY}/ipfs/${
                          context?.lensConnected?.profile?.metadata?.picture?.split(
                            "ipfs://"
                          )?.[1]
                        }`}
                        draggable={false}
                        className="rounded-full"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  ) : context?.lensConnected?.profile ? (
                    <svg
                      className="size-6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-6"
                    >
                      <path
                        d="M18 2h-6v2h-2v6h2V4h6V2zm0 8h-6v2h6v-2zm0-6h2v6h-2V4zM7 16h2v-2h12v2H9v4h12v-4h2v6H7v-6zM3 8h2v2h2v2H5v2H3v-2H1v-2h2V8z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </div>
                {context?.lensConnected?.profile?.username?.localName ? (
                  <div className="relative w-full h-fit flex items-center justify-center text-left">
                    {context?.lensConnected?.profile?.username?.localName?.slice(
                      0,
                      4
                    ) + " ..."}
                  </div>
                ) : (
                  address && (
                    <div className="relative w-full h-fit flex items-center justify-center text-left">
                      {address?.slice(0, 4) + "..."}
                    </div>
                  )
                )}
              </div>
              <div className="relative w-full h-fit flex flex-col gap-2 font-jack">
                {context?.lensConnected?.profile && address && (
                  <div
                    className="relative flex w-full h-10 rounded-xl bg-[#FD91C6] active:scale-95 items-center justify-center text-center text-sm text-black hover:opacity-80 cursor-pixel pixel-border-4"
                    onClick={() => {
                      animationContext?.setPageChange?.(true);
                      router.push("/dashboard");
                      setOpenAccount(false);
                    }}
                  >
                    Dashboard
                  </div>
                )}
                <div
                  className="relative flex w-full h-10 rounded-xl bg-black active:scale-95 items-center justify-center text-center text-sm text-white hover:opacity-80 cursor-pixel pixel-border-4"
                  onClick={() =>
                    isConnected
                      ? openProfile?.()
                      : chainId !== 37111
                      ? openSwitchNetworks?.()
                      : openOnboarding?.()
                  }
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </div>
                <div
                  className={`relative flex w-full h-10  pixel-border-3 items-center justify-center text-center text-sm hover:opacity-80 ${
                    !isConnected ? "opacity-60" : "active:scale-95 cursor-pixel"
                  }`}
                  onClick={() => {
                    setOpenAccount(false);
                    if (!context?.lensConnected?.profile) {
                      handleLensConnect();
                    } else {
                      logout();
                    }
                  }}
                >
                  {lensLoading ? (
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
                  ) : context?.lensConnected?.profile && address ? (
                    "Log Out Lens"
                  ) : (
                    "Lens Sign In"
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
