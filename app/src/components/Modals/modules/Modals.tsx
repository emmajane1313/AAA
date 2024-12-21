"use client";
import { ModalContext } from "@/app/providers";
import { FunctionComponent, JSX, useContext } from "react";
import ImageViewer from "./ImageViewer";

const Modals: FunctionComponent = (): JSX.Element => {
  const context = useContext(ModalContext);
  return (
    <>
      {context?.imageView && (
        <ImageViewer
          imageView={context?.imageView}
          setImageView={context?.setImageView}
        />
      )}
    </>
  );
};

export default Modals;
