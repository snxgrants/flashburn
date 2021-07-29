import { Container, Stack, Text, Box, Link } from "@chakra-ui/react";

function Footer(): JSX.Element {
  return (
    <Container
      as={Stack}
      maxW={"6xl"}
      paddingBottom={4}
      paddingTop={{ base: 0, md: 4 }}
      direction={{ base: "column", md: "row" }}
      spacing={4}
      justify={{ base: "center", md: "space-between" }}
      align={{ base: "center", md: "center" }}
    >
      <Box></Box>
      <Box>
        <Link href="https://github.com/gg2001/snx-flash-tool" isExternal>
          <Text as="u">GitHub</Text>
        </Link>{" "}
        •{" "}
        <Link
          href="https://etherscan.io/address/0x231e7959852509E4872C3374554784a46EB8d680"
          isExternal
        >
          <Text as="u">Etherscan</Text>
        </Link>{" "}
        • By{" "}
        <Link href="https://twitter.com/GauthamGE" isExternal>
          <Text as="u">@GauthamGE</Text>
        </Link>
      </Box>
    </Container>
  );
}

export default Footer;
