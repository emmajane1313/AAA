const { ethers } = require("ethers");
const agentsAbi = require("../abis/AgentsAbi.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lens.dev",
  37111
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const agentsAddress = "0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a";

(async () => {
  const feeData = await provider.getFeeData();

  console.log("Base Fee actual:", feeData);

  // Agents
  const agentsContract = new ethers.Contract(agentsAddress, agentsAbi, wallet);

  const tx_agent_1 = await agentsContract.createAgent(
    "ipfs://QmaAcy5ULMG6fv2LTEFAuYyEXLCSdoR38RTVmnN2fbaG34",
    "0x87dD364f74f67f1e13126D6Fd9a31b7d78C2cC12",
    {
      gasLimit: 1000000,
      maxFeePerGas: feeData?.gasPrice,
      maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    }
  );
  await tx_agent_1.wait();

  const tx_agent_2 = await agentsContract.createAgent(
    "ipfs://QmWXkGh6QARjkXCYdigY3GQk1segNk3pLYadFQeKZL5cxH",
    "0x9bBca90ea8F188403fAB15Cd5bad4F9a46f56257",
    {
      gasLimit: 1000000,
      maxFeePerGas: feeData?.gasPrice,
      maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    }
  );
  await tx_agent_2.wait();

  const tx_agent_3 = await agentsContract.createAgent(
    "ipfs://QmdvyAbV8ZPbbsqgCZeX6JxCmurk9tFSvPrKgK4RsQy72T",
    "0xa8ac1e95a53c79Eae348491f678A1Cf0c2F2519e",
    {
      gasLimit: 1000000,
      maxFeePerGas: feeData?.gasPrice,
      maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    }
  );
  await tx_agent_3.wait();

  const tx_agent_4 = await agentsContract.createAgent(
    "ipfs://Qmc76wMVu8hy4wM7hkepLMP3WFk3yk7TWdeQnriUDqVN8q",
    "0x8241Ee5A9f23611Ef6535B6c7E71ae24913306EC",
    {
      gasLimit: 1000000,
      maxFeePerGas: feeData?.gasPrice,
      maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
    }
  );
  await tx_agent_4.wait();
})();
