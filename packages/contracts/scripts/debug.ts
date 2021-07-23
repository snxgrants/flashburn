import { ethers, network } from "hardhat";
import { Signer, Wallet, BigNumber } from "ethers";
import { SNXFlashLoanTool, IAddressResolver, ERC20, IDelegateApprovals } from "../types";
import { migrate as migrateSNXFlashLoanTool } from "./SNXFlashLoanTool";
import { addressResolverAddress, impersonateAddress } from "../constants";

async function main() {
  const accounts: Signer[] = await ethers.getSigners();
  const owner: Wallet = <Wallet>accounts[0];
  const snxFlashLoanTool: SNXFlashLoanTool = await migrateSNXFlashLoanTool(owner);

  const impersonateAddressSigner: Signer = await ethers.provider.getSigner(impersonateAddress);
  const impersonateAddressWallet: Wallet = <Wallet>impersonateAddressSigner;
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [impersonateAddress],
  });

  const synthetixResolver: IAddressResolver = (await ethers.getContractAt(
    "synthetix/contracts/interfaces/IAddressResolver.sol:IAddressResolver",
    addressResolverAddress,
  )) as IAddressResolver;
  const snxAddress: string = await synthetixResolver.getAddress(ethers.utils.formatBytes32String("ProxyERC20"));
  const SNX: ERC20 = (await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    snxAddress,
  )) as ERC20;
  const delegateApprovalsAddress: string = await synthetixResolver.getAddress(
    ethers.utils.formatBytes32String("DelegateApprovals"),
  );
  const delegateApprovals: IDelegateApprovals = (await ethers.getContractAt(
    "synthetix/contracts/interfaces/IDelegateApprovals.sol:IDelegateApprovals",
    delegateApprovalsAddress,
  )) as IDelegateApprovals;

  const snxAmount = BigNumber.from("11366004710098787245");
  const sUSDAmount = BigNumber.from("99073034504547801217");

  await SNX.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
  await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
  // https://api.0x.org/swap/v1/quote?sellToken=0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F&buyToken=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&buyAmount=101000000000000000000&slippagePercentage=1
  await snxFlashLoanTool
    .connect(impersonateAddressWallet)
    .burn(
      sUSDAmount,
      snxAmount,
      "0x11111112542d85b3ef69ae05771c2dccff4faa26",
      "0x2e95b6c8000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f0000000000000000000000000000000000000000000000009dbc29106cdadbad000000000000000000000000000000000000000000000004d56c4ff9313b2fa70000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000003b6d034043ae24960e5534731fc831386c07755a2dc33d4780000000000000003b6d0340f1f85b2c54a2bd284b1cf4141d64fd171bd85539",
    );

  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [impersonateAddress],
  });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
