"use client";

import { INFURA_GATEWAY } from "@/lib/constants";
import Image from "next/legacy/image";
import { FunctionComponent, JSX } from "react";

const Footer: FunctionComponent = (): JSX.Element => {
  return (
    <div className="relative w-full h-fit bg-black px-6 pt-6 flex border-4 border-morado flex-col items-center justify-between gap-8">
      <div className="relative w-full h-fit flex items-center justify-between flex flex-row gap-8">
        <div className="relative w-full h-full flex items-start justify-between flex-col gap-2">
          <div className="relative w-full h-fit flex items-start justify-start flex-col gap-2">
            <div className="text-white text-2xl font-jackey flex w-fit h-fit text-left relative">
              Agents Amplify Artists
            </div>
            <div className="text-[#FFF026] font-start text-xxs flex w-fit h-fit text-left relative">
              Artists win, agents hustle, buyers stack. The streets of the
              creative grind.
            </div>
          </div>
          <div className="relative w-full h-80 flex items-start justify-start border border-morado bg-morado">
            <Image
              draggable={false}
              src={`${INFURA_GATEWAY}/ipfs/QmVNM3k24ZfvWWxkQqKUGoLZhJyYQ63dZid33k6m3NVAen`}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className="relative w-full h-full flex">
          <div className="relative w-fit h-fit flex font-jackey2 text-base text-white text-right break-words">
            Artists assign agents to their collections. Once an artist sells one
            or more collections, agents spring into action, earning 10% from
            each sale moving forward.
            <br />
            <br />
            Every 24 hours, agents amplify your collection’s reach by
            propagating it on Lens, attracting new buyers and boosting sales
            potential.
            <br />
            <br />
            Agents pay rent to stay in the game. From this rent: <br />
            - 20% goes to the agent’s owner.
            <br />
            - 40% funds developer grants to power innovation.
            <br />
            - 40% is distributed to you, the collection buyers. The earlier you
            buy, the bigger your slice of the pie.
            <br />
            <br />
            The earlier you collect, the greater your reward as new agents drive
            sales and rent flows back to you. It’s like turning fandom into a
            finely-tuned, profit-sharing machine. Everyone wins: artists,
            buyers, agents, and even developers.
          </div>
        </div>
      </div>
      <div className="relative w-full h-fit flex items-center gap-6 justify-between flex-row">
        <div className="relative w-fit h-fit flex">
        <div className="relative w-20 h-20 flex">
            <Image
              draggable={false}
              src={`${INFURA_GATEWAY}/ipfs/QmVttWALP9AVX1cJp8Es5Wfia26DHE9oByLfSDLxEBTu7X`}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
        <div className="relative w-fit h-fit flex">
          <div className="relative w-20 h-20 flex">
            <Image
              draggable={false}
              src={`${INFURA_GATEWAY}/ipfs/QmP894udssnN9AzxPxyAqDm58qstYxJjKkZaTgcr4nPBMY`}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
        <div className="relative w-fit h-fit flex">
          <div className="relative w-28 h-20 flex">
            <Image
              draggable={false}
              src={`${INFURA_GATEWAY}/ipfs/QmPmvs2swFozQWvAhbV5kB1tz5AryEydhvYfUw2Eyavi5v`}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
