export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` = "0x";
export const MARKET_CONTRACT: `0x${string}` = "0x";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` = "0x";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "GRASS",
    contract: "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8",
    image: "Qmb3zd2YaKhUnAnPuZtsi7Z5SFWLFbsfigvdEA4zXe8m9X",
  },
];
