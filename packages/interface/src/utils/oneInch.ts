export interface OneInchToken {
  address: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}

export interface OneInchProtocol {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

export interface OneInchQuote {
  estimatedGas: number;
  fromToken: OneInchToken;
  toToken: OneInchToken;
  protocols: OneInchProtocol[][][];
  toTokenAmount: string;
  fromTokenAmount: string;
}

export function fetchQuoteURL(
  chainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string
): string {
  return `https://api.1inch.exchange/v3.0/${chainId}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`;
}
