import { Box, Text } from "@chakra-ui/react";
import useSynthetix from "../../hooks/useSynthetix";

function Top(): JSX.Element {
  const { balances } = useSynthetix();

  return (
    <Box>
      <Text>{balances.rateForCurrency.toString()}</Text>
    </Box>
  );
}

export default Top;
