export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const STORAGE_NODE: string = "https://storage-api.testnet.lens.dev";

export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` =
  "0xE03E9461d4AE7Ff79c7FfEf677593E4D5a86F9E2";
export const MARKET_CONTRACT: `0x${string}` =
  "0x9EAb4A6a26B24d2c3B4B4735C820Ebfa585992D7";
export const GRASS_CONTRACT: `0x${string}` =
  "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` =
  "0x38A419A1d67f5952493BDf1A2aB4a54844Be9701";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "GRASS",
    contract: "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8",
    image: "Qmb3zd2YaKhUnAnPuZtsi7Z5SFWLFbsfigvdEA4zXe8m9X",
  },
];
