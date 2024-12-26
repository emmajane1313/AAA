import { FunctionComponent, JSX } from "react";
import { AccountProps, Switcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import useAccount from "../hooks/useAccount";
import createProfilePicture from "@/lib/helpers/createProfilePicture";
import { AiOutlineLoading } from "react-icons/ai";

const Account: FunctionComponent<AccountProps> = ({
  setSwitcher,
  lensConnected,
  setLensConnected,
  storageClient,
}): JSX.Element => {
  const { accountLoading, setNewAccount, newAccount, handleUpdateAccount } =
    useAccount(lensConnected, setLensConnected, storageClient);
  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-start px-20 pb-20 py-10 justify-start">
      <div className="relative w-full h-full bg-gray-200 p-3 shadow-lg rounded-md flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-pointer hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
          >
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
                d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
        </div>
        <div className="relative w-full h-full flex flex-col gap-3 items-center justify-center">
          <div className="relative items-center justify-center flex w-fit h-fit">
            <label
              className="relative w-20 rounded-full h-20 flex items-center justify-center border border-black cursor-pointer bg-crema"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {newAccount?.pfp && (
                <Image
                  src={
                    newAccount.pfp instanceof Blob
                      ? URL.createObjectURL(newAccount.pfp)
                      : createProfilePicture(newAccount.pfp) || ""
                  }
                  objectFit="cover"
                  layout="fill"
                  draggable={false}
                  className="rounded-full"
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                required
                id="files"
                multiple={false}
                name="pfp"
                disabled={accountLoading}
                onChange={(e) => {
                  e.stopPropagation();
                  if (!e.target.files || e.target.files.length === 0) return;
                  setNewAccount({
                    ...newAccount,
                    pfp: e?.target?.files?.[0],
                  });
                }}
              />
            </label>
          </div>
          <div className="relative w-full h-fit flex items-start justify-start flex-row gap-3 text-black">
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Username</div>
              <input
                disabled={true}
                className="relative w-full bg-crema h-8 border border-black focus:outline-none p-1"
                value={lensConnected?.profile?.username?.localName}
              />
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Local Name</div>
              <input
                disabled={accountLoading}
                onChange={(e) =>
                  setNewAccount({
                    ...newAccount,
                    localname: e.target.value,
                  })
                }
                className="relative w-full bg-crema h-8 border border-black focus:outline-none p-1"
                value={newAccount?.localname}
              />
            </div>
          </div>
          <div className="relative w-full h-full flex flex-col gap-1.5 items-start justify-start">
            <div className="relative w-fit h-fit flex">Bio</div>
            <textarea
              disabled={accountLoading}
              onChange={(e) =>
                setNewAccount({
                  ...newAccount,
                  bio: e.target.value,
                })
              }
              className="relative w-full bg-crema h-full overflow-y-scroll border border-black focus:outline-none p-1"
              value={newAccount?.bio}
              style={{
                resize: "none",
              }}
            ></textarea>
          </div>
        </div>
        <div
          className={`"relative px-3 py-1 flex items-center justify-center bg-black text-white w-28 h-8 rounded-md ${
            !accountLoading && "cursor-pointer active:scale-95"
          }`}
          onClick={() => !accountLoading && handleUpdateAccount()}
        >
          {accountLoading ? (
            <AiOutlineLoading size={15} className={`black animate-spin`} />
          ) : (
            "Update"
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
