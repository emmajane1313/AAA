import { FunctionComponent, JSX } from "react";
import { SignlessProps } from "../types/modals.types";
import { AiOutlineLoading } from "react-icons/ai";
import useSignless from "../hooks/useSignless";

const Signless: FunctionComponent<SignlessProps> = ({
  lensConnected,
  setSignless,
}): JSX.Element => {
  const { signlessLoading, handleSignless } = useSignless(
    lensConnected,
    setSignless
  );
  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-pixel items-center justify-center"
      onClick={() => setSignless(false)}
    >
      <div
        className="w-96 h-fit text-sm text-black flex items-center justify-start p-3 cursor-default flex-col gap-10 pixel-border-2 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-fit pb-3 h-fit flex items-center justify-center font-jack uppercase text-center">
          Enable Signless Transactions
        </div>
        <div
          className={`"relative px-3 py-1 flex items-center justify-center pixel-border-3 text-black font-start w-28 h-8 rounded-md ${
            !signlessLoading && "cursor-pixel active:scale-95"
          }`}
          onClick={() => !signlessLoading && handleSignless()}
        >
          {signlessLoading ? (
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
            "Enable"
          )}
        </div>
      </div>
    </div>
  );
};

export default Signless;
