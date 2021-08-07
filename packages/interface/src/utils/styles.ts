import { ethers, BigNumber } from "ethers";

export function isLinkExternal(href: string | undefined): boolean {
  return href !== undefined ? href.startsWith("http") : false;
}

export function formatAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  } else {
    return address.slice(0, 6) + "..." + address.slice(-4);
  }
}

export function formatAmount(
  price: string | number = 0,
  decimalPoints: number = 2
): string {
  const typecastedPrice = Number(price);
  return Number(typecastedPrice.toFixed(decimalPoints)).toLocaleString();
}

export function formatBalance(balance: BigNumber, decimals: number): string {
  return formatAmount(ethers.utils.formatUnits(balance, decimals));
}

export function stripInputValue(value: string): string {
  if (value === "" || value === "0" || value === "0.0" || value.endsWith(".")) {
    return "0";
  } else if (value.startsWith(".")) {
    return "0" + value;
  }
  {
    return value;
  }
}
