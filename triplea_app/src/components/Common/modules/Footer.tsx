"use client";

import { FOOTER_TEXT, INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { FunctionComponent, JSX, useState } from "react";

const Footer: FunctionComponent = (): JSX.Element => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  return (
    <div className="relative w-full h-fit flex border-4 border-morado border">
      <div className="relative w-full h-fit bg-gradient-to-r from-[#EA5EFF] to-[#9568F6] border-2 border-black flex flex-col items-center justify-between gap-8">
        <div className="relative w-full h-fit flex flex-row justify-between items-center gap-6 pt-6 px-2 sm:px-6 flex-wrap lg:flex-nowrap">
          <div className="relative w-full h-fit flex justify-between items-center gap-6 lg:flex-row flex-col">
            <div className="relative w-full sm:w-fit h-fit flex items-center justify-center">
              <div className="relative w-full sm:w-72 h-80 flex">
                <Image
                  draggable={false}
                  src={`${INFURA_GATEWAY}/ipfs/QmPmvs2swFozQWvAhbV5kB1tz5AryEydhvYfUw2Eyavi5v`}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
            <div className="relative w-full sm:w-fit h-full flex items-center md:items-start justify-center md:justify-start flex-row gap-4 xl:flex-nowrap flex-wrap">
              <div className="relative w-full sm:w-fit h-fit flex">
              <div className="w-full sm:w-60 h-60 xl:w-80 xl:h-80 flex items-center justify-center pixel-border-2 rounded-xl relative p-3">
                  <div className="rounded-lg pixel-border-4 relative w-full h-full flex p-1 bg-[#73B6DF]">
                    <div
                    className="relative w-full h-full rounded-md bg-[#0B75FF] border border-black flex overflow-y-scroll break-words p-3 text-base lg:text-lg font-arc text-white whitespace-inline"
                      dangerouslySetInnerHTML={{
                        __html: FOOTER_TEXT[currentPage - 1],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div
                className="relative w-fit h-fit flex cursor-pixel"
                onClick={() =>
                  setCurrentPage(
                    currentPage < FOOTER_TEXT.length ? currentPage + 1 : 1
                  )
                }
              >
                <div className="relative w-20 h-20 flex">
                  <Image
                    draggable={false}
                    src={`${INFURA_GATEWAY}/ipfs/QmbPHZuqofaVWRM4KCMRaqhVrQJvCiUKnrdWZ6jhWmPstZ`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="relative w-full sm:w-fit h-fit flex">
              <div className="w-full sm:w-60 h-60 xl:w-80 xl:h-80 flex items-center justify-center pixel-border-2 rounded-xl relative p-3">
                  <div className="rounded-lg pixel-border-4 relative w-full h-full flex p-1 bg-[#73B6DF]">
                    <div
                      className="relative w-full h-full rounded-md bg-[#0B75FF] border border-black flex overflow-y-scroll break-words p-3 text-base lg:text-lg font-arc text-white whitespace-inline"
                      dangerouslySetInnerHTML={{
                        __html: FOOTER_TEXT[currentPage],
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-full lg:w-fit h-full flex break-all font-jackey2 text-white text-base flex-col justify-between text-center lg:text-right gap-6 lg:items-end items-center">
            <div className="uppercase text-2xl relative w-fit h-fit flex">
              DO YOUR STORIES <br />
              COLLECT THEMSELVES?
            </div>
            <div className="uppercase relative w-fit h-fit flex break-words">
              NOW THEY CAN. BUT YOU NEED AN AGENT TO GET SEEN
            </div>
            <div className="uppercase relative w-fit h-fit flex break-words">
              FUNDED BY SALES AND SOCIAL VIBES
            </div>
            <div className="uppercase relative w-fit h-fit flex break-words">
              BUILT ON THE NEW LENS NETWORK
            </div>
          </div>
        </div>

        <div className="relative w-full h-20 bg-[#FFD237] flex items-center justify-center font-start text-xxs text-black">
          <div className="relative w-fit h-fit flex">
            {`${currentPage} / ${FOOTER_TEXT.length}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
