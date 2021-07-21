import { ethers } from "ethers";
import { ALCHEMY_API } from "../constants";

export function getDefaultProvider(): ethers.providers.BaseProvider {
  return ethers.getDefaultProvider(ALCHEMY_API);
}
