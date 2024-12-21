import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FunctionComponent, JSX } from "react";
import useHeader from "../hooks/useHeader";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Header: FunctionComponent = (): JSX.Element => {
  const router = useRouter();
  const { openAccount, setOpenAccount } = useHeader();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { isConnected, address } = useAccount();
  return (
    <div className="relative w-full h-fit py-2 px-2 flex flex-row justify-between items-center">
      <div
        className="relative cursor-pointer active:scale-95 flex items-center justify-center w-fit h-fit"
        onClick={() => router.push("/")}
      >
        <div className="w-10 h-10 flex relative">
          <Image
            src={`${INFURA_GATEWAY}/ipfs/QmRP1tuiSVjS85zNB6SrFc1Ykrr58LTF5j2kQfwYgbVgwh`}
            layout="fill"
            objectFit="cover"
            alt="Triple A"
            draggable={false}
          />
        </div>
      </div>
      <div className="relative flex items-center justify-center w-fit h-fit">
        <div
          className="relative w-10 h-10 flex items-center justify-center cursor-pointer active:scale-95"
          onClick={() => setOpenAccount(!openAccount)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 stroke-morado"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        {openAccount && (
          <div className="absolute w-40 h-fit rounded-md flex bg-crema right-0 top-10 flex-col gap-5 shadow-lg p-2">
            <div
              className="relative w-full h-fit flex items-center justify-start flex-row gap-1 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6 flex items-center justify-center"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>
              {address && (
                <div className="relative w-full h-fit flex items-center justify-center">
                  {address?.slice(0, 10) + "..."}
                </div>
              )}
            </div>
            <div className="relative w-full h-fit flex flex-col gap-2">
              <div
                className="relative flex w-full h-10 rounded-md bg-black active:scale-95 cursor-pointer items-center justify-center text-center text-sm text-white hover:opacity-80"
                onClick={() =>
                  isConnected ? openAccountModal : openConnectModal
                }
              >
                {isConnected ? "Disconnect" : "Connect"}
              </div>
              <div
                className={`relative flex w-full h-10 rounded-md border border-black items-center justify-center text-center text-sm hover:opacity-80 ${
                  !isConnected ? "opacity-60" : "active:scale-95 cursor-pointer"
                }`}
              >
                Lens Sign In
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
