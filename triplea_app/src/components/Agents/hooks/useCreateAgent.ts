import { chains } from "@lens-network/sdk/viem";
import { SetStateAction, useState } from "react";
import { createWalletClient, custom, decodeEventLog, PublicClient } from "viem";
import { AgentDetails, CreateSwitcher } from "../types/agents.types";
import { AGENTS_CONTRACT } from "@/lib/constants";
import AgentAbi from "@abis/AgentAbi.json";
import { LensConnected } from "@/components/Common/types/common.types";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { v4 as uuidv4 } from "uuid";
import createAccount from "../../../../graphql/lens/mutations/createAccount";
import { evmAddress } from "@lens-protocol/client";
import pollResult from "@/lib/helpers/pollResult";
import fetchAccount from "../../../../graphql/lens/queries/account";
import { ethers } from "ethers";
import forge from "node-forge";

const useCreateAgent = (
  publicClient: PublicClient,
  address: `0x${string}` | undefined,
  setCreateSwitcher: (e: SetStateAction<CreateSwitcher>) => void,
  lensConnected: LensConnected | undefined,
  setIndexer: (e: SetStateAction<string | undefined>) => void,
  storageClient: StorageClient,
  setNotification: (e: SetStateAction<string | undefined>) => void
) => {
  const [createAgentLoading, setCreateAgentLoading] = useState<boolean>(false);
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
      const signer = createWalletClient({
        chain: chains.testnet,
        transport: custom(window.ethereum!),
        account: address,
      });

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

      const accountResponse = await createAccount(
        {
          accountManager: [evmAddress(signer.account.address)],
          username: {
            localName: agentLensDetails?.username,
          },
          metadataUri: uri,
        },
        lensConnected?.sessionClient
      );

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
            setCreateSwitcher(CreateSwitcher.Create);
            setAgentAccountAddress((newAcc as any)?.address);
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

    // if (!agentAccountAddress) {
    //   setNotification?.("Create your Agent's Lens Account!");
    //   return;
    // }
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

      const agentWallet = ethers.Wallet.createRandom();

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
        encryptedPrivateKey: responseKeyJSON.encryptedPrivateKey,
        id: agentId,
        title: agentDetails.title,
        description: agentDetails.description,
        cover: "ipfs://" + responseImageJSON.cid,
        customInstructions: agentDetails.customInstructions,
        accountAddress: agentAccountAddress,
      };

      console.log({ data });

      const newSocket = new WebSocket(
        `ws://127.0.0.1:10000?key=${process.env.NEXT_PUBLIC_RENDER_KEY}`
      );

      newSocket.onopen = () => {
        console.log("enviando!!!")
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
  };
};

export default useCreateAgent;
