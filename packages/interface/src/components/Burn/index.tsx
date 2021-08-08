import {
  Box,
  BoxProps,
  Button,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Flex,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Input,
  Text,
} from "@chakra-ui/react";
import { ArrowDownIcon, SettingsIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";
import { Burn as BurnInterface } from "../../hooks/useBurn";
import useWeb3React from "../../hooks/useWeb3React";
import useSynthetix from "../../hooks/useSynthetix";
import WalletButton from "../NavBar/WalletButton";
import AmountInput from "./AmountInput";
import { formatAmount } from "../../utils";

function Burn({
  snxAmount,
  sUSDAmount,
  sUSDAmountBN,
  snxUSDAmountBN,
  setSnxAmount,
  setSUSDAmount,
  setMaxSUSD,
  isSUSDMax,
  loading,
  isBurnApproved,
  isApproved,
  isValid,
  isInputValid,
  approveBurn,
  approve,
  burn,
  props,
}: BurnInterface & { props?: BoxProps }): JSX.Element {
  const { provider } = useWeb3React();
  const { balances, loaded } = useSynthetix();
  const {
    rateForCurrency,
    sUSDDecimals,
    balanceOf,
    snxDecimals,
    debtBalanceOf,
  } = balances;

  return (
    <Box {...props}>
      <Flex marginBottom="2">
        <Stat>
          <StatLabel>SNX Price</StatLabel>
          <StatNumber>
            {provider !== undefined ? (
              loaded ? (
                `$${formatAmount(
                  ethers.utils.formatUnits(rateForCurrency, sUSDDecimals)
                )}`
              ) : (
                <>
                  {"$ "}
                  <Spinner size="sm" />
                </>
              )
            ) : (
              "$-"
            )}
          </StatNumber>
        </Stat>
        <Popover id={"popover"}>
          <PopoverTrigger>
            <IconButton
              bg="#06061B"
              marginTop="2"
              border="2px"
              aria-label="Search database"
              icon={<SettingsIcon color="#00D1FF" w={6} h={6} />}
              _hover={{
                bg: "white",
              }}
            />
          </PopoverTrigger>
          <PopoverContent maxWidth="60" bg="#06061B">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Settings</PopoverHeader>
            <PopoverBody>
              <Flex justifyContent="space-between">
                <Text marginTop="1">Slippage (%)</Text>
                <Input
                  disabled
                  width="20"
                  height="8"
                  type="number"
                  value={0.5}
                />
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
      <AmountInput
        badgeText="SNX Balance"
        disabled={true}
        setMaxSUSD={setMaxSUSD}
        amount={snxAmount}
        setAmount={setSnxAmount}
        isSUSDMax={isSUSDMax}
        isValid={true}
        usdAmount={ethers.utils.formatUnits(snxUSDAmountBN, snxDecimals)}
        badgeAmount={
          provider !== undefined
            ? formatAmount(ethers.utils.formatUnits(balanceOf, snxDecimals))
            : "-"
        }
        src="/snx.svg"
        alt="snx"
      />
      <Center marginBottom="2" marginTop={-3}>
        <ArrowDownIcon w={5} h={5} border="1px" rounded="sm" />
      </Center>
      <AmountInput
        badgeText="sUSD Debt"
        disabled={false}
        setMaxSUSD={setMaxSUSD}
        amount={sUSDAmount}
        setAmount={setSUSDAmount}
        isSUSDMax={isSUSDMax}
        isValid={isInputValid}
        usdAmount={ethers.utils.formatUnits(sUSDAmountBN, sUSDDecimals)}
        loading={loading}
        badgeAmount={
          provider !== undefined
            ? formatAmount(
                ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals)
              )
            : "-"
        }
        src="/sUSD.svg"
        alt="sUSD"
      />
      <Center marginTop="2">
        {provider !== undefined ? (
          <Flex>
            <Button
              marginRight="1"
              color="black"
              disabled={!(!isBurnApproved && isValid)}
              onClick={approveBurn}
            >
              Approve Burn
            </Button>
            <Button
              marginRight="1"
              color="black"
              disabled={!(isBurnApproved && !isApproved && isValid)}
              onClick={approve}
            >
              Approve SNX
            </Button>
            <Button
              color="black"
              disabled={!(isBurnApproved && isApproved && isValid)}
              onClick={burn}
            >
              Burn
            </Button>
          </Flex>
        ) : (
          <WalletButton />
        )}
      </Center>
    </Box>
  );
}

export default Burn;
