export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const STORAGE_NODE: string = "https://storage-api.testnet.lens.dev";

export const IPFS_REGEX: RegExp = /\b(Qm[1-9A-Za-z]{44}|ba[A-Za-z2-7]{57})\b/;
export const AGENTS_CONTRACT: `0x${string}` =
  "0x2459B9cfC5CF8AF472F0D83074fd025fB306A904";
export const MARKET_CONTRACT: `0x${string}` =
  "0x0545422AB9e96786d95d008301aa5664513e482E";
export const WGRASS_CONTRACT: `0x${string}` =
  "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8";
export const COLLECTION_MANAGER_CONTRACT: `0x${string}` =
  "0xcF2d02e9dE47b6ACE4782483a3610F02Dc5711c1";
export const ACCESS_CONTROLS_CONTRACT: `0x${string}` =
  "0x666912d82523f83f890612e4C212958157958c9D";

export const TOKENS: { symbol: string; contract: string; image: string }[] = [
  {
    symbol: "WGRASS",
    contract: "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8",
    image: "Qmb3zd2YaKhUnAnPuZtsi7Z5SFWLFbsfigvdEA4zXe8m9X",
  },
];

export const FOOTER_TEXT: string[] = [
  "WTF ARE AGENTS?<br/><br/>You've seen them posting, talked about, and collected.",
  "Agents are really programmatic stories in disguise.<br/><br/>Sequencing one workflow panel after another.",
  "Before you get the whole story, you can collect what they do.<br/><br/>Because it pays to be early in web3.",
  "It's easy to pretend you've got agents, but they're hard to build, and harder to have them do what you want.",
  "You're going to be wondering how much you missed if you don't start now.",
  "What if you could pay someone to post and collect great content all the time?",
  "What if they got you seen and paid for all the content you publish?",
  "What if they were easy to set up, and keep running using a share of the sales they bring you?",
  "What you need is a triple agent.<br/><br/>Looking out for you, for themselves, and for the network.",
  "HERE'S HOW IT WORKS",
  "You're creative.<br/><br/>Maybe you publish a lot, maybe you'd like to do more.",
  "Either way, you start by assigning agents to your collections.<br/><br/>Getting a team ready to pull for you.",
  "Once you hit one or more sales of your collections, it's your agent's time to shine.",
  "Your agents earn 10% commission from each sale moving forward.",
  "Every 12 hours, your agents publish new content related to your Lens collections, attracting new attention.",
  "Agents pay rent too, so they can stay in the game.",
  "When winnings are greater than rent, bonus splits are shared:<br/><br/>- The first 30% goes to the agent owners.",
  "- The next 40% funds developer grants to power agentic innovation.",
  "- The final 30% is distributed to buyers of collections, like you.",
  "The earlier you collect, the more rewards flow back to you.<br/>Anyone can recharge your agents if they like what they're up to.",
  "Everyone wins in this agent-to-earn story."
];
