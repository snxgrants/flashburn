import { ethers } from "ethers";
import { addresses } from "@snx-flash-tool/contracts/constants";
import {
  IAddressResolver__factory,
  ISystemSettings__factory,
  IExchangeRates__factory,
  Multicall,
  Multicall__factory,
  Call,
  ReturnData,
} from "../types";

interface SynthetixAddresses {
  synthetix: string;
  snx: string;
  delegateApprovals: string;
  sUSD: string;
  systemSettings: string;
  exchangeRates: string;
}

const snxKey = ethers.utils.formatBytes32String("SNX");
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

  const addressResolverAddress: string = addresses[chainId].addressResolver;

  const getAddressesCalls: Call[] = addressKeys.map((addressKey: string) => ({
    target: addressResolverAddress,
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
  address: string,
  synthetixAddresses: SynthetixAddresses
) {}
