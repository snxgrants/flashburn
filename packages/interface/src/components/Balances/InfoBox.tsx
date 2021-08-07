import { Box, Text } from "@chakra-ui/react";

export interface InfoInterface {
  title: string;
  info: string;
}

function InfoBox({ title, info }: InfoInterface): JSX.Element {
  return (
    <Box>
      <Text fontWeight="bold" textAlign="center">
        {title}
      </Text>
      <Text
        fontWeight="bold"
        fontSize="2xl"
        textColor="white"
        textAlign="center"
      >
        {info}
      </Text>
    </Box>
  );
}

export default InfoBox;
