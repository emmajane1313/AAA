import Image from "next/legacy/image";
import { FunctionComponent, JSX } from "react";
import { CreateAccountProps } from "../types/modals.types";
import useCreateAccount from "../hooks/useCreateAccount";
import { AiOutlineLoading } from "react-icons/ai";

const CreateAccount: FunctionComponent<CreateAccountProps> = ({
  address,
  lensConnected,
  setLensConnected,
  setCreateAccount,
  setError,
}): JSX.Element => {
  const { account, accountLoading, setAccount, handleCreateAccount } =
    useCreateAccount(
      address,
      lensConnected,
      setLensConnected,
      setCreateAccount,
      setError
    );
  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-pointer items-center justify-center"
      onClick={() => setCreateAccount(false)}
    >
      <div
        className="bg-white rounded-md w-96 h-fit text-sm text-black flex items-center justify-start p-3 cursor-default flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-fit pb-3 h-fit flex items-center justify-center">
          Create Lens Account
        </div>
        <div className="relative w-full h-fit flex flex-col gap-3 items-center justify-center">
          <div className="relative items-center justify-center flex w-fit h-fit">
            <label
              className="relative w-20 rounded-full h-20 flex items-center justify-center border border-black cursor-pointer bg-crema"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {account?.pfp && (
                <Image
                  src={URL.createObjectURL(account.pfp)}
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
                  setAccount({
                    ...account,
                    pfp: e?.target?.files?.[0],
                  });
                }}
              />
            </label>
          </div>
          <div className="relative w-full h-fit flex items-start justify-between flex-row gap-3 text-black">
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Username</div>
              <input
                disabled={accountLoading}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    username: e.target.value,
                  })
                }
                className="relative w-full bg-crema h-8 border border-black focus:outline-none p-1"
                value={account?.username}
              />
            </div>
            <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
              <div className="relative w-fit h-fit flex">Local Name</div>
              <input
                disabled={accountLoading}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    localname: e.target.value,
                  })
                }
                className="relative w-full bg-crema h-8 border border-black focus:outline-none p-1"
                value={account?.localname}
              />
            </div>
          </div>
          <div className="relative w-full h-fit flex flex-col gap-1.5 items-start justify-start">
            <div className="relative w-fit h-fit flex">Bio</div>
            <textarea
              disabled={accountLoading}
              onChange={(e) =>
                setAccount({
                  ...account,
                  bio: e.target.value,
                })
              }
              className="relative w-full bg-crema h-14 overflow-y-scroll border border-black focus:outline-none p-1"
              value={account?.bio}
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
          onClick={() => !accountLoading && handleCreateAccount()}
        >
          {accountLoading ? (
            <AiOutlineLoading size={15} className={`black animate-spin`} />
          ) : (
            "Create"
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
