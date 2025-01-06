import { FunctionComponent, JSX, useContext } from "react";
import { MintSwitcher, MintSwitchProps } from "../types/dashboard.types";
import useMint from "../hooks/useMint";
import Mint from "./Mint";
import Drop from "./Drop";
import Image from "next/legacy/image";
import { INFURA_GATEWAY, TOKENS } from "@/lib/constants";
import ChooseAgent from "./ChooseAgent";
import { createPublicClient, http } from "viem";
import { useAccount } from "wagmi";
import { chains } from "@lens-network/sdk/viem";
import { useRouter } from "next/navigation";
import { AnimationContext } from "@/app/providers";

const MintSwitch: FunctionComponent<MintSwitchProps> = ({
  mintSwitcher,
  setMintSwitcher,
  setAgents,
  agents,
  allDrops,
  lensConnected,
  tokenThresholds,
}): JSX.Element => {
  const { address } = useAccount();
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(
      "https://rpc.testnet.lens.dev"
      // `https://lens-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_LENS_KEY}`
    ),
  });
  const { handleMint, mintLoading, mintData, setMintData, agentsLoading, id } =
    useMint(
      agents,
      setAgents,
      publicClient,
      address,
      setMintSwitcher,
      lensConnected?.sessionClient!
    );
  switch (mintSwitcher) {
    case MintSwitcher.Agent:
      return (
        <ChooseAgent
          mintData={mintData}
          setMintData={setMintData}
          agents={agents}
          agentsLoading={agentsLoading}
          tokenThresholds={tokenThresholds}
        />
      );

    case MintSwitcher.Drop:
      return (
        <Drop
          mintLoading={mintLoading}
          mintData={mintData}
          setMintData={setMintData}
          allDrops={allDrops}
          setMintSwitcher={setMintSwitcher}
        />
      );

    case MintSwitcher.Mint:
      return (
        <Mint
          mintData={mintData}
          tokenThresholds={tokenThresholds}
          handleMint={handleMint}
          allDrops={allDrops}
          mintLoading={mintLoading}
        />
      );

    case MintSwitcher.Success:
      return (
        <div className="relative w-full h-full flex flex-col gap-6 items-center justify-center font-jacey">
          <div className="relative flex w-fit h-10 text-center text-black font-start uppercase text-3xl">
            Minted!
          </div>
          <div className="relative w-full h-fit flex items-center justify-center">
            <div
              className={`relative w-fit px-6 py-1 h-12 bg-black text-white cursor-pixel hover:opacity-70 text-base rounded-md flex items-center justify-center font-jack`}
              onClick={() => {
                animationContext?.setPageChange?.(true);
                router.push(
                  `/nft/${lensConnected?.profile?.username?.localName}/${id}`
                );
              }}
            >
              Go to NFT
            </div>
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
            {mintData.image ? (
              <Image
                src={URL.createObjectURL(mintData.image)}
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
              disabled={mintLoading}
              onChange={(e) => {
                e.stopPropagation();
                if (!e.target.files || e.target.files.length === 0) return;
                setMintData({
                  ...mintData,
                  image: e?.target?.files?.[0],
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
                  setMintData({
                    ...mintData,
                    title: e.target.value,
                  })
                }
                value={mintData.title}
                disabled={mintLoading}
              />
              <div className="relative text-xs w-fit h-fit flex">
                {"( Min. of 3 Editions to Activate Agents. )"}
              </div>
              <input
                disabled={mintLoading}
                type="number"
                min={1}
                placeholder="1"
                value={mintData.amount}
                step={1}
                className={`relative flex w-14 px-1 h-12 pixel-border-2 focus:outline-none text-xl text-left 
                  
                  ${
                    Number(mintData?.amount) > 2
                      ? "text-[#00cc00]"
                      : "text-black"
                  }`}
                onChange={(e) => {
                  if (Number(e.target.value) < 1) {
                    (e.target.value as any) = 1;
                  }

                  setMintData({
                    ...mintData,
                    amount: Number(e.target.value),
                  });
                }}
              />
              <textarea
                className="relative flex w-full h-1/2 overflow-y-scroll text-left text-black pixel-border-2 p-1.5 focus:outline-none text-lg"
                placeholder="Description"
                onChange={(e) =>
                  setMintData({
                    ...mintData,
                    description: e.target.value,
                  })
                }
                value={mintData.description}
                disabled={mintLoading}
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
                Set Tokens
              </div>
              <div>
                {TOKENS?.map((token, key: number) => {
                  return (
                    <div
                      key={key}
                      className="relative w-full h-fit flex flex-wrap sm:flex-row gap-3 items-center justify-between"
                    >
                      <div className="flex relative w-full h-fit flex-row items-center justify-center gap-2">
                        <div className="relative w-fit h-fit flex">
                          <div
                            className={
                              `relative w-10 h-10`
                              //    ${
                              //   !mintData.tokens?.includes(token.contract) &&
                              //   "opacity-60"
                              // }
                            }
                            title={token.symbol}
                            // onClick={() =>
                            //   !mintLoading &&
                            //   setMintData((prev) => {
                            //     const newMintData = {
                            //       ...prev,
                            //     };

                            //     if (newMintData.tokens?.includes(token.contract)) {
                            //       newMintData.tokens = newMintData.tokens.filter(
                            //         (tok) => tok !== token.contract
                            //       );
                            //       newMintData.prices = newMintData.prices.filter(
                            //         (_, ind) => ind !== key
                            //       );
                            //     } else {
                            //       newMintData.tokens = [
                            //         ...newMintData.tokens,
                            //         token.contract,
                            //       ];

                            //       newMintData.prices = [...newMintData.prices, 0];
                            //     }

                            //     return newMintData;
                            //   })
                            // }
                          >
                            <Image
                              src={`${INFURA_GATEWAY}/ipfs/${token.image}`}
                              layout="fill"
                              objectFit="contain"
                              draggable={false}
                              className="rounded-full"
                              alt={token.symbol}
                            />
                          </div>
                        </div>
                        <input
                          disabled={
                            !mintData.tokens?.includes(token.contract) ||
                            mintLoading
                          }
                          value={mintData?.prices?.[key]}
                          type="number"
                          min={1}
                          placeholder="1"
                          step={1}
                          className="relative flex w-full h-10 pixel-border-2 p-1.5 focus:outline-none text-xl text-right"
                          onChange={(e) =>
                            setMintData((prev) => {
                              const newMintData = {
                                ...prev,
                              };

                              const index = newMintData.tokens.findIndex(
                                (tok) => tok == token.contract
                              );

                              const prices = [...newMintData.prices];
                              prices[index] = Number(e.target.value);

                              newMintData.prices = prices;

                              return newMintData;
                            })
                          }
                        />
                        <div className="relative w-fit h-fit flex text-gray-600 text-sm">
                          {token.symbol}
                        </div>
                      </div>
                      <div className="flex relative w-full h-fit items-center justify-center gap-2 flex-row font-jackey2 text-sm text-left">
                        <div className="relative w-full h-fit flex flex-col gap-1 items-start justify-start">
                          <div className="relative flex w-fit h-fit">
                            Token Rent
                          </div>
                          <div className="relative flex w-fit h-fit">
                            {Number(
                              tokenThresholds?.find(
                                (t) =>
                                  t.token?.toLowerCase() ==
                                  token.contract?.toLowerCase()
                              )?.rent || 0
                            ) /
                              10 ** 18}
                            {" " + token.symbol}
                          </div>
                        </div>
                        <div
                          className={`relative w-full h-fit flex flex-col gap-1 items-start justify-start ${
                            Number(mintData?.prices?.[0]) * 10 ** 18 >=
                            Number(
                              tokenThresholds?.find(
                                (t) =>
                                  t.token?.toLowerCase() ==
                                  token.contract?.toLowerCase()
                              )?.threshold || 0
                            )
                              ? "text-[#00cc00]"
                              : "text-black"
                          }`}
                        >
                          <div className="relative flex w-fit h-fit">
                            Token Agent Threshold
                          </div>
                          <div className="relative flex w-fit h-fit">
                            {Number(
                              tokenThresholds?.find(
                                (t) =>
                                  t.token?.toLowerCase() ==
                                  token.contract?.toLowerCase()
                              )?.threshold || 0
                            ) /
                              10 ** 18}
                            {" " + token.symbol}
                          </div>
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
  }
};

export default MintSwitch;
