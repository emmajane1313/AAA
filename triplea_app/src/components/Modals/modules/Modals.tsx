"use client";
import { ModalContext } from "@/app/providers";
import { FunctionComponent, JSX, useContext } from "react";
import ImageViewer from "./ImageViewer";
import { useAccount } from "wagmi";
import CreateAccount from "./CreateAccount";
import Errors from "./Errors";
import Notification from "./Notification";

const Modals: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const { address } = useAccount();
  return (
    <>
      {context?.error && (
        <Errors error={context?.error} setError={context?.setError} />
      )}
      {context?.imageView && (
        <ImageViewer
          imageView={context?.imageView}
          setImageView={context?.setImageView}
        />
      )}
      {context?.notification && (
        <Notification
          notification={context?.notification}
          setNotification={context?.setNotification}
        />
      )}
      {context?.createAccount && (
        <CreateAccount
          address={address}
          setLensConnected={context?.setLensConnected}
          lensConnected={context?.lensConnected}
          setCreateAccount={context?.setCreateAccount}
          setError={context?.setError}
          storageClient={context?.storageClient!}
        />
      )}
    </>
  );
};

export default Modals;
