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

const MintSwitch: FunctionComponent<MintSwitchProps> = ({
  mintSwitcher,
  setMintSwitcher,
  setAgents,
  agents,
  allDrops,
}): JSX.Element => {
  const { address } = useAccount();
  const publicClient = createPublicClient({
    chain: chains.testnet,
    transport: http(),
  });
  const { handleMint, mintLoading, mintData, setMintData, agentsLoading } =
    useMint(agents, setAgents, publicClient, address);

  switch (mintSwitcher) {
    case MintSwitcher.Agent:
      return (
        <ChooseAgent
          mintData={mintData}
          setMintData={setMintData}
          agents={agents}
          agentsLoading={agentsLoading}
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
          setMintData={setMintData}
          handleMint={handleMint}
          allDrops={allDrops}
          agents={agents}
          mintLoading={mintLoading}
        />
      );

    default:
      return (
        <div className="relative w-full h-full flex flex-row gap-6 items-center justify-center">
          <label
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
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
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
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
                className="relative flex w-full h-10 text-left text-black bg-gray-200 focus:outline-none text-3xl"
                placeholder="Title"
                onChange={(e) =>
                  setMintData({
                    ...mintData,
                    title: e.target.value,
                  })
                }
                disabled={mintLoading}
              />
              <input
                disabled={mintLoading}
                type="number"
                min={1}
                placeholder="1"
                value={mintData.amount}
                step={1}
                className="relative flex w-14 px-1 h-10 text-gray-600 bg-gray-200 focus:outline-none text-xl text-left"
                onChange={(e) =>
                  setMintData({
                    ...mintData,
                    amount: Number(e.target.value),
                  })
                }
              />
              <textarea
                className="relative flex w-full h-1/2 overflow-y-scroll text-left text-black bg-gray-200 focus:outline-none text-lg"
                placeholder="Description"
                onChange={(e) =>
                  setMintData({
                    ...mintData,
                    description: e.target.value,
                  })
                }
                disabled={mintLoading}
              ></textarea>
            </div>
            <div className="relative w-full h-fit flex items-center justify-center gap-px flex-col">
              <div className="h-px w-full flex bg-morado" />
              <div className="h-px w-full flex bg-cielo" />
              <div className="h-px w-full flex bg-oscuro" />
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
                      className="relative w-full h-fit flex flex-row gap-3 items-center justify-center"
                    >
                      <div
                        className={`relative w-10 h-10 rounded-full cursor-pointer ${
                          !mintData.tokens?.includes(token.contract) &&
                          "opacity-60"
                        }`}
                        title={token.symbol}
                        onClick={() =>
                          !mintLoading &&
                          setMintData((prev) => {
                            const newMintData = {
                              ...prev,
                            };

                            if (newMintData.tokens?.includes(token.contract)) {
                              newMintData.tokens = newMintData.tokens.filter(
                                (tok) => tok !== token.contract
                              );
                              newMintData.prices = newMintData.prices.filter(
                                (_, ind) => ind !== key
                              );
                            } else {
                              newMintData.tokens = [
                                ...newMintData.tokens,
                                token.contract,
                              ];

                              newMintData.prices = [...newMintData.prices, 0];
                            }

                            return newMintData;
                          })
                        }
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
                      <input
                        disabled={
                          !mintData.tokens?.includes(token.contract) ||
                          mintLoading
                        }
                        value={mintData?.prices?.[key]}
                        type="number"
                        min={1}
                        step={1}
                        className="relative flex w-full h-10 text-gray-600 bg-gray-200 focus:outline-none text-xl text-right"
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
