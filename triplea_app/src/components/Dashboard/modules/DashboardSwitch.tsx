import { FunctionComponent, JSX, useContext } from "react";
import useDashboard from "../hooks/useDashboard";
import { MintSwitcher, Switcher } from "../types/dashboard.types";
import Agents from "./Agents";
import MintSwitch from "./MintSwitch";
import Sales from "./Sales";
import Collects from "./Collects";
import { ModalContext } from "@/app/providers";
import DropsSwitch from "./DropsSwitch";
import Account from "./Account";
import { useAccount } from "wagmi";

const DashboardSwitch: FunctionComponent = (): JSX.Element => {
  const { address } = useAccount();
  const context = useContext(ModalContext);
  const {
    setSwitcher,
    switcher,
    mintSwitcher,
    setMintSwitcher,
    allDrops,
    allDropsLoading,
  } = useDashboard(address, context?.lensConnected);

  switch (switcher) {
    case Switcher.Account:
      return (
        <Account
          setSwitcher={setSwitcher}
          lensConnected={context?.lensConnected}
          setLensConnected={context?.setLensConnected!}
        />
      );

    case Switcher.Drops:
      return (
        <DropsSwitch
          setSwitcher={setSwitcher}
          allDrops={allDrops}
          allDropsLoading={allDropsLoading}
          lensClient={context?.lensClient!}
        />
      );

    case Switcher.Collects:
      return (
        <Collects lensClient={context?.lensClient!} setSwitcher={setSwitcher} />
      );

    case Switcher.Agents:
      return (
        <Agents
          setAgents={context?.setAgents!}
          agents={context?.agents!}
          setSwitcher={setSwitcher}
          lensConnected={context?.lensConnected!}
        />
      );

    case Switcher.Mint:
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
            <MintSwitch
              mintSwitcher={mintSwitcher}
              setMintSwitcher={setMintSwitcher}
              agents={context?.agents!}
              setAgents={context?.setAgents!}
              allDrops={allDrops}
              allDropsLoading={allDropsLoading}
              lensConnected={context?.lensConnected!}
            />
            <div className="relative w-full h-fit flex items-end justify-between flex-row gap-4">
              <div
                className={`relative flex w-fit h-fit  ${
                  mintSwitcher > 0
                    ? "cursor-pointer hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setMintSwitcher(
                    mintSwitcher !== MintSwitcher.Success
                      ? mintSwitcher > 0
                        ? mintSwitcher - 1
                        : mintSwitcher
                      : 0
                  )
                }
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
              <div
                className={`relative flex w-fit h-fit  ${
                  mintSwitcher < 3
                    ? "cursor-pointer hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setMintSwitcher(
                    mintSwitcher < 3 ? mintSwitcher + 1 : mintSwitcher
                  )
                }
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
                    d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );

    case Switcher.Sales:
      return (
        <Sales lensClient={context?.lensClient!} setSwitcher={setSwitcher} />
      );

    default:
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full h-fit flex flex-wrap gap-10 items-center justify-center">
            {[
              {
                svg: (
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
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                ),
                switcher: Switcher.Sales,
                title: "Sales",
              },
              {
                svg: (
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
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                ),
                switcher: Switcher.Collects,
                title: "Collects",
              },
              {
                svg: (
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
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                ),
                switcher: Switcher.Agents,
                title: "Agents",
              },
              {
                svg: (
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
                      d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                    />
                  </svg>
                ),
                switcher: Switcher.Drops,
                title: "Drops",
              },
              {
                svg: (
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
                      d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                    />
                  </svg>
                ),
                switcher: Switcher.Account,
                title: "Account",
              },
              {
                svg: (
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
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                ),
                switcher: Switcher.Mint,
                title: "Mint",
              },
            ].map(
              (
                item: {
                  switcher: Switcher;
                  svg: JSX.Element;
                  title: string;
                },
                index
              ) => {
                return (
                  <div
                    key={index}
                    title={item.title}
                    className="relative w-20 h-20 flex items-center justify-center shadow-md rounded-full cursor-pointer border border-morado p-px hover:opacity-70 hover:scale-95"
                    onClick={() => setSwitcher(item.switcher)}
                  >
                    <div className="relative w-full h-full rounded-full border border-cielo p-px flex items-center justify-center">
                      <div className="relative w-full h-full rounded-full border border-oscuro p-px flex items-center justify-center">
                        {item.svg}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      );
  }
};

export default DashboardSwitch;
