import { ethers, BigNumber } from "ethers";
import { addresses } from "@snx-flash-tool/contracts/constants";
import {
  IAddressResolver__factory,
  ISystemSettings__factory,
  IExchangeRates__factory,
  ERC20__factory,
  ISynthetix__factory,
  Multicall,
  Multicall__factory,
  IDelegateApprovals,
  IDelegateApprovals__factory,
  Call,
  ReturnData,
} from "../types";

export interface SynthetixAddresses {
  synthetix: string;
  snx: string;
  delegateApprovals: string;
  sUSD: string;
  systemSettings: string;
  exchangeRates: string;
}

export interface SynthetixBalances {
  balanceOf: BigNumber;
  collateralisationRatio: BigNumber;
  transferableSynthetix: BigNumber;
  debtBalanceOf: BigNumber;
  collateral: BigNumber;
  issuanceRatio: BigNumber;
  targetThreshold: BigNumber;
  rateForCurrency: BigNumber;
  allowance: BigNumber;
  snxDecimals: number;
  sUSDDecimals: number;
  sUSDbalanceOf: BigNumber;
  canBurnFor: boolean;
}

const snxKey: string = ethers.utils.formatBytes32String("SNX");
const sUSDKey: string = ethers.utils.formatBytes32String("sUSD");
const addressKeys: string[] = [
  ethers.utils.formatBytes32String("Synthetix"),
  ethers.utils.formatBytes32String("ProxyERC20"),
  ethers.utils.formatBytes32String("DelegateApprovals"),
  ethers.utils.formatBytes32String("ProxyERC20sUSD"),
  ethers.utils.formatBytes32String("SystemSettings"),
  ethers.utils.formatBytes32String("ExchangeRates"),
];

export async function getSynthetixAddresses(
  provider: ethers.providers.Provider,
  chainId: number
): Promise<SynthetixAddresses> {
  const multicall: Multicall = Multicall__factory.connect(
    addresses[chainId].multicall,
    provider
  );

  const getAddressesCalls: Call[] = addressKeys.map((addressKey: string) => ({
    target: addresses[chainId].addressResolver,
    callData: IAddressResolver__factory.createInterface().encodeFunctionData(
      "getAddress",
      [addressKey]
    ),
  }));

  const getAddressesReturnData: ReturnData[] =
    await multicall.callStatic.tryAggregate(true, getAddressesCalls);

  const getAddresses: string[] = getAddressesReturnData.map(
    (returnData: ReturnData) => {
      const decoded =
        IAddressResolver__factory.createInterface().decodeFunctionResult(
          "getAddress",
          returnData.returnData
        );
      return decoded[0] as string;
    }
  );

  return {
    synthetix: getAddresses[0],
    snx: getAddresses[1],
    delegateApprovals: getAddresses[2],
    sUSD: getAddresses[3],
    systemSettings: getAddresses[4],
    exchangeRates: getAddresses[5],
  };
}

