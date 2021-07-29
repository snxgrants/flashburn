export const GA_TRACKING_ID: string = process.env.GA_TRACKING_ID ?? "";
export const siteURL: string = "https://snx-flash-tool.vercel.app/";
export const ALCHEMY_API: string = `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
export const INFURA_ID: string = process.env.NEXT_PUBLIC_INFURA_ID ?? "";

export const addresses: {
  [chainId: number]: {
    multicall: string;
  };
} = {
  1: {
    multicall: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  },
  1337: {
    multicall: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
  },
};
