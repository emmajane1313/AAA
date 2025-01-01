"use client";
import { ModalContext } from "@/app/providers";
import { FunctionComponent, JSX, useContext } from "react";
import ImageViewer from "./ImageViewer";
import { useAccount } from "wagmi";
import CreateAccount from "./CreateAccount";
import Indexer from "./Indexer";
import Notification from "./Notification";
import Signless from "./Signless";

const Modals: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  const { address } = useAccount();
  return (
    <>
      {context?.indexer && (
        <Indexer indexer={context?.indexer} setIndexer={context?.setIndexer} />
      )}
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
          setIndexer={context?.setIndexer}
          storageClient={context?.storageClient!}
          setNotification={context?.setNotification}
        />
      )}
      {context?.signless && (
        <Signless
          setSignless={context?.setSignless}
          lensConnected={context?.lensConnected}
        />
      )}
      {context?.notification && (
        <Notification
          notification={context?.notification}
          setNotification={context?.setNotification}
        />
      )}
    </>
  );
};

export default Modals;
