export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const STORAGE_NODE: string = "https://storage-api.testnet.lens.dev";

export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` =
  "0xA36B994da5Bc7a666cbF3192d2c043193D300FE0";
export const MARKET_CONTRACT: `0x${string}` =
  "0x2d1e70BF010318B6597154C159BFe1EC805495C7";
export const GRASS_CONTRACT: `0x${string}` =
  "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` =
  "0xC094c540e003cBC2b7A30D35C8148B5792568Af4";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "GRASS",
    contract: "0x63F16E0Cc467E7f2A68595c05B6ec83Eda6705c8",
    image: "Qmb3zd2YaKhUnAnPuZtsi7Z5SFWLFbsfigvdEA4zXe8m9X",
  },
];
