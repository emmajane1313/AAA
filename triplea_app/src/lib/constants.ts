export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const STORAGE_NODE: string = "https://storage-api.testnet.lens.dev";

export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` =
  "0x26F17d3c4bd99254D83B8CcA56Da35eaDeC9B712";
export const MARKET_CONTRACT: `0x${string}` =
  "0x79d7C37612737A7a6bE306F5E0B2aB0281dc6Ea6";
export const WGRASS_CONTRACT: `0x${string}` =
  "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` =
  "0xb0e55F6B0e217e7C8D7A05E1881B4fdA4C9b018C";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "WGRASS",
    contract: "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8",
    image: "Qmb3zd2YaKhUnAnPuZtsi7Z5SFWLFbsfigvdEA4zXe8m9X",
  },
];
