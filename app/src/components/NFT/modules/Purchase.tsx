import { FunctionComponent, JSX } from "react";
import { PurchaseProps } from "../types/nft.types";
import usePurchase from "../hooks/usePurchase";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { AiOutlineLoading } from "react-icons/ai";

const Purchase: FunctionComponent<PurchaseProps> = ({ nft }): JSX.Element => {
  const { purchaseLoading, handleApprove, handlePurchase, approved } =
    usePurchase(nft);
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  return (
    <div className="relative w-[38rem] h-full flex flex-col gap-4 items-start justify-start text-left bg-gray-200 p-3 shadow-lg rounded-md">
      <div className="relative text-2xl text-black flex">Title</div>
      <div className="relative w-full h-fit flex items-center justify-between flex-row gap-3">
        <div className="relative w-fit h-fit flex items-center justify-start gap-2 flex-row">
          <div className="relative flex rounded-full w-8 h-8 bg-morado border border-morado"></div>
          <div className="relative flex w-fit h-fit text-xs">
            wallet or name
          </div>
        </div>
        <div className="relative w-fit h-fit flex">date</div>
      </div>
      <div className="relative w-full justify-end flex text-3xl">$19</div>
      <div
        className={`relative w-full h-14 bg-black text-white rounded-md flex items-center justify-center ${
          !purchaseLoading ? "cursor-pointer" : "opacity-70"
        }`}
        onClick={() => {
          if (!purchaseLoading) {
            if (!isConnected) {
              openConnectModal?.();
            } else if (approved) {
              handlePurchase();
            } else {
              handleApprove();
            }
          }
        }}
      >
        {purchaseLoading ? (
          <AiOutlineLoading color={"white"} className="animate-spin h-8 w-8" />
        ) : approved || !isConnected ? (
          "Collect"
        ) : (
          "Approve"
        )}
      </div>
      <div className="py-4 h-fit max-h-40 overflow-y-scroll flex relative items-start justify-start text-left text-black text-sm">
        description here
      </div>
      <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
        <div className="relative w-full h-fit flex items-center justify-center gap-3 flex-col">
          <div className="relative w-full h-fit flex items-center justify-center gap-px flex-col">
            <div className="h-px w-full flex bg-morado" />
            <div className="h-px w-full flex bg-cielo" />
            <div className="h-px w-full flex bg-oscuro" />
          </div>
          <div className="text-black text-lg relative flex w-fit h-fit text-center text-black">
            Agent Activity
          </div>
          <div className="relative w-full h-fit flex items-center justify-center gap-px flex-col">
            <div className="h-px w-full flex bg-morado" />
            <div className="h-px w-full flex bg-cielo" />
            <div className="h-px w-full flex bg-oscuro" />
          </div>
        </div>
        <div className="relative w-full h-fit overflow-y-scroll flex items-start justify-start gap-3"></div>
      </div>
    </div>
  );
};

export default Purchase;
