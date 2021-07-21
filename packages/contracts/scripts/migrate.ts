import { ethers } from "hardhat";
import { Signer, Wallet } from "ethers";
import { SNXFlashLoanTool } from "../types";
import { migrate as migrateSNXFlashLoanTool } from "./SNXFlashLoanTool";

export interface Migration {
  snxFlashLoanTool: SNXFlashLoanTool;
}

export async function migrate(owner: Wallet, isTest: boolean = true): Promise<Migration> {
  const snxFlashLoanTool: SNXFlashLoanTool = await migrateSNXFlashLoanTool(owner);
  if (!isTest) console.log("SNXFlashLoanTool address:", snxFlashLoanTool.address);
  return { snxFlashLoanTool };
}

async function main() {
  const accounts: Signer[] = await ethers.getSigners();
  const owner: Wallet = <Wallet>accounts[0];
  console.log("Owner address:", owner.address);
  await migrate(owner, false);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
