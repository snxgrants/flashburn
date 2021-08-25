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
  Tooltip,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
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
            {/* eslint-disable @next/next/no-img-element */}
            <img src={src} alt={alt} width={40} height={40} />
            <InputGroup marginLeft="2">
              <Input
                disabled={disabled}
                width="56"
                type="number"
                size="lg"
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
                    h="1.75rem"
                    marginTop="2"
                    marginRight="1"
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
            <Text fontSize="sm" marginRight="2" color="#11849e">
              {priceImpact !== undefined ? (
                <>
                  <Tooltip
                    label="Minimum sUSD Received"
                    aria-label="Minimum Received"
                  >
                    {`$${formatAmount(usdAmount)}`}
                  </Tooltip>
                  <Tooltip
                    label="Maximum Price Impact"
                    aria-label="Price Impact"
                  >
                    {` (${priceImpact}%) `}
                  </Tooltip>
                  <Tooltip
                    label="Any extra sUSD received will be automatically sent back to you after burning"
                    aria-label="Info"
                  >
                    <InfoOutlineIcon marginBottom="0.5" size="xs" />
                  </Tooltip>
                </>
              ) : (
                `$${formatAmount(usdAmount)}`
              )}
            </Text>
          </Flex>
        </Flex>
      </Center>
    </Box>
  );
}

export default AmountInput;
