import { useRouter } from "next/router";
import { Box, Text, Link, BoxProps } from "@chakra-ui/react";
import { addresses } from "@snx-flash-tool/contracts/constants";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";

function Loading({ props }: { props?: BoxProps }): JSX.Element | null {
  const router = useRouter();
  const { chainId } = useWeb3React();
  const { error } = useSynthetix();

  return chainId in addresses ? (
    error ? (
      <Box {...props}>
        <Text fontWeight="bold" textColor="crimson">
          Failed to load data. Please{" "}
          <Link textDecoration="underline" onClick={() => router.reload()}>
            reload
          </Link>{" "}
          and try again.
        </Text>
      </Box>
    ) : null
  ) : (
    <Box {...props}>
      <Text fontWeight="bold" textColor="crimson">
        You are connected to the wrong network. Please switch to mainnet.
      </Text>
    </Box>
  );
}

export default Loading;
