"use client";
import { FunctionComponent, useEffect } from "react";
import { ErrorsProps } from "../types/modals.types";

const Errors: FunctionComponent<ErrorsProps> = ({ error, setError }) => {
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(undefined);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="fixed bottom-5 right-5 w-fit h-fit z-200">
      <div className="w-fit h-10 sm:h-16 flex items-center justify-center border border-crema bg-morado text-black rounded-md">
        <div className="relative w-fit h-fit flex items-center justify-center px-4 py-2 text-xs sm:text-base">
          {error}
        </div>
      </div>
    </div>
  );
};

export default Errors;
