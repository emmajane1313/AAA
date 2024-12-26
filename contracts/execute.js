const { ethers } = require("ethers");
const accessAbi = require("../abis/AccessControlsAbi.json");
const nftAbi = require("../abis/NFTAbi.json");
const marketAbi = require("../abis/MarketAbi.json");
const agentsAbi = require("../abis/AgentsAbi.json");
const devsAbi = require("../abis/DevTreasuryAbi.json");
const collectionAbi = require("../abis/CollectionManagerAbi.json");
const gmAbi = require("../abis/GMAbi.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lens.dev",
  37111
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const accessAddress = "0x6B2d2cC4C4FA010f9ee6a8e1EbB2b914FA98A438";
const marketAddress = "0x2d1e70BF010318B6597154C159BFe1EC805495C7";
const agentsAddress = "0xA36B994da5Bc7a666cbF3192d2c043193D300FE0";
const nftAddress = "0x95De12097eE75B3281cD6EfA50158eCE51c79c0b";
const devAddress = "0x1651c9ee7018C78EA46EE13EdC8cD0Bc82D38F61";
const collectionAddress = "0xC094c540e003cBC2b7A30D35C8148B5792568Af4";
const GM_CONTRACT = "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8";

(async () => {
  // Access Controls
  const accessContract = new ethers.Contract(accessAddress, accessAbi, wallet);
  const feeData = await provider.getFeeData();

  console.log("Base Fee actual:", feeData);

    const tx_1 = await accessContract.setAgentsContract(agentsAddress,  {
      gasLimit: 1000000,
      maxFeePerGas: feeData?.gasPrice,
      maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    });
    await tx_1.wait();

  //   const tx_2 = await accessContract.setAcceptedToken(
  //     "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8", {
  //         gasLimit: 1000000,
  //         maxFeePerGas: feeData?.gasPrice,
  //         maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //       }
  //   );
  //   await tx_2.wait();

  //   const tx_3 = await accessContract.setTokenThreshold(
  //     "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8",
  //     "100000000000000000000",  {
  //         gasLimit: 1000000,
  //         maxFeePerGas: feeData?.gasPrice,
  //         maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //       }
  //   );
  //   await tx_3.wait();

  //   const tx_4 = await accessContract.setAcceptedToken(
  //   GM_CONTRACT, {
  //       gasLimit: 1000000,
  //       maxFeePerGas: feeData?.gasPrice,
  //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //     }
  // );
  // await tx_4.wait();

  // const tx_5 = await accessContract.setTokenThreshold(
  //   GM_CONTRACT,
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
  // const threshold = await accessContract.getTokenThreshold(GM_CONTRACT);

  // console.log({ agentIds, amountSold, prices, threshold });
  // let balances = [];
  // let wallets = [];
  // for (let i = 0; i < agentIds?.length; i++) {
  //   const balance = await agentsContract.getAgentActiveBalance(
  //     GM_CONTRACT,
  //     agentIds[i],
  //     5
  //   );

  //   const wallet = await agentsContract.getAgentWallet(agentIds[i]);

  //   balances.push(balance);
  //   wallets.push(wallet);
  // }

  // console.log({ balances, wallets });

  // const gmContract = new ethers.Contract(GM_CONTRACT, gmAbi, wallet);

  // const balance = await gmContract.balanceOf("0xd2dA1a02403125c0DE8BC23417DeA9e6f09eD89a");
  // const allowance = await gmContract.allowance("0xd2dA1a02403125c0DE8BC23417DeA9e6f09eD89a", marketAddress);

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
