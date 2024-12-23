"use client";
import { ModalContext } from "@/app/providers";
import { FunctionComponent, JSX, useContext } from "react";
import ImageViewer from "./ImageViewer";
import { useAccount } from "wagmi";
import CreateAccount from "./CreateAccount";

const Modals: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const { address } = useAccount();
  return (
    <>
      {context?.imageView && (
        <ImageViewer
          imageView={context?.imageView}
          setImageView={context?.setImageView}
        />
      )}
      {context?.createAccount && (
        <CreateAccount
          address={address}
          setLensConnected={context?.setLensConnected}
          lensConnected={context?.lensConnected}
          setCreateAccount={context?.setCreateAccount}
        />
      )}
    </>
  );
};

export default Modals;
