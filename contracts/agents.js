const { ethers, keccak256, toUtf8Bytes } = require("ethers");
const agentsAbi = require("../abis/AgentsAbi.json");
const accessAbi = require("../abis/AccessControlsAbi.json");
const treasuryAbi = require("../abis/DevTreasuryAbi.json");
const marketAbi = require("../abis/MarketAbi.json");
const collectionAbi = require("../abis/CollectionManagerAbi.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lens.dev",
  37111
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const agentsAddress = "0xA36B994da5Bc7a666cbF3192d2c043193D300FE0";
const accessAddress = "0x6B2d2cC4C4FA010f9ee6a8e1EbB2b914FA98A438";
const marketAddress = "0x2d1e70BF010318B6597154C159BFe1EC805495C7";
const treasuryAddress = "0x1651c9ee7018C78EA46EE13EdC8cD0Bc82D38F61";
const GM_CONTRACT = "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8";
const collectionAddress = "0xC094c540e003cBC2b7A30D35C8148B5792568Af4";

(async () => {
  const feeData = await provider.getFeeData();
  const agentsContract = new ethers.Contract(agentsAddress, agentsAbi, wallet);
  const accessContract = new ethers.Contract(accessAddress, accessAbi, wallet);
  const marketContract = new ethers.Contract(marketAddress, marketAbi, wallet);
  const treasuryContract = new ethers.Contract(
    treasuryAddress,
    treasuryAbi,
    wallet
  );
  const collectionContract = new ethers.Contract(
    collectionAddress,
    collectionAbi,
    wallet
  );

  const errores = [
    "NotAdmin()",
    "AlreadyAdmin()",
    "CannotRemoveSelf()",
    "AgentDoesntExist()",
    "AdminDoesntExist()",
    "AdminAlreadyExists()",
    "AgentAlreadyExists()",
    "OnlyAgentContract()",
    "TokenAlreadyExists()",
    "TokenDoesntExist()",
    "DropInvalid()",
    "OnlyMarketContract()",
    "ZeroAddress()",
    "InvalidAmount()",
    "NotArtist()",
    "CantDeleteSoldCollection()",
    "NotAvailable()",
    "TokenNotAccepted()",
    "PaymentFailed()",
    "OnlyAgentsContract()",
    "NotAgent()",
    "InsufficientBalance()",
  ];

  for (let i = 0; i < errores.length; i++) {
    console.log(
      errores[i],
      " ",
      keccak256(toUtf8Bytes(errores[i])).slice(0, 10),
      "\n"
    );
  }

  console.log("Base Fee actual:", feeData);

  const agents_access = await accessContract.agentsContract();
  const agents_treasury = await treasuryContract.agents();
  const agents_market = await marketContract.agents();
  const balance1 = await agentsContract.getAgentActiveBalance(
    GM_CONTRACT,
    1,
    1
  );
  const balance2 = await agentsContract.getAgentActiveBalance(
    GM_CONTRACT,
    2,
    1
  );
  const balance3 = await agentsContract.getAgentActiveBalance(
    GM_CONTRACT,
    3,
    1
  );
  const balance4 = await agentsContract.getAgentActiveBalance(
    GM_CONTRACT,
    4,
    1
  );
  const meta1 = await agentsContract.getAgentMetadata(1);
  const meta2 = await agentsContract.getAgentMetadata(2);
  const meta3 = await agentsContract.getAgentMetadata(3);
  const meta4 = await agentsContract.getAgentMetadata(4);
  const agents = await collectionContract.getCollectionAgentIds(1);
  console.log({
    agents_access,
    agents_treasury,
    agents_market,
    balance1,
    balance2,
    balance3,
    balance4,
    agents,
    meta1,
    meta2,
    meta3,
    meta4,
  });

  // const tx_set_1 = await accessContract.setAgentsContract(agentsAddress)
  // await tx_set_1.wait();

  // const tx_remove_1 = await agentsContract.deleteAgent(1)
  // await tx_remove_1.wait();
  // const tx_remove_2 = await accessContract.deleteAgent(1)
  // await tx_remove_2.wait();
  // const tx_remove_3 = await accessContract.deleteAgent(2)
  // await tx_remove_3.wait();
  // const tx_remove_4 = await accessContract.deleteAgent(3)
  // await tx_remove_4.wait();

  // const tx_agent_1 = await agentsContract.createAgent(
  //   "ipfs://QmaAcy5ULMG6fv2LTEFAuYyEXLCSdoR38RTVmnN2fbaG34",
  //   "0x87dD364f74f67f1e13126D6Fd9a31b7d78C2cC12",
  //   // {
  //   //   gasLimit: 1000000,
  //   //   maxFeePerGas: feeData?.gasPrice,
  //   //   maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //   // }
  // );
  // await tx_agent_1.wait();

  // const tx_agent_2 = await agentsContract.createAgent(
  //   "ipfs://QmWXkGh6QARjkXCYdigY3GQk1segNk3pLYadFQeKZL5cxH",
  //   "0x9bBca90ea8F188403fAB15Cd5bad4F9a46f56257",
  //   {
  //     gasLimit: 1000000,
  //     maxFeePerGas: feeData?.gasPrice,
  //     maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //   }
  // );
  // await tx_agent_2.wait();

  // const tx_agent_3 = await agentsContract.createAgent(
  //   "ipfs://QmdvyAbV8ZPbbsqgCZeX6JxCmurk9tFSvPrKgK4RsQy72T",
  //   "0xa8ac1e95a53c79Eae348491f678A1Cf0c2F2519e",
  //   {
  //     gasLimit: 1000000,
  //     maxFeePerGas: feeData?.gasPrice,
  //     maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //   }
  // );
  // await tx_agent_3.wait();

  // const counter =  await agentsContract.getAgentCounter();
  // const id =  await agentsContract.getAgentWallet(1);
  // const isAgent =  await accessContract.isAgent("0x8241Ee5A9f23611Ef6535B6c7E71ae24913306EC");
  // console.log({counter, id,isAgent})

  // const tx_agent_4 = await agentsContract.createAgent(
  //   "ipfs://Qmc76wMVu8hy4wM7hkepLMP3WFk3yk7TWdeQnriUDqVN8q",
  //   "0x8241Ee5A9f23611Ef6535B6c7E71ae24913306EC",
  //   // {
  //   //   gasLimit: 1000000,
  //   //   maxFeePerGas: feeData?.gasPrice,
  //   //   maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //   // }
  // );
  // await tx_agent_4.wait();
})();
