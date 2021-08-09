import { ethers, BigNumber } from "ethers";

export function tryParseUnits(
  value: string,
  decimals: number,
  setError?: (value: boolean) => void
): BigNumber {
  let parsedValue: BigNumber = BigNumber.from("0");
  try {
    parsedValue = ethers.utils.parseUnits(value, decimals);
    if (setError) {
      setError(false);
    }
  } catch (error) {
    console.log(error.message);
    if (setError) {
      setError(true);
    }
  }
  return parsedValue;
}
