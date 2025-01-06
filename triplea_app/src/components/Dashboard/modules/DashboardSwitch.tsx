import { FunctionComponent, JSX, useContext } from "react";
import useDashboard from "../hooks/useDashboard";
import { MintSwitcher, Switcher } from "../types/dashboard.types";
import Agents from "./Agents";
import MintSwitch from "./MintSwitch";
import Sales from "./Sales";
import Collects from "./Collects";
import { AnimationContext, ModalContext } from "@/app/providers";
import DropsSwitch from "./DropsSwitch";
import Account from "./Account";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useModal } from "connectkit";

const DashboardSwitch: FunctionComponent = (): JSX.Element => {
  const { address } = useAccount();
  const router = useRouter();
  const { setOpen, open } = useModal();
  const context = useContext(ModalContext);
  const animationContext = useContext(AnimationContext);
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
          storageClient={context?.storageClient!}
          setSignless={context?.setSignless!}
        />
      );

    case Switcher.Drops:
      return (
        <DropsSwitch
          setSwitcher={setSwitcher}
          allDrops={allDrops}
          allDropsLoading={allDropsLoading}
          lensClient={context?.lensClient!}
          agents={context?.agents!}
          setNotification={context?.setNotification!}
        />
      );

    case Switcher.Collects:
      return (
        <Collects lensClient={context?.lensClient!} setSwitcher={setSwitcher} />
      );

    case Switcher.Agents:
      return (
        <Agents
          setSwitcher={setSwitcher}
          address={address}
          lensClient={context?.lensClient!}
          setNotification={context?.setNotification!}
        />
      );

    case Switcher.Mint:
      return (
        <div className="relative w-full h-full  flex flex-col gap-4 items-start px-4 sm:px-20 py-10 justify-start">
          <div className="relative w-full h-full p-3 pixel-border-2 flex flex-col items-center justify-between gap-6">
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
            <MintSwitch
              mintSwitcher={mintSwitcher}
              setMintSwitcher={setMintSwitcher}
              agents={context?.agents!}
              setAgents={context?.setAgents!}
              allDrops={allDrops}
              allDropsLoading={allDropsLoading}
              lensConnected={context?.lensConnected!}
              tokenThresholds={context?.tokenThresholds!}
            />
            <div className="relative w-full h-fit flex items-end justify-between flex-row gap-4">
              <div
                className={`relative flex w-fit h-fit  ${
                  mintSwitcher > 0
                    ? "cursor-pixel hover:opacity-70"
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
                  mintSwitcher < 3
                    ? "cursor-pixel hover:opacity-70"
                    : "opacity-70"
                }`}
                onClick={() =>
                  setMintSwitcher(
                    mintSwitcher < 3 ? mintSwitcher + 1 : mintSwitcher
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

    case Switcher.Sales:
      return (
        <Sales lensClient={context?.lensClient!} setSwitcher={setSwitcher} />
      );

    default:
      return (
        <div className="relative w-full h-screen md:h-full flex items-center justify-center">
          <div className="relative w-full h-fit flex flex-wrap gap-10 items-center justify-center">
            {[
              {
                svg: (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                ),
                switcher: Switcher.Sales,
                title: "Sales",
                color: "#FFF026",
              },
              {
                svg: (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M9 2h6v2H9V2zm6 4V4h2v2h4v16H3V6h4V4h2v2h6zm0 2H9v2H7V8H5v12h14V8h-2v2h-2V8z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                ),
                switcher: Switcher.Collects,
                title: "Collects",
                color: "#FD91C6",
              },
              {
                svg: (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M10 2h4v4h-4V2zM7 7h10v2h-2v13h-2v-6h-2v6H9V9H7V7zM5 5v2h2V5H5zm0 0H3V3h2v2zm14 0v2h-2V5h2zm0 0V3h2v2h-2z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                ),
                switcher: Switcher.Agents,
                title: "Agents",
                color: "#5aacfa",
              },
              {
                svg: (
                  <svg
                    className="size-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path d="M13 2h-2v4h2V2Zm2 6H9v2H7v4h2v4h6v-4h2v-4h-2V8Zm0 2v4h-2v2h-2v-2H9v-4h6ZM9 20h6v2H9v-2Zm14-9v2h-4v-2h4ZM5 13v-2H1v2h4Zm12-7h2v2h-2V6Zm2 0h2V4h-2v2ZM5 6h2v2H5V6Zm0 0V4H3v2h2Z" />{" "}
                  </svg>
                ),
                switcher: Switcher.Drops,
                title: "Drops",
                color: "#E14C14",
              },
              {
                svg: (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M2 2h2v2H2V2zm4 4H4V4h2v2zm2 2H6V6h2v2zm2 2V8H8v2h2zm4 0h-4v4H2v8h8v-8h4v8h8v-8h-8v-4zm2-2v2h-2V8h2zm2-2v2h-2V6h2zm2-2h-2v2h2V4zm0 0V2h2v2h-2zM4 20v-4h4v4H4zm12 0v-4h4v4h-4z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                ),
                switcher: Switcher.Account,
                title: "Account",
                color: "white",
              },
              {
                svg: (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M4 3h10v2H4v14h16v-8h2v10H2V3h2zm10 6h-2v2h-2v2H8v2H6v2h2v-2h2v-2h2v-2h2v2h2v2h2v-2h-2v-2h-2V9zM8 7H6v2h2V7zm10-4h2v2h2v2h-2v2h-2V7h-2V5h2V3z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                ),
                switcher: Switcher.Mint,
                title: "Mint",
                color: "#EA4782",
              },
              {
                svg: (
                  <svg
                    className="size-6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    <path
                      d="M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z"
                      fill="currentColor"
                    />{" "}
                  </svg>
                ),
                switcher: Switcher.Page,
                title: "User Page",
                color: "#00cc00",
              },
            ].map(
              (
                item: {
                  switcher: Switcher;
                  svg: JSX.Element;
                  title: string;
                  color: string;
                },
                index
              ) => {
                return (
                  <div
                    className="relative w-14 h-14 flex pixel-border-4 rounded-xl items-center justify-center hover:opacity-70 cursor-pixel"
                    style={{
                      backgroundColor: item.color,
                    }}
                    onClick={() => {
                      if (!address) {
                        setOpen?.(!open);

                        return;
                      }
                      if (!context?.lensConnected?.profile) {
                        context?.setNotification("Sign in to Lens!");
                        return;
                      }

                      if (item.switcher == Switcher.Page) {
                        animationContext?.setPageChange?.(true);
                        router.push(
                          `/user/${context?.lensConnected?.profile?.username?.localName}`
                        );
                      } else {
                        setSwitcher(item.switcher);
                      }
                    }}
                    key={index}
                    title={item.title}
                  >
                    {item.svg}
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
