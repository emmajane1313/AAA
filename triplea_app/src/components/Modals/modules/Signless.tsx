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
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-pointer items-center justify-center"
      onClick={() => setSignless(false)}
    >
      <div
        className="bg-white rounded-md w-96 h-fit text-sm text-black flex items-center justify-start p-3 cursor-default flex-col gap-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
          Enable Signless Transactions
        </div>
        <div
          className={`"relative px-3 py-1 flex items-center justify-center bg-black text-white w-28 h-8 rounded-md ${
            !signlessLoading && "cursor-pointer active:scale-95"
          }`}
          onClick={() => !signlessLoading && handleSignless()}
        >
          {signlessLoading ? (
            <AiOutlineLoading size={15} className={`black animate-spin`} />
          ) : (
            "Enable"
          )}
        </div>
      </div>
    </div>
  );
};

export default Signless;
