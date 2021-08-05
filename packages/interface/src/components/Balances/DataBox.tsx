import { Box, Flex, Spacer, Text, Progress } from "@chakra-ui/react";

function DataBox({
  title,
  info,
  progress,
}: {
  title: string;
  info: string;
  progress?: number;
}): JSX.Element {
  return (
    <Box width="full">
      <Flex>
        <Text fontWeight="bold">{title}</Text>
        <Spacer />
        <Text fontWeight="bold" textColor="white">
          {info}
        </Text>
      </Flex>
      {progress !== undefined && (
        <Progress
          marginTop={1}
          marginBottom={1}
          colorScheme="synthetix"
          backgroundColor="white"
          size="sm"
          value={progress}
          border="1px"
        />
      )}
    </Box>
  );
}

export default DataBox;
