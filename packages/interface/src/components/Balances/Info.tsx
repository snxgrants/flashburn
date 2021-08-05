import { HStack, StackProps } from "@chakra-ui/react";
import { ethers, BigNumber } from "ethers";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";
import { stakedCollateral, percentageCRatio, formatAmount } from "../../utils";
import InfoBox from "./InfoBox";

function Info({ props }: { props?: StackProps }): JSX.Element {
  const { provider } = useWeb3React();
  const { balances } = useSynthetix();
  const {
    collateral,
    collateralisationRatio,
    issuanceRatio,
    rateForCurrency,
    sUSDDecimals,
    debtBalanceOf,
    snxDecimals,
  } = balances;

  const stakedValue: BigNumber = stakedCollateral(
    collateral,
    collateralisationRatio,
    issuanceRatio,
    snxDecimals
  )
    .mul(rateForCurrency)
    .div(ethers.utils.parseUnits("1", sUSDDecimals));

  return (
    <HStack spacing={{ base: "12px", sm: "24px" }} {...props}>
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
        <InfoBox key={value.title} {...value} />
      ))}
    </HStack>
  );
}

export default Info;
