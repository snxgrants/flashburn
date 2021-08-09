import Image from "next/image";
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
  Text,
  Select,
  Link,
} from "@chakra-ui/react";
import { ArrowDownIcon, SettingsIcon, RepeatIcon } from "@chakra-ui/icons";
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
  setSlippage,
  isSUSDMax,
  loading,
  isBurnApproved,
  isApproved,
  isValid,
  isInputValid,
  oneInchError,
  approveBurn,
  approve,
  burn,
  fetchTrade,
  priceImpact,
  slippage,
  props,
}: BurnInterface & { props?: BoxProps }): JSX.Element {
  const { provider, chainId } = useWeb3React();
  const { balances, loaded, error } = useSynthetix();
  const {
    rateForCurrency,
    sUSDDecimals,
    balanceOf,
    snxDecimals,
    debtBalanceOf,
  } = balances;
  const isRefreshDisabled: boolean = loading || sUSDAmountBN.toString() === "0";

  const options: string[] = ["0.1", "0.5", "1", "3"];

  return (
    <Box {...props}>
      <Flex marginBottom="2">
        <Stat>
          <StatLabel>SNX Price</StatLabel>
          <StatNumber>
            {provider !== undefined && !error ? (
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
        <IconButton
          bg="#06061B"
          marginTop="2"
          marginRight="1"
          border="2px"
          aria-label="Reload prices"
          disabled={isRefreshDisabled}
          onClick={fetchTrade}
          icon={
            loading ? (
              <Spinner w={6} h={6} />
            ) : (
              <RepeatIcon color="#00D1FF" w={6} h={6} />
            )
          }
          _hover={{
            bg: isRefreshDisabled ? "#06061B" : "white",
          }}
        />
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
            <PopoverCloseButton marginTop="1" />
            <PopoverHeader>Settings</PopoverHeader>
            <PopoverBody>
              <Flex justifyContent="space-between">
                <Text marginTop="1">Slippage</Text>
                <Select
                  width="25"
                  height="8"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                >
                  {options.map((value) => (
                    <option key={value} value={value}>{`${value}%`}</option>
                  ))}
                </Select>
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
        priceImpact={priceImpact}
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
              disabled={!(isBurnApproved && !isApproved && isValid && !loading)}
              onClick={approve}
            >
              Approve SNX
            </Button>
            <Button
              color="black"
              disabled={!(isBurnApproved && isApproved && isValid && !loading)}
              onClick={burn}
            >
              Burn
            </Button>
          </Flex>
        ) : (
          <WalletButton />
        )}
      </Center>
      <Center marginTop="3">
        <Flex fontWeight="bold">
          Powered by{" "}
          <Box marginTop="0.5" marginLeft="1.5">
            <Link
              href={`https://app.1inch.io/#/${
                chainId === 1337 ? 1 : chainId
              }/swap/SNX/sUSD`}
              isExternal
            >
              <Image src={"/1inch.svg"} alt={"1inch"} width={20} height={20} />
            </Link>
          </Box>
        </Flex>
      </Center>
      {oneInchError && (
        <Center marginTop="1">
          <Text fontWeight="bold" textColor="crimson">
            1inch failed. Please{" "}
            <Link textDecoration="underline" onClick={() => fetchTrade()}>
              try again
            </Link>{" "}
            or enter a valid amount.
          </Text>
        </Center>
      )}
    </Box>
  );
}

export default Burn;
