import { FunctionComponent, JSX } from "react";
import { AccountProps, Switcher } from "../types/dashboard.types";
import Image from "next/legacy/image";
import useAccount from "../hooks/useAccount";
import { INFURA_GATEWAY } from "@/lib/constants";

const Account: FunctionComponent<AccountProps> = ({
  setSwitcher,
  lensConnected,
  setLensConnected,
  storageClient,
  setSignless
}): JSX.Element => {
  const { accountLoading, setNewAccount, newAccount, handleUpdateAccount } =
    useAccount(lensConnected, setLensConnected, storageClient, setSignless);
  return (
    <div className="relative w-full h-full  flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
      <div className="relative w-full h-full  pixel-border-2 p-3 flex flex-col items-center justify-between gap-6">
        <div className="relative w-full h-fit flex items-start justify-start">
          <div
            className="relative flex w-fit h-fit cursor-pixel hover:opacity-70"
            onClick={() => setSwitcher(Switcher.Home)}
          >
            <svg
              className="size-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
                fill="currentColor"
              />{" "}
            </svg>
          </div>
        </div>
        <div className="relative w-full h-full flex flex-col gap-3 items-center justify-center font-jackey2">
          <div className="relative items-center justify-center flex w-fit h-fit">
            <label
              className="relative w-20 rounded-full h-20 flex items-center justify-center border border-black cursor-pixel"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {newAccount?.pfp && (
                <Image
                  src={
                    newAccount.pfp instanceof Blob
                      ? URL.createObjectURL(newAccount.pfp)
                      : `${INFURA_GATEWAY}/ipfs/${
                          (newAccount.pfp || "")?.split("ipfs://")?.[1]
                        }`
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
          <div className="relative w-full h-fit flex items-start justify-start flex-col sm:flex-row gap-3 text-black">
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Username</div>
              <input
                disabled={true}
                className="relative w-full h-8 border border-black focus:outline-none p-1"
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
                className="relative w-full h-8 border border-black focus:outline-none p-1"
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
              className="relative w-full h-full overflow-y-scroll border border-black focus:outline-none p-1"
              value={newAccount?.bio}
              style={{
                resize: "none",
              }}
            ></textarea>
          </div>
        </div>
        <div
          className={`relative px-3 py-1 flex items-center justify-center font-jackey2 pixel-border-3 text-black w-28 h-8 ${
            !accountLoading && "cursor-pixel active:scale-95"
          }`}
          onClick={() => !accountLoading && handleUpdateAccount()}
        >
          {accountLoading ? (
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
            "Update"
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
