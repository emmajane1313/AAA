const { ethers } = require("ethers");
const accessAbi = require("../abis/AccessControlsAbi.json");
const nftAbi = require("../abis/NFTAbi.json");
const marketAbi = require("../abis/MarketAbi.json");
const agentsAbi = require("../abis/AgentsAbi.json");
const devsAbi = require("../abis/DevTreasuryAbi.json");
const collectionAbi = require("../abis/CollectionManagerAbi.json");
const wgrassAbi = require("../abis/WGrassAbi.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lens.dev",
  37111
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const accessAddress = "0xE67406Beb8de9106D53A437ad230603F62450a96";
const marketAddress = "0xC726dCb8e5eBF5e6d6B9072FE090D09EFF6f623F";
const agentsAddress = "0xdE421E01Ecb93c29Ce0AF4809121F37B5b6653a1";
const nftAddress = "0xA59F17e1F6Cb963833C07bE904d9218db687a885";
const devAddress = "0x3E5D47795680ea6956190281dAE8bfB225d4B660";
const collectionAddress = "0x11d84C5067B6B45471B6e2E0A20D95Feb9Ea531a";
const GRASS_CONTRACT = "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8";

(async () => {
  // Access Controls
  const accessContract = new ethers.Contract(accessAddress, accessAbi, wallet);
  const feeData = await provider.getFeeData();

  console.log("Base Fee actual:", feeData);

    // const tx_1 = await accessContract.setAgentsContract(agentsAddress,  {
    //   gasLimit: 1000000,
    //   maxFeePerGas: feeData?.gasPrice,
    //   maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    // });
    // await tx_1.wait();

    // const tx_2 = await accessContract.setAcceptedToken(
    //   "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8", {
    //       gasLimit: 1000000,
    //       maxFeePerGas: feeData?.gasPrice,
    //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    //     }
    // );
    // await tx_2.wait();

    // const tx_3 = await accessContract.setTokenThreshold(
    //   "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8",
    //   "100000000000000000000",  {
    //       gasLimit: 1000000,
    //       maxFeePerGas: feeData?.gasPrice,
    //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    //     }
    // );
    // await tx_3.wait();

  //   const tx_4 = await accessContract.setAcceptedToken(
  //   GRASS_CONTRACT, {
  //       gasLimit: 1000000,
  //       maxFeePerGas: feeData?.gasPrice,
  //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //     }
  // );
  // await tx_4.wait();

  // const tx_5 = await accessContract.setTokenThreshold(
  //   GRASS_CONTRACT,
  //   "10000000000000000000",  {
  //       gasLimit: 1000000,
  //       maxFeePerGas: feeData?.gasPrice,
  //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //     }
  // );
  // await tx_5.wait();

  // Collection Manager
  const collectionContract = new ethers.Contract(
    collectionAddress,
    collectionAbi,
    wallet
  );

  const tx_coll_1 = await collectionContract.setMarket(marketAddress, {
    gasLimit: 1000000,
    maxFeePerGas: feeData?.gasPrice,
    maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  });
  await tx_coll_1.wait();

  // NFT
  const nftContract = new ethers.Contract(nftAddress, nftAbi, wallet);

  const tx_nft_1 = await nftContract.setMarket(marketAddress);
  await tx_nft_1.wait();

  // Market
  const marketContract = new ethers.Contract(marketAddress, marketAbi, wallet);
  // const collection = await marketContract.collectionManager();
  // const devTreasury = await marketContract.devTreasury();
  // const agents = await marketContract.agents();
  // console.log({ collection, devTreasury, agents });

  const tx_market_1 = await marketContract.setDevTreasury(devAddress);
  await tx_market_1.wait();

  const tx_market_2 = await marketContract.setCollectionManager(collectionAddress);
  await tx_market_2.wait();

  const tx_market_3 = await marketContract.setAgents(agentsAddress);
  await tx_market_3.wait();

  // Agents
  const agentsContract = new ethers.Contract(agentsAddress, agentsAbi, wallet);

  const tx_agent_1 = await agentsContract.setMarket(marketAddress);
  await tx_agent_1.wait();

  // const agentIds = await collectionContract.getCollectionAgentIds(5);
  // const amountSold = await collectionContract.getCollectionAmountSold(5);
  // const prices = await collectionContract.getCollectionPrices(5);
  // const threshold = await accessContract.getTokenThreshold(GRASS_CONTRACT);

  // console.log({ agentIds, amountSold, prices, threshold });
  // let balances = [];
  // let wallets = [];
  // for (let i = 0; i < agentIds?.length; i++) {
  //   const balance = await agentsContract.getAgentActiveBalance(
  //     GRASS_CONTRACT,
  //     agentIds[i],
  //     5
  //   );

  //   const wallet = await agentsContract.getAgentWallet(agentIds[i]);

  //   balances.push(balance);
  //   wallets.push(wallet);
  // }

  // console.log({ balances, wallets });

  // const wgrassContract = new ethers.Contract(GRASS_CONTRACT, wgrassAbi, wallet);

  // const balance = await wgrassContract.balanceOf("0xd2dA1a02403125c0DE8BC23417DeA9e6f09eD89a");
  // const allowance = await wgrassContract.allowance("0xd2dA1a02403125c0DE8BC23417DeA9e6f09eD89a", marketAddress);

  // const counter = await agentsContract.getAgentCounter();
  // console.log({ balance, allowance, counter });

  //   // Dev
  const devContract = new ethers.Contract(devAddress, devsAbi, wallet);
  // const market = await devContract.market();
  // const agents = await devContract.agents();
  // console.log({ market, agents });

  const tx_dev_1 = await devContract.setMarket(marketAddress);
  await tx_dev_1.wait();

  const tx_dev_2 = await devContract.setAgents(agentsAddress);
  await tx_dev_2.wait();
})();
