import { HStack, StackProps } from "@chakra-ui/react";
import { ethers, BigNumber } from "ethers";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";
import { stakedCollateral, percentageCRatio, formatAmount } from "../../utils";
import InfoBox, { InfoInterface } from "./InfoBox";

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

  const data: [InfoInterface, InfoInterface, InfoInterface] = [
    {
      title: "Staked Value",
      info: `$${
        provider !== undefined
          ? formatAmount(ethers.utils.formatUnits(stakedValue, sUSDDecimals))
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
          ? formatAmount(ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals))
          : "-"
      }`,
    },
  ];

  return (
    <>
      <HStack
        display={{ base: "none", md: "flex" }}
        spacing={{ base: "12px", sm: "24px" }}
        justifyContent="center"
        {...props}
      >
        {data.map((value: InfoInterface) => (
          <InfoBox key={value.title} {...value} />
        ))}
      </HStack>
      <HStack
        display={{ base: "flex", md: "none" }}
        spacing={{ base: "12px", sm: "24px" }}
        justifyContent="center"
        {...props}
      >
        <InfoBox key={data[0].title} {...data[0]} />
        <InfoBox key={data[2].title} {...data[2]} />
      </HStack>
      <HStack
        display={{ base: "flex", md: "none" }}
        spacing={{ base: "12px", sm: "24px" }}
        justifyContent="center"
        {...props}
      >
        <InfoBox key={data[1].title} {...data[1]} />
      </HStack>
    </>
  );
}

export default Info;
