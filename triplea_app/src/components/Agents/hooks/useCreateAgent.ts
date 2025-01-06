import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useState } from "react";
import { createWalletClient, custom, decodeEventLog, PublicClient } from "viem";
import { AgentDetails, CreateSwitcher } from "../types/agents.types";
import { ACCESS_CONTROLS_CONTRACT, AGENTS_CONTRACT } from "@/lib/constants";
import AgentAbi from "@abis/AgentAbi.json";
import { LensConnected } from "@/components/Common/types/common.types";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { v4 as uuidv4 } from "uuid";
import createAccount from "../../../../graphql/lens/mutations/createAccount";
import {
  evmAddress,
  PublicClient as PublicClientLens,
} from "@lens-protocol/client";
import pollResult from "@/lib/helpers/pollResult";
import fetchAccount from "../../../../graphql/lens/queries/account";
import { Contract, Wallet, HDNodeWallet, JsonRpcProvider } from "ethers";
import forge from "node-forge";
import { enableSignless } from "@lens-protocol/client/actions";
import AccessControlsAbi from "@abis/AccessControlsAbi.json";

const useCreateAgent = (
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setCreateSwitcher: (e: SetStateAction<CreateSwitcher>) => void,
  lensConnected: LensConnected | undefined,
  setIndexer: (e: SetStateAction<string | undefined>) => void,
  storageClient: StorageClient,
  setNotification: (e: SetStateAction<string | undefined>) => void,
  lensClient: PublicClientLens
) => {
  const [createAgentLoading, setCreateAgentLoading] = useState<boolean>(false);
  const [agentWallet, setAgentWallet] = useState<HDNodeWallet | undefined>();
  const [lensLoading, setLensLoading] = useState<boolean>(false);
  const [id, setId] = useState<string | undefined>();
  const [agentAccountAddress, setAgentAccountAddress] = useState<
    string | undefined
  >();
  const [agentDetails, setAgentDetails] = useState<AgentDetails>({
    title: "",
    cover: undefined,
    description: "",
    customInstructions: "",
  });
  const [agentLensDetails, setAgentLensDetails] = useState<{
    localname: string;
    bio: string;
    username: string;
    pfp?: Blob;
  }>({
    localname: agentDetails?.title,
    bio: agentDetails?.description,
    username: "",
    pfp: agentDetails?.cover,
  });

  const handleCreateAccount = async () => {
    if (!address || !lensConnected?.sessionClient) return;
    setLensLoading(true);
    try {
      let picture = {};

      if (agentLensDetails?.pfp || agentDetails?.cover) {
        const res = await fetch("/api/ipfs", {
          method: "POST",
          body: agentLensDetails?.pfp
            ? agentLensDetails?.pfp
            : agentDetails?.cover,
        });
        const json = await res.json();
        const { uri } = await storageClient.uploadAsJson({
          type: "image/png",
          item: "ipfs://" + json?.cid,
        });

        picture = {
          picture: uri,
        };
      }

      const { uri } = await storageClient.uploadAsJson({
        $schema: "https://json-schemas.lens.dev/account/1.0.0.json",
        lens: {
          id: uuidv4(),
          name:
            agentLensDetails?.localname?.trim() == ""
              ? agentDetails?.title
              : agentLensDetails?.localname,
          bio:
            agentLensDetails?.bio?.trim() == ""
              ? agentDetails?.description
              : agentLensDetails?.bio,
          ...picture,
        },
      });

      const provider = new JsonRpcProvider(
        "https://rpc.testnet.lens.dev",
        37111
      );
      const agentWalletCreated = Wallet.createRandom(provider);

      const authenticatedOnboarding = await lensClient.login({
        onboardingUser: {
          app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
          wallet: agentWalletCreated.address,
        },
        signMessage: (message) => agentWalletCreated.signMessage(message),
      });

      if (authenticatedOnboarding.isOk()) {
        const accountResponse = await createAccount(
          {
            accountManager: [evmAddress(agentWalletCreated.address)],
            username: {
              localName: agentLensDetails?.username,
            },
            metadataUri: uri,
          },
          authenticatedOnboarding.value
        );

        if (
          (accountResponse as any)?.message?.includes("username already exists")
        ) {
          setNotification("Username Already Taken. Try something else?");
          setLensLoading(false);
          return;
        }

        if ((accountResponse as any)?.hash) {
          const res = await pollResult(
            (accountResponse as any)?.hash,
            lensConnected?.sessionClient
          );
          if (res) {
            const newAcc = await fetchAccount(
              {
                username: {
                  localName: agentLensDetails?.username,
                },
              },
              lensConnected?.sessionClient
            );

            if ((newAcc as any)?.address) {
              const authenticated = await lensClient.login({
                accountOwner: {
                  app: "0xe5439696f4057aF073c0FB2dc6e5e755392922e1",
                  account: evmAddress((newAcc as any)?.address),
                  owner: agentWalletCreated.address?.toLowerCase(),
                },
                signMessage: (message) =>
                  agentWalletCreated.signMessage(message),
              });

              if (authenticated.isOk()) {
                const res = await enableSignless(authenticated.value);

                if (res.isErr()) {
                  console.error(res.error);

                  setIndexer?.("Error with Enabling Signless");
                  setLensLoading(false);
                } else {
                  const responseKey = await fetch("/api/faucet", {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      address: agentWalletCreated.address,
                    }),
                  });

                  let tx_res = await responseKey.json();

                  if (tx_res?.tx) {
                    const tx = {
                      chainId: (res.value as any)?.raw?.chainId,
                      from: (res.value as any)?.raw?.from,
                      to: (res.value as any)?.raw?.to,
                      nonce: (res.value as any)?.raw?.nonce,
                      gasLimit: (res.value as any)?.raw?.gasLimit,
                      maxFeePerGas: (res.value as any)?.raw?.maxFeePerGas,
                      maxPriorityFeePerGas: (res.value as any)?.raw
                        ?.maxPriorityFeePerGas,
                      value: (res.value as any)?.raw?.value,
                      data: (res.value as any)?.raw?.data,
                    };
                    const txResponse = await agentWalletCreated.sendTransaction(
                      tx
                    );
                    await txResponse.wait();
                    if (txResponse) {
                      setCreateSwitcher(CreateSwitcher.Create);
                      setAgentWallet(agentWalletCreated);
                      setAgentAccountAddress((newAcc as any)?.address);
                    } else {
                      setIndexer?.("Error with Enabling Signless");
                      setLensLoading(false);
                      return;
                    }
                  } else {
                    setIndexer?.("Error with Enabling Signless");
                    setLensLoading(false);
                    return;
                  }
                }
              } else {
                console.error(accountResponse);
                setIndexer?.("Error Enabling Signless Transactions.");
                setLensLoading(false);
                return;
              }
            } else {
              console.error(accountResponse);
              setIndexer?.("Error with Fetching New Account");
              setLensLoading(false);
              return;
            }
          } else {
            console.error(accountResponse);
            setIndexer?.("Error with Account Creation");
            setLensLoading(false);
            return;
          }
        } else {
          console.error(accountResponse);
          setIndexer?.("Error with Account Creation");
          setLensLoading(false);
          return;
        }
      } else {
        setNotification("Error creating Lens Account. Try again?");
        setLensLoading(false);
        return;
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setLensLoading(false);
  };

  const handleCreateAgent = async () => {
    if (
      !address ||
      agentDetails?.title?.trim() == "" ||
      agentDetails?.description?.trim() == "" ||
      agentDetails?.customInstructions?.trim() == "" ||
      !agentDetails?.cover
    )
      return;

    if (!agentAccountAddress || !agentWallet) {
      setNotification?.("Create your Agent's Lens Account!");
      return;
    }
    setCreateAgentLoading(true);
    try {
      const clientWallet = createWalletClient({
        chain: chains.testnet,
        transport: custom((window as any).ethereum),
      });

      const responseImage = await fetch("/api/ipfs", {
        method: "POST",
        body: agentDetails?.cover,
      });

      if (!responseImage.ok) {
        const errorText = await responseImage.text();
        console.error("Error from API:", errorText);
        setCreateAgentLoading(false);
        return;
      }

      const responseImageJSON = await responseImage.json();

      const response = await fetch("/api/ipfs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: agentDetails.title,
          description: agentDetails.description,
          cover: "ipfs://" + responseImageJSON.cid,
          customInstructions: agentDetails.customInstructions,
        }),
      });

      let responseJSON = await response.json();

      const { request } = await publicClient.simulateContract({
        address: AGENTS_CONTRACT,
        abi: AgentAbi,
        functionName: "createAgent",
        chain: chains.testnet,
        args: [[agentWallet.address], "ipfs://" + responseJSON?.cid],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: res,
      });
      const logs = receipt.logs;
      let agentId: number = 0;

      logs
        .map((log) => {
          try {
            const event = decodeEventLog({
              abi: AgentAbi,
              data: log.data,
              topics: log.topics,
            });
            if (event.eventName == "AgentCreated") {
              agentId = Number((event.args as any)?.id);
              setId(Number((event.args as any)?.id).toString());
            }
          } catch (err) {
            return null;
          }
        })
        .filter((event) => event !== null);

      const responsePublicKey = await fetch("/api/public-key");
      const { publicKey } = await responsePublicKey.json();

      const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);
      const encryptedPrivateKey = forge.util.encode64(
        rsaPublicKey.encrypt(agentWallet.privateKey, "RSA-OAEP")
      );

      const responseKey = await fetch("/api/encrypt", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          encryptedPrivateKey,
        }),
      });

      let responseKeyJSON = await responseKey.json();

      const data = {
        publicAddress: agentWallet.address,
        encryptionDetails: responseKeyJSON.encryptionDetails,
        id: agentId,
        title: agentDetails.title,
        description: agentDetails.description,
        cover: "ipfs://" + responseImageJSON.cid,
        customInstructions: agentDetails.customInstructions,
        accountAddress: agentAccountAddress,
      };

      const newSocket = new WebSocket(
        // `ws://127.0.0.1:10000?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
        `wss://aaa-6t0j.onrender.com?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
      );

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newSocket.onopen = () => {
        newSocket.send(JSON.stringify(data));
      };

      setAgentDetails({
        title: "",
        cover: undefined,
        description: "",
        customInstructions: "",
      });
      setAgentLensDetails({
        localname: "",
        bio: "",
        username: "",
      });
      setCreateSwitcher(CreateSwitcher.Success);
    } catch (err: any) {
      console.error(err.message);
    }
    setCreateAgentLoading(false);
  };

  return {
    createAgentLoading,
    handleCreateAgent,
    id,
    agentDetails,
    setAgentDetails,
    agentLensDetails,
    setAgentLensDetails,
    lensLoading,
    handleCreateAccount,
    agentWallet,
  };
};

export default useCreateAgent;
