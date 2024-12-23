const { ethers } = require("ethers");
const accessAbi = require("../abis/AccessControlsAbi.json");
const nftAbi = require("../abis/NFTAbi.json");
const marketAbi = require("../abis/MarketAbi.json");
const agentsAbi = require("../abis/AgentsAbi.json");
const devsAbi = require("../abis/DevTreasuryAbi.json");
const collectionAbi = require("../abis/CollectionManagerAbi.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lens.dev",
  37111
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const accessAddress = "0x064bBEAa906BC36b9148BcF67088F65596aA10fe";
const marketAddress = "0xE50016e155Cf193E92cA48140Ee2501dB6f0F182";
const agentsAddress = "0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a";
const nftAddress = "0xe2579cb9f04b4621A2BC5BA6D8D945D7C72C1dcE";
const devAddress = "0x5C0A269B04d02861853A3C714b4cCBA739e75Fe2";
const collectionAddress = "0x839d0C63495BeA892e292Be6DE7410BB93948F2E";

(async () => {
  // Access Controls
  // const accessContract = new ethers.Contract(accessAddress, accessAbi, wallet);
  const feeData = await provider.getFeeData();

  console.log("Base Fee actual:", feeData);

  //   const tx_1 = await accessContract.setAgentsContract(agentsAddress,  {
  //     gasLimit: 1000000,
  //     maxFeePerGas: feeData?.gasPrice,
  //     maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //   });
  //   await tx_1.wait();

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

  //   // Collection Manager
  // const collectionContract = new ethers.Contract(
  //   collectionAddress,
  //   collectionAbi,
  //   wallet,
  // );

  // const tx_1 = await collectionContract.setMarket(marketAddress, {
  //   gasLimit: 1000000,
  //   maxFeePerGas: feeData?.gasPrice,
  //   maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  // });
  // await tx_1.wait();

  // NFT
  // const nftContract = new ethers.Contract(nftAddress, nftAbi, wallet);

  // const tx_1 = await nftContract.setMarket(marketAddress);
  // await tx_1.wait();

  //   // Market
  // const marketContract = new ethers.Contract(marketAddress, marketAbi, wallet);

  // const tx_1 = await marketContract.setDevTreasury(devAddress, {
  //       gasLimit: 1000000,
  //       maxFeePerGas: feeData?.gasPrice,
  //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //     });
  // await tx_1.wait();

  //   // Agents
  // const agentsContract = new ethers.Contract(agentsAddress, agentsAbi, wallet);

  // const tx_1 = await agentsContract.setMarket(marketAddress, {
  //       gasLimit: 1000000,
  //       maxFeePerGas: feeData?.gasPrice,
  //       maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
  //     });
  // await tx_1.wait();

  //   // Dev
  const devContract = new ethers.Contract(devAddress, devsAbi, wallet);

  const tx_1 = await devContract.setMarket(marketAddress);
  await tx_1.wait();
})();
