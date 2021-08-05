import { Box, Flex, Spacer, Text, Progress } from "@chakra-ui/react";

function DataBox({
  title,
  info,
}: {
  title: string;
  info: string;
}): JSX.Element {
  return (
    <Box width="full" sx={{ "--my-color": "#53c8c4" }}>
      <Flex>
        <Text fontWeight="bold">{title}</Text>
        <Spacer />
        <Text fontWeight="bold" textColor="white">
          {info}
        </Text>
      </Flex>
      <Progress
        colorScheme="synthetix"
        backgroundColor="white"
        size="sm"
        value={50}
      />
    </Box>
  );
}

export default DataBox;
