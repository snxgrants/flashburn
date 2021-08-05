import { Box, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import useSynthetix from "../../hooks/useSynthetix";

function Top(): JSX.Element {
  const { balances } = useSynthetix();

  return (
    <Box>
      <Text>
        {ethers.utils.formatUnits(
          balances.rateForCurrency,
          balances.sUSDDecimals
        )}
      </Text>
    </Box>
  );
}

export default Top;
