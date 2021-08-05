import { Box, Text, HStack } from "@chakra-ui/react";
import { ethers, BigNumber } from "ethers";
import useSynthetix from "../../hooks/useSynthetix";
import { stakedCollateral, percentageCRatio, formatAmount } from "../../utils";

function InfoBox({
  title,
  info,
}: {
  title: string;
  info: string;
}): JSX.Element {
  return (
    <Box>
      <Text fontWeight="bold" textAlign="center">
        {title}
      </Text>
      <Text
        fontWeight="bold"
        fontSize="2xl"
        textColor="white"
        textAlign="center"
      >
        {info}
      </Text>
    </Box>
  );
}

function Top(): JSX.Element {
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
    <HStack>
      {[
        {
          title: "Staked Value",
          info: `$${formatAmount(
            ethers.utils.formatUnits(stakedValue, sUSDDecimals)
          )}`,
        },
        {
          title: "C-Ratio",
          info: `${formatAmount(
            percentageCRatio(collateralisationRatio).toNumber() / 100
          )}%`,
        },
        {
          title: "Active Debt",
          info: `$${formatAmount(
            ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals)
          )}`,
        },
      ].map((value) => (
        <InfoBox key={value.title} {...value} />
      ))}
    </HStack>
  );
}

export default Top;
