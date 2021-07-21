import { ethers, BigNumber } from "ethers";
import { calculateApy } from "./compound";

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
  decimalPoints: number = 5
): string {
  const typecastedPrice = Number(price);
  return Number(typecastedPrice.toFixed(decimalPoints)).toLocaleString();
}

export function formatApy(ratePerBlock: BigNumber): string {
  const apy: number = calculateApy(ratePerBlock);
  return formatAmount(apy, 2);
}

export function formatBalance(balance: BigNumber, decimals: number): string {
  return formatAmount(ethers.utils.formatUnits(balance, decimals));
}

export function stripInputValue(value: string): string {
  if (
    value === "" ||
    value === "0" ||
    value === "0.0" ||
    value.startsWith(".") ||
    value.endsWith(".")
  ) {
    return "0";
  } else {
    return value;
  }
}
