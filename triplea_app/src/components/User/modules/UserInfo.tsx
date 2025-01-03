import { FunctionComponent, JSX } from "react";
import { UserInfoProps } from "../types/user.types";
import Image from "next/legacy/image";
import { INFURA_GATEWAY } from "@/lib/constants";

const UserInfo: FunctionComponent<UserInfoProps> = ({
  userInfo,
}): JSX.Element => {
  return (
    <div className="relative w-full h-fit flex flex-col gap-3">
      <div
        className={`pixel-border-2 rounded-2xl w-full h-fit text-sm text-black flex items-center justify-start p-3 flex-col gap-6 font-jackey2 text-black ${
          !userInfo && "animate-pulse"
        }`}
      >
        {userInfo && (
          <>
            <div className="relative w-fit h-fit flex items-center justify-center text-2xl">
              {userInfo?.metadata?.name || userInfo?.username?.localName}
            </div>
            <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
              <div className="relative items-center justify-center flex w-fit h-fit">
                <div className="relative w-20 rounded-full h-20 flex items-center justify-center border border-black bg-white">
                  {userInfo?.metadata?.picture && (
                    <Image
                      src={`${INFURA_GATEWAY}/ipfs/${
                        userInfo?.metadata?.picture?.split("ipfs://")?.[1]
                      }`}
                      objectFit="cover"
                      layout="fill"
                      draggable={false}
                      className="rounded-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {userInfo && (
        <div className="relative w-full h-fit flex justify-center sm:justify-between items-center gap-2 flex-wrap sm:flex-row text-black text-xxs sm:text-sm font-start uppercase">
          <div className="relative w-fit h-fit flex flex-row gap-1.5">
            <div className="relative w-fit h-fit flex">Followers: </div>
            <div className="relative w-fit h-fit flex">
              {userInfo?.stats?.graphFollowStats?.followers || 0}{" "}
            </div>
          </div>
          <div className="relative w-fit h-fit flex flex-row gap-1.5">
            <div className="relative w-fit h-fit flex">Following: </div>
            <div className="relative w-fit h-fit flex">
              {userInfo?.stats?.graphFollowStats?.following || 0}{" "}
            </div>
          </div>
        </div>
      )}
      {userInfo?.metadata?.bio && (
        <div className="relative w-full h-fit flex items-start justify-start">
          <div className="relative w-full h-14 overflow-y-scroll font-jackey2 text-sm text-left">
            {userInfo?.metadata?.bio}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
