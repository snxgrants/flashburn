import {
  Box,
  BoxProps,
  Button,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";
import WalletButton from "../NavBar/WalletButton";
import { formatAmount } from "../../utils";

function Burn({ props }: { props?: BoxProps }): JSX.Element {
  const { provider } = useWeb3React();
  const { balances, loaded } = useSynthetix();
  const { rateForCurrency, sUSDDecimals } = balances;

  return (
    <Box {...props}>
      <Stat>
        <StatLabel>SNX Price</StatLabel>
        <StatNumber>
          {provider !== undefined ? (
            loaded ? (
              `$${formatAmount(
                ethers.utils.formatUnits(rateForCurrency, sUSDDecimals)
              )}`
            ) : (
              <>
                {"$ "}
                <Spinner size="sm" />
              </>
            )
          ) : (
            "$-"
          )}
        </StatNumber>
      </Stat>
      <Center marginTop="10">
        {provider !== undefined ? (
          <Button color="black" disabled>
            Burn
          </Button>
        ) : (
          <WalletButton />
        )}
      </Center>
    </Box>
  );
}

export default Burn;
