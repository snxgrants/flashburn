import { ethers } from "hardhat";
import { Signer, Wallet } from "ethers";

export interface Migration {}

export async function migrate(owner: Wallet, isTest: boolean = true): Promise<Migration> {
  return {};
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
