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
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import { formatAmount } from "../../utils";

function AmountInput({
  src,
  alt,
  disabled,
  amount,
  setAmount,
  setMaxSUSD,
  badgeText,
  badgeAmount,
  isSUSDMax,
  usdAmount,
  props,
}: {
  src: string;
  alt: string;
  amount: string;
  disabled: boolean;
  setAmount: (value: string) => void;
  setMaxSUSD: () => void;
  badgeText: string;
  badgeAmount: string;
  isSUSDMax: boolean;
  usdAmount: string;
  props?: BoxProps;
}): JSX.Element {
  return (
    <Box {...props}>
      <Center marginBottom="1">
        <Badge
          colorScheme="black"
          border="1px"
        >{`${badgeText}: ${badgeAmount}`}</Badge>
      </Center>
      <Center>
        <Flex flexDirection="column">
          <Flex>
            <Image src={src} alt={alt} width={40} height={40} />
            <InputGroup marginLeft="2">
              <Input
                disabled={disabled}
                width="56"
                type="number"
                isReadOnly={disabled}
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
                isInvalid={false}
                errorBorderColor="crimson"
                focusBorderColor={"#00D1FF"}
              />
              {!disabled && (
                <InputRightElement width="4rem">
                  <Button
                    marginRight="3"
                    h="1.75rem"
                    size="sm"
                    onClick={setMaxSUSD}
                    color={isSUSDMax ? "#00D1FF" : "#06061B"}
                  >
                    Max
                  </Button>
                </InputRightElement>
              )}
            </InputGroup>
          </Flex>
          <Text marginLeft="auto" fontSize="sm" marginRight="4" color="#11849e">
            ${formatAmount(usdAmount)}
          </Text>
        </Flex>
      </Center>
    </Box>
  );
}

export default AmountInput;
