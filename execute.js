const { ethers } = require("ethers");
const accessAbi = require("./abis/AccessControlsAbi.json");
const nftAbi = require("./abis/NFTAbi.json");
const marketAbi = require("./abis/MarketAbi.json");
const agentsAbi = require("./abis/AgentsAbi.json");
const devsAbi = require("./abis/DevTreasuryAbi.json");
const collectionAbi = require("./abis/CollectionManagerAbi.json");
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lens.dev",
  37111
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const accessAddress = "0x596d5F38197aBced1D89152450Bc8237a02328e5";
const marketAddress = "0x6C3dae0B0c79918Aa5E31C4016979B6638257AB5";
const agentsAddress = "0x674468e38930d472E4Af390b46cC086ad0839Adf";
const nftAddress = "0x3eb06EfD7C4aB7058Ca8d0831B7Aa8C0793B83b1";
const devAddress = "0x8ABBd0D22C82449935f49305dbaC095052aE42A0";
const collectionAddress = "0xDa626C237eD10F908Ef716DC6e5B2339A6FA52a9";

(async () => {
  // Access Controls
  const accessContract = new ethers.Contract(accessAddress, accessAbi, wallet);
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
//   const collectionContract = new ethers.Contract(
//     collectionAddress,
//     collectionAbi,
//     wallet, 
//   );

//   const tx_1 = await collectionContract.setMarket(marketAddress, {
//     gasLimit: 1000000, 
//     maxFeePerGas: feeData?.gasPrice, 
//     maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
//   });
//   await tx_1.wait();

  // NFT
//   const nftContract = new ethers.Contract(nftAddress, nftAbi, wallet);

//   const tx_1 = await nftContract.setMarketplace(marketAddress, {
//         gasLimit: 1000000, 
//         maxFeePerGas: feeData?.gasPrice, 
//         maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
//       });
//   await tx_1.wait();

//   // Market
//   const marketContract = new ethers.Contract(marketAddress, marketAbi, wallet);

//   const tx_1 = await marketContract.setDevTreasury(devAddress, {
//         gasLimit: 1000000, 
//         maxFeePerGas: feeData?.gasPrice, 
//         maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
//       });
//   await tx_1.wait();

//   // Agents
//   const agentsContract = new ethers.Contract(agentsAddress, agentsAbi, wallet);

//   const tx_1 = await agentsContract.setMarket(marketAddress, {
//         gasLimit: 1000000, 
//         maxFeePerGas: feeData?.gasPrice, 
//         maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
//       });
//   await tx_1.wait();

//   // Dev
//   const devContract = new ethers.Contract(devAddress, devsAbi, wallet);

//   const tx_1 = await devContract.setMarket(marketAddress, {
//         gasLimit: feeData?.gasPrice, 
//         maxFeePerGas: feeData?.maxFeePerGas, 
//         maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
//       });
//   await tx_1.wait();
})();
