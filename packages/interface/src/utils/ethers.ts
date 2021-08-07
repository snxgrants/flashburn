import { ethers, BigNumber } from "ethers";

export function tryParseUnits(value: string, decimals: number): BigNumber {
  let parsedValue: BigNumber = BigNumber.from("0");
  try {
    parsedValue = ethers.utils.parseUnits(value, decimals);
  } catch (error) {
    console.log(error.message);
  }
  return parsedValue;
}
