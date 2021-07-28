import { ethers } from "hardhat";
import { Wallet, Signer } from "ethers";
import { SNXFlashLoanTool, SNXFlashLoanTool__factory } from "../types";
import { addresses } from "../constants";

export async function migrate(owner: Wallet, chainId: number): Promise<SNXFlashLoanTool> {
  const snxFlashLoanToolFactory: SNXFlashLoanTool__factory = (await ethers.getContractFactory(
    "contracts/SNXFlashLoanTool.sol:SNXFlashLoanTool",
    owner,
  )) as SNXFlashLoanTool__factory;
  const snxFlashLoanTool: SNXFlashLoanTool = await snxFlashLoanToolFactory
    .connect(owner)
    .deploy(addresses[chainId].addressResolver, addresses[chainId].lendingPoolAddressesProvider);
  return snxFlashLoanTool;
}

async function main() {
  const accounts: Signer[] = await ethers.getSigners();
  const owner: Wallet = <Wallet>accounts[0];
  const chainId: number = await owner.getChainId();
  console.log("Chain ID:", chainId);
  console.log("Owner address:", owner.address);
  const snxFlashLoanTool: SNXFlashLoanTool = await migrate(owner, chainId);
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
