"use client";

import AgentSwitch from "@/components/Agents/modules/AgentSwitch";
import {
  AgentSwitcher,
  CreateSwitcher,
} from "@/components/Agents/types/agents.types";
import Slider from "@/components/Common/modules/Slider";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useModal } from "connectkit";

export default function Agents() {
  const [agentSwitcher, setAgentSwitcher] = useState<AgentSwitcher>(
    AgentSwitcher.Gallery
  );
  const [createSwitcher, setCreateSwitcher] = useState<CreateSwitcher>(
    CreateSwitcher.Details
  );
  const { setOpen, open } = useModal();
  const { isConnected } = useAccount();
  return (
    <>
      <Slider />
      <div className="relative w-full h-fit flex items-end justify-end">
        <div
          className="relative w-40 h-10 flex pixel-border-4 bg-[#E14C14] rounded-xl items-center justify-between hover:opacity-70 cursor-pixel flex-row gap-2 px-2"
          title={"Create Agent"}
          onClick={() => {
            if (isConnected) {
              setAgentSwitcher(AgentSwitcher.Create);
              setCreateSwitcher(CreateSwitcher.Details);
            } else {
              setOpen?.(!open);
            }
          }}
        >
          <svg
            className="size-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              d="M4 2h4v4H4V2zM1 7h10v9H9v6H7v-6H5v6H3v-6H1V7zm18-5h-2v2h-2v2h-2v2h2V6h2v12h-2v-2h-2v2h2v2h2v2h2v-2h2v-2h2v-2h-2v2h-2V6h2v2h2V6h-2V4h-2V2z"
              fill="currentColor"
            />{" "}
          </svg>
          <svg
            className="size-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              d="M15 9V7h2v2h-2zm2 6v-2h-4v-2h4V9h2v2h2v2h-2v2h-2zm0 0v2h-2v-2h2zm-6-4v2H7v2H5v-2H3v-2h2V9h2v2h4zm-4 4h2v2H7v-2zm2-8v2H7V7h2z"
              fill="currentColor"
            />{" "}
          </svg>
          <svg
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="size-6"
          >
            <path
              d="M10 3H8v2H6v2h2V5h2v2h2v2h-2v2H8v2H6v2H4v-2H2v2h2v2h2v-2h4v2h2v2h-2v2h2v-2h2v-2h-2v-4h2v-2h2v2h2v2h2v-2h2v-2h-2v2h-2v-2h-2V9h2V5h-4v2h-2V5h-2V3z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      <AgentSwitch
        agentSwitcher={agentSwitcher}
        setAgentSwitcher={setAgentSwitcher}
        createSwitcher={createSwitcher}
        setCreateSwitcher={setCreateSwitcher}
      />
    </>
  );
}
