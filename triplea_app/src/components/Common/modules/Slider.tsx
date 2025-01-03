import { AnimationContext, ModalContext } from "@/app/providers";
import { useRouter } from "next/navigation";
import { FunctionComponent, JSX, useContext } from "react";
import MarqueeText from "react-fast-marquee";

const Slider: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const router = useRouter();
  const animationContext = useContext(AnimationContext);
  return (
    <div className="relative w-full h-fit sm:h-16 flex gap-4 flex-col sm:flex-row justify-between items-center z-0 bg-white pixel-border-small font-jackey2 text-sm text-black">
      <MarqueeText
        gradient={false}
        speed={100}
        direction={"left"}
        pauseOnHover
        className="z-0"
      >
        <div className="relative w-full h-fit text-base">
          {
            " NEW COLLECTIONS ** // ** WHAT'S HOT?! 💎 IT'S YOURS, IF YOU'RE QUICK ENOUGH. 💎💣💎 GRAB IT, STACK IT, FLEX IT ** // ** BURNING UP THE BLOCK ! &&!!@@ ONLY FOR THE FAST 🔥, ONLY FOR THE HUNGRY NEW COLLECTIONS ** // ** WHAT'S HOT?! 💎 IT'S YOURS, IF YOU'RE QUICK ENOUGH. 💎💣💎 GRAB IT, STACK IT, FLEX IT ** // ** BURNING UP THE BLOCK ! &&!!@@ ONLY FOR THE FAST 🔥, ONLY FOR THE HUNGRY NEW COLLECTIONS ** // ** WHAT'S HOT?! 💎 IT'S YOURS, IF YOU'RE QUICK ENOUGH. 💎💣💎 GRAB IT, STACK IT, FLEX IT ** // ** BURNING UP THE BLOCK ! &&!!@@ ONLY FOR THE FAST 🔥, ONLY FOR THE HUNGRY"
          }
        </div>
      </MarqueeText>
      <div className="relative w-fit h-fit hidden sm:flex font-jack">|</div>
      <div className="relative w-full h-px sm:hidden flex bg-black"></div>
      <div className="relative w-fit h-fit flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 font-start uppercase items-center justify-center sm:text-sm text-xxs">
        <div className="relative w-fit h-fit flex">
          {context?.agents?.length}
        </div>
        <div className="relative w-fit h-fit flex whitespace-nowrap">
          Agents Active
        </div>
        <div
          className="relative w-10 h-10 flex pixel-border-4 bg-[#5aacfa] rounded-xl items-center justify-center hover:opacity-70 cursor-pixel"
          onClick={() => {
            animationContext?.setPageChange?.(true);
            router.push("/agent-payouts");
          }}
          title={"Agent Payouts"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-6"
          >
            <path
              d="M6 2h2v2H6V2zm2 3H6v3H2v9h6v-2h2v2h4v-2h2v2h6V8h-4V5h-2v3h-3V5h-2v3H8V5zm12 10h-4v-3h-2v3h-4v-3H8v3H4v-5h16v5zM2 20h20v2H2v-2zM13 2h-2v2h2V2zm3 0h2v2h-2V2zM2 17h2v3H2zm18 0h2v3h-2z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div
          className="relative w-10 h-10 flex pixel-border-4 bg-morado rounded-xl items-center justify-center hover:opacity-70 cursor-pixel"
          onClick={() => {
            animationContext?.setPageChange?.(true);
            router.push("/agents");
          }}
          title={"Agents"}
        >
          <svg
            className="size-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              d="M10 2h4v4h-4V2zM7 7h10v2h-2v13h-2v-6h-2v6H9V9H7V7zM5 5v2h2V5H5zm0 0H3V3h2v2zm14 0v2h-2V5h2zm0 0V3h2v2h-2z"
              fill="currentColor"
            />{" "}
          </svg>
        </div>
        <div
          className="relative w-10 h-10 flex pixel-border-4 bg-[#FFF026] rounded-xl items-center justify-center hover:opacity-70 cursor-pixel"
          onClick={() => {
            animationContext?.setPageChange?.(true);
            router.push("/dev-treasury");
          }}
          title={"Dev Treasury"}
        >
          <svg
            className="size-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            {" "}
            <path d="M20 0h2v2h2v2h-2v2h-2V4h-2V2h2V0ZM8 4h8v2h-2v2h-2V6H8V4ZM6 8V6h2v2H6Zm0 8H4V8h2v8Zm2 2H6v-2h2v2Zm8 0v2H8v-2h8Zm2-2v2h-2v-2h2Zm-2-4v-2h2V8h2v8h-2v-4h-2Zm-4 0h4v2h-4v-2Zm0 0V8h-2v4h2Zm-8 6H2v2H0v2h2v2h2v-2h2v-2H4v-2Z" />{" "}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Slider;
