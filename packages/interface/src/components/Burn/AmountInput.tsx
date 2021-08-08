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
  Spinner,
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
  loading,
  isValid,
  priceImpact,
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
  loading?: boolean;
  isValid: boolean;
  priceImpact?: string;
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
                isInvalid={!isValid}
                errorBorderColor="crimson"
                focusBorderColor={isValid ? "#00D1FF" : "crimson"}
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
          <Flex marginLeft="auto">
            {loading !== undefined && loading && (
              <Spinner marginTop="1.5" marginRight="1.5" size="xs" />
            )}
            <Text fontSize="sm" marginRight="4" color="#11849e">
              {priceImpact !== undefined
                ? `$${formatAmount(usdAmount) + ` (${priceImpact}%)`}`
                : `$${formatAmount(usdAmount)}`}
            </Text>
          </Flex>
        </Flex>
      </Center>
    </Box>
  );
}

export default AmountInput;