export async function getSynthetixBalances(
  provider: ethers.providers.Provider,
  chainId: number,
  account: string,
  synthetixAddresses: SynthetixAddresses
): Promise<SynthetixBalances> {
  const multicall: Multicall = Multicall__factory.connect(
    addresses[chainId].multicall,
    provider
  );
  const snxFlashToolAddress: string = addresses[chainId].snxFlashTool;

  const balancesCalls: Call[] = [
    {
      target: synthetixAddresses.snx,
      callData: ERC20__factory.createInterface().encodeFunctionData(
        "balanceOf",
        [account]
      ),
    },
    {
      target: synthetixAddresses.synthetix,
      callData: ISynthetix__factory.createInterface().encodeFunctionData(
        "collateralisationRatio",
        [account]
      ),
    },
    {
      target: synthetixAddresses.synthetix,
      callData: ISynthetix__factory.createInterface().encodeFunctionData(
        "transferableSynthetix",
        [account]
      ),
    },
    {
      target: synthetixAddresses.synthetix,
      callData: ISynthetix__factory.createInterface().encodeFunctionData(
        "debtBalanceOf",
        [account, sUSDKey]
      ),
    },
    {
      target: synthetixAddresses.synthetix,
      callData: ISynthetix__factory.createInterface().encodeFunctionData(
        "collateral",
        [account]
      ),
    },
    {
      target: synthetixAddresses.systemSettings,
      callData:
        ISystemSettings__factory.createInterface().encodeFunctionData(
          "issuanceRatio"
        ),
    },
    {
      target: synthetixAddresses.systemSettings,
      callData:
        ISystemSettings__factory.createInterface().encodeFunctionData(
          "targetThreshold"
        ),
    },
    {
      target: synthetixAddresses.exchangeRates,
      callData: IExchangeRates__factory.createInterface().encodeFunctionData(
        "rateForCurrency",
        [snxKey]
      ),
    },
    {
      target: synthetixAddresses.snx,
      callData: ERC20__factory.createInterface().encodeFunctionData(
        "allowance",
        [account, snxFlashToolAddress]
      ),
    },
    {
      target: synthetixAddresses.snx,
      callData: ERC20__factory.createInterface().encodeFunctionData("decimals"),
    },
    {
      target: synthetixAddresses.sUSD,
      callData: ERC20__factory.createInterface().encodeFunctionData("decimals"),
    },
    {
      target: synthetixAddresses.sUSD,
      callData: ERC20__factory.createInterface().encodeFunctionData(
        "balanceOf",
        [account]
      ),
    },
    {
      target: synthetixAddresses.delegateApprovals,
      callData:
        IDelegateApprovals__factory.createInterface().encodeFunctionData(
          "canBurnFor",
          [account, snxFlashToolAddress]
        ),
    },
  ];

  const balancesReturnData: ReturnData[] =
    await multicall.callStatic.tryAggregate(false, balancesCalls);

  return {
    balanceOf: balancesReturnData[0].success
      ? (ERC20__factory.createInterface().decodeFunctionResult(
          "balanceOf",
          balancesReturnData[0].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    collateralisationRatio: balancesReturnData[1].success
      ? (ISynthetix__factory.createInterface().decodeFunctionResult(
          "collateralisationRatio",
          balancesReturnData[1].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    transferableSynthetix: balancesReturnData[2].success
      ? (ISynthetix__factory.createInterface().decodeFunctionResult(
          "transferableSynthetix",
          balancesReturnData[2].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    debtBalanceOf: balancesReturnData[3].success
      ? (ISynthetix__factory.createInterface().decodeFunctionResult(
          "debtBalanceOf",
          balancesReturnData[3].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    collateral: balancesReturnData[4].success
      ? (ISynthetix__factory.createInterface().decodeFunctionResult(
          "collateral",
          balancesReturnData[4].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    issuanceRatio: balancesReturnData[5].success
      ? (ISystemSettings__factory.createInterface().decodeFunctionResult(
          "issuanceRatio",
          balancesReturnData[5].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    targetThreshold: balancesReturnData[6].success
      ? (ISystemSettings__factory.createInterface().decodeFunctionResult(
          "targetThreshold",
          balancesReturnData[6].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    rateForCurrency: balancesReturnData[7].success
      ? (IExchangeRates__factory.createInterface().decodeFunctionResult(
          "rateForCurrency",
          balancesReturnData[7].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    allowance: balancesReturnData[8].success
      ? (ERC20__factory.createInterface().decodeFunctionResult(
          "allowance",
          balancesReturnData[8].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    snxDecimals: balancesReturnData[9].success
      ? (ERC20__factory.createInterface().decodeFunctionResult(
          "decimals",
          balancesReturnData[9].returnData
        )[0] as number)
      : 18,
    sUSDDecimals: balancesReturnData[10].success
      ? (ERC20__factory.createInterface().decodeFunctionResult(
          "decimals",
          balancesReturnData[10].returnData
        )[0] as number)
      : 18,
    sUSDbalanceOf: balancesReturnData[11].success
      ? (ERC20__factory.createInterface().decodeFunctionResult(
          "balanceOf",
          balancesReturnData[11].returnData
        )[0] as BigNumber)
      : BigNumber.from("0"),
    canBurnFor: balancesReturnData[12].success
      ? (IDelegateApprovals__factory.createInterface().decodeFunctionResult(
          "canBurnFor",
          balancesReturnData[12].returnData
        )[0] as boolean)
      : false,
  };
}

export function stakedCollateral(
  collateral: BigNumber,
  collateralisationRatio: BigNumber,
  issuanceRatio: BigNumber,
  snxDecimals: number
): BigNumber {
  return issuanceRatio.isZero()
    ? BigNumber.from("0")
    : collateral
        .mul(
          collateralisationRatio
            .mul(ethers.utils.parseUnits("1", snxDecimals))
            .div(issuanceRatio)
        )
        .div(ethers.utils.parseUnits("1", snxDecimals));
}

export function percentageCRatio(cRatio: BigNumber): BigNumber {
  return cRatio.isZero()
    ? BigNumber.from("0")
    : ethers.utils.parseEther("10000").div(cRatio);
}
