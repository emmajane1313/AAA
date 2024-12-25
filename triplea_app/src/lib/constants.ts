export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` = "0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a";
export const MARKET_CONTRACT: `0x${string}` = "0x4B0f1be07f50D9C6Ef9d378268810ABFf55EBc1a";
export const GRASS_CONTRACT: `0x${string}` = "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` = "0x839d0C63495BeA892e292Be6DE7410BB93948F2E";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "GRASS",
    contract: "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8",
    image: "Qmb3zd2YaKhUnAnPuZtsi7Z5SFWLFbsfigvdEA4zXe8m9X",
  },
];
