import { FunctionComponent, JSX, useContext, useState } from "react";
import AgentGallery from "./AgentGallery";
import {
  AgentSwitcher,
  AgentSwitchProps,
  CreateSwitcher,
} from "../types/agents.types";
import CreateSwitch from "./CreateSwitch";
import { ModalContext } from "@/app/providers";

const AgentSwitch: FunctionComponent<AgentSwitchProps> = ({
  agentSwitcher,
  setAgentSwitcher,
  createSwitcher,
  setCreateSwitcher,
}): JSX.Element => {
  const context = useContext(ModalContext);
  switch (agentSwitcher) {
    case AgentSwitcher.Create:
      return (
        <div className="relative w-full h-full flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
          <div className="relative w-full h-full p-3 pixel-border-2 flex flex-col items-center justify-between gap-6">
            <div className="relative w-full h-fit flex items-start justify-start">
              <div
                className="relative flex w-fit h-fit cursor-pixel hover:opacity-70"
                onClick={() => setAgentSwitcher(AgentSwitcher.Gallery)}
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
            <CreateSwitch
              createSwitcher={createSwitcher}
              setCreateSwitcher={setCreateSwitcher}
              setIndexer={context?.setIndexer!}
              storageClient={context?.storageClient!}
              lensConnected={context?.lensConnected}
              setNotifcation={context?.setNotification!}
              lensClient={context?.lensClient!}
            />
            <div className="relative w-full h-fit flex items-end justify-between flex-row gap-4">
              <div
                className={`relative flex w-fit h-fit  ${
                  createSwitcher > 0
                    ? "cursor-pixel hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setCreateSwitcher(
                    createSwitcher !== CreateSwitcher.Success
                      ? createSwitcher > 0
                        ? createSwitcher - 1
                        : createSwitcher
                      : 0
                  )
                }
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
              <div
                className={`relative flex w-fit h-fit  ${
                  createSwitcher < 2
                    ? "cursor-pixel hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setCreateSwitcher(
                    createSwitcher < 2 ? createSwitcher + 1 : createSwitcher
                  )
                }
              >
                <svg
                  className="size-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z"
                    fill="currentColor"
                  />{" "}
                </svg>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <AgentGallery />;
  }
};

export default AgentSwitch;
