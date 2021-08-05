import { Box, Text } from "@chakra-ui/react";

function InfoBox({
  title,
  info,
}: {
  title: string;
  info: string;
}): JSX.Element {
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
