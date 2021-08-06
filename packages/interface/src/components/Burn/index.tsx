import { Box, BoxProps, Button, Center } from "@chakra-ui/react";
import useWeb3React from "../../hooks/useWeb3React";
import WalletButton from "../NavBar/WalletButton";

function Burn({ props }: { props?: BoxProps }): JSX.Element {
  const { provider } = useWeb3React();

  return (
    <Box {...props}>
      <Center>
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
