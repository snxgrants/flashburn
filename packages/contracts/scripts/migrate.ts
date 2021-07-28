import { ethers } from "hardhat";
import { Signer, Wallet } from "ethers";
import { SNXFlashLoanTool } from "../types";
import { migrate as migrateSNXFlashLoanTool } from "./SNXFlashLoanTool";

export interface Migration {
  snxFlashLoanTool: SNXFlashLoanTool;
}

export async function migrate(owner: Wallet, chainId: number): Promise<Migration> {
  const snxFlashLoanTool: SNXFlashLoanTool = await migrateSNXFlashLoanTool(owner, chainId);
  return { snxFlashLoanTool };
}

async function main() {
  const accounts: Signer[] = await ethers.getSigners();
  const owner: Wallet = <Wallet>accounts[0];
  const chainId: number = await owner.getChainId();
  console.log("Chain ID:", chainId);
  console.log("Owner address:", owner.address);
  const { snxFlashLoanTool } = await migrate(owner, chainId);
  console.log("SNXFlashLoanTool address:", snxFlashLoanTool.address);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
