import { VStack, StackProps, StackDivider } from "@chakra-ui/react";
import { ethers, BigNumber } from "ethers";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";
import { stakedCollateral, percentageCRatio, formatAmount } from "../../utils";
import DataBox from "./DataBox";

function Data({ props }: { props?: StackProps }): JSX.Element {
  const { provider } = useWeb3React();
  const { balances } = useSynthetix();
  const {
    collateral,
    collateralisationRatio,
    issuanceRatio,
    rateForCurrency,
    sUSDDecimals,
    debtBalanceOf,
  } = balances;

  const stakedValue: BigNumber = stakedCollateral(
    collateral,
    collateralisationRatio,
    issuanceRatio
  )
    .mul(rateForCurrency)
    .div(ethers.utils.parseUnits("1", sUSDDecimals));

  return (
    <VStack width="60" divider={<StackDivider borderColor="gray.200" />} {...props}>
      {[
        {
          title: "Staked Value",
          info: `$${
            provider !== undefined
              ? formatAmount(
                  ethers.utils.formatUnits(stakedValue, sUSDDecimals)
                )
              : "-"
          }`,
        },
        {
          title: "C-Ratio",
          info: `${
            provider !== undefined
              ? formatAmount(
                  percentageCRatio(collateralisationRatio).toNumber() / 100
                )
              : "-"
          }%`,
        },
        {
          title: "Active Debt",
          info: `$${
            provider !== undefined
              ? formatAmount(
                  ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals)
                )
              : "-"
          }`,
        },
      ].map((value) => (
        <DataBox key={value.title} {...value} />
      ))}
    </VStack>
  );
}

export default Data;
