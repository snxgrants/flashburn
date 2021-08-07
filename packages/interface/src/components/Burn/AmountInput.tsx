import Image from "next/image";
import {
  InputGroup,
  Input,
  Flex,
  Box,
  BoxProps,
  Center,
  Badge,
  Text,
} from "@chakra-ui/react";

function AmountInput({
  src,
  alt,
  badgeText,
  badgeAmount,
  props,
}: {
  src: string;
  alt: string;
  badgeText: string;
  badgeAmount: string | number;
  props?: BoxProps;
}): JSX.Element {
  return (
    <Box {...props}>
      <Center marginBottom="1">
        <Badge
          color="synthetix"
          colorScheme="black"
          border="1px"
        >{`${badgeText}: ${badgeAmount}`}</Badge>
      </Center>
      <Center>
        <Flex flexDirection="column">
          <Flex>
            <Image src={src} alt={alt} width={40} height={40} />
            <InputGroup marginLeft="2">
              <Input disabled width="56" type="number" isReadOnly value={0} />
            </InputGroup>
          </Flex>
          <Text marginLeft="auto" fontSize="sm" marginRight="4" color="#11849e">
            $0
          </Text>
        </Flex>
      </Center>
    </Box>
  );
}

export default AmountInput;
