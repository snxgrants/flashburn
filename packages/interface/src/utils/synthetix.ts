import { ethers } from "ethers";
import { addresses } from "@snx-flash-tool/contracts/constants";
import { IAddressResolver__factory } from "@snx-flash-tool/contracts/types";
import { Multicall, Multicall__factory, Call } from "../types";

interface SynthetixAddresses {
  synthetix: string;
  snx: string;
  delegateApprovals: string;
  sUSD: string;
}

const synthetixKey: string = ethers.utils.formatBytes32String("Synthetix");
const snxKey: string = ethers.utils.formatBytes32String("ProxyERC20");
const delegateApprovalsKey: string =
  ethers.utils.formatBytes32String("DelegateApprovals");
const sUSDKey: string = ethers.utils.formatBytes32String("ProxyERC20sUSD");
const addressKeys: [string, string, string, string] = [
  synthetixKey,
  snxKey,
  delegateApprovalsKey,
  sUSDKey,
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

  const getAddressesReturnData = await multicall.callStatic.tryAggregate(
    true,
    getAddressesCalls
  );

  const getAddresses: string[] = getAddressesReturnData.map(
    (returnData: { success: boolean; returnData: string }) => {
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
  };
}
