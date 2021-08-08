import { ReactNode } from "react";
import { Box, Text } from "@chakra-ui/react";
import { addresses } from "@snx-flash-tool/contracts/constants";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";

function Loading({ children }: { children?: ReactNode }): JSX.Element {
  const { chainId } = useWeb3React();
  const { error } = useSynthetix();

  return (
    <Box>
      {chainId in addresses ? (
        error ? (
          <Text>Failed to load data.</Text>
        ) : (
          children
        )
      ) : (
        <Text>
          You are connected to the wrong chain. Please switch to mainnet.
        </Text>
      )}
    </Box>
  );
}

export default Loading;
