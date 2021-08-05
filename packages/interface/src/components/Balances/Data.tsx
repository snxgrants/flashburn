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
    transferableSynthetix,
    sUSDbalanceOf,
    sUSDDecimals,
    snxDecimals,
    debtBalanceOf,
  } = balances;

  const stakedAmount: BigNumber = stakedCollateral(
    collateral,
    collateralisationRatio,
    issuanceRatio,
    snxDecimals
  );

  return (
    <VStack
      width={{ base: "72", sm: "80" }}
      divider={<StackDivider borderColor="gray.200" />}
      {...props}
    >
      {[
        {
          title: "Total",
          info: `${
            provider !== undefined
              ? formatAmount(ethers.utils.formatUnits(collateral, snxDecimals))
              : "-"
          } SNX`,
        },
        {
          title: "Staked",
          info: `${
            provider !== undefined
              ? formatAmount(
                  ethers.utils.formatUnits(stakedAmount, snxDecimals)
                )
              : "-"
          } SNX`,
          progess: collateral.isZero()
            ? 0
            : stakedAmount.mul(100).div(collateral).toNumber(),
        },
        {
          title: "Transferrable",
          info: `${
            provider !== undefined
              ? formatAmount(
                  ethers.utils.formatUnits(transferableSynthetix, snxDecimals)
                )
              : "-"
          } SNX`,
          progess: collateral.isZero()
            ? 0
            : transferableSynthetix.mul(100).div(collateral).toNumber(),
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
          title: "sUSD Balance",
          info: `${
            provider !== undefined
              ? formatAmount(
                  ethers.utils.formatUnits(sUSDbalanceOf, sUSDDecimals)
                )
              : "-"
          } sUSD`,
        },
        {
          title: "Total Debt",
          info: `${
            provider !== undefined
              ? formatAmount(
                  ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals)
                )
              : "-"
          } sUSD`,
        },
      ].map((value) => (
        <DataBox
          key={value.title}
          title={value.title}
          info={value.info}
          progress={value.progess}
        />
      ))}
    </VStack>
  );
}

export default Data;
