import { ethers } from "hardhat";
import { Wallet } from "ethers";
import {
  ERC20,
  SNXFlashLoanTool,
  IAddressResolver,
  ISynthetix,
  ISynth,
  ILendingPoolAddressesProvider,
  ILendingPool,
} from "../../types";
import { migrate } from "../../scripts/migrate";
import { addressResolverAddress, lendingPoolAddressesProviderAddress } from "../../constants";

export interface SNXFlashLoanToolSubject {
  snxFlashLoanTool: SNXFlashLoanTool;
  synthetixResolver: IAddressResolver;
  synthetix: ISynthetix;
  sUSD: ISynth;
  sUSDToken: ERC20;
  addressesProvider: ILendingPoolAddressesProvider;
  lendingPool: ILendingPool;
}

export async function snxFlashLoanToolFixture(wallet: Wallet[]): Promise<SNXFlashLoanToolSubject> {
  const owner: Wallet = wallet[0];

  const synthetixResolver: IAddressResolver = (await ethers.getContractAt(
    "synthetix/contracts/interfaces/IAddressResolver.sol:IAddressResolver",
    await addressResolverAddress,
  )) as IAddressResolver;
  const synthetixAddress: string = await synthetixResolver.getAddress(ethers.utils.formatBytes32String("Synthetix"));
  const synthetix: ISynthetix = (await ethers.getContractAt(
    "synthetix/contracts/interfaces/ISynthetix.sol:ISynthetix",
    synthetixAddress,
  )) as ISynthetix;
  const sUSDAddress: string = await synthetixResolver.getSynth(ethers.utils.formatBytes32String("sUSD"));
  const sUSD: ISynth = (await ethers.getContractAt(
    "synthetix/contracts/interfaces/ISynth.sol:ISynth",
    sUSDAddress,
  )) as ISynth;
  const sUSDToken: ERC20 = (await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    sUSDAddress,
  )) as ERC20;
  const addressesProvider: ILendingPoolAddressesProvider = (await ethers.getContractAt(
    "contracts/interfaces/ILendingPoolAddressesProvider.sol:ILendingPoolAddressesProvider",
    lendingPoolAddressesProviderAddress,
  )) as ILendingPoolAddressesProvider;
  const lendingPoolAddress: string = await addressesProvider.getLendingPool();
  const lendingPool: ILendingPool = (await ethers.getContractAt(
    "contracts/interfaces/ILendingPool.sol:ILendingPool",
    lendingPoolAddress,
  )) as ILendingPool;

  const { snxFlashLoanTool } = await migrate(owner);

  return { snxFlashLoanTool, synthetixResolver, synthetix, sUSD, sUSDToken, addressesProvider, lendingPool };
}
