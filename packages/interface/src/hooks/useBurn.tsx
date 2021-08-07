import { useState, useMemo, useCallback, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import useSynthetix from "./useSynthetix";
import useWeb3React from "./useWeb3React";
import useRequest from "./useRequest";
import {
  stripInputValue,
  tryParseUnits,
  fetchQuoteURL,
  OneInchQuote,
} from "../utils";

export interface Burn {
  snxAmount: string;
  sUSDAmount: string;
  isSUSDMax: boolean;
  snxAmountBN: BigNumber;
  sUSDAmountBN: BigNumber;
  snxUSDAmountBN: BigNumber;
  setSnxAmount: (value: string) => void;
  setSUSDAmount: (value: string) => void;
  setMaxSUSD: () => void;
}

function useBurn(): Burn {
  const { provider, chainId } = useWeb3React();
  const { balances, synthetixAddresses } = useSynthetix();
  const { cancellableRequest } = useRequest(false);
  const { snxDecimals, sUSDDecimals, debtBalanceOf, rateForCurrency } =
    balances;
  const { snx, sUSD } = synthetixAddresses;
  const [snxAmount, setSnxAmount] = useState<string>("0");
  const [sUSDAmount, setSUSDAmount] = useState<string>("0");

  const snxAmountBN: BigNumber = useMemo(
    () => tryParseUnits(stripInputValue(snxAmount), snxDecimals),
    [snxAmount, snxDecimals]
  );
  const sUSDAmountBN: BigNumber = useMemo(
    () => tryParseUnits(stripInputValue(sUSDAmount), sUSDDecimals),
    [sUSDAmount, sUSDDecimals]
  );

  const snxUSDAmountBN: BigNumber = useMemo(
    () =>
      snxAmountBN
        .mul(rateForCurrency)
        .div(ethers.utils.parseUnits("1", snxDecimals)),
    [snxAmountBN, rateForCurrency, snxDecimals]
  );
  const sUSDSNXAmountBN: BigNumber = useMemo(
    () =>
      rateForCurrency.isZero()
        ? BigNumber.from("0")
        : sUSDAmountBN
            .mul(ethers.utils.parseUnits("1", sUSDDecimals))
            .div(rateForCurrency),
    [sUSDAmountBN, rateForCurrency, sUSDDecimals]
  );

  const isSUSDMax: boolean = useMemo(
    () =>
      ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals).toString() ===
      sUSDAmount,
    [debtBalanceOf, sUSDDecimals, sUSDAmount]
  );

  const setMaxSUSD: () => void = useCallback(() => {
    const value: string = ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals);
    setSUSDAmount(value);
  }, [debtBalanceOf, sUSDDecimals, setSUSDAmount]);

  const fetchTrade: () => Promise<void> = useCallback(async () => {
    if (!sUSDSNXAmountBN.isZero()) {
      try {
        const oneInchTrade: OneInchQuote | undefined = await cancellableRequest(
          fetchQuoteURL(chainId, snx, sUSD, sUSDSNXAmountBN.toString()),
          false
        );
        console.log(oneInchTrade);
      } catch (error) {
        console.log(error.message);
        setSnxAmount("0");
      }
    }
  }, [chainId, snx, sUSD, sUSDSNXAmountBN, cancellableRequest, setSnxAmount]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  return {
    snxAmount,
    sUSDAmount,
    isSUSDMax,
    snxAmountBN,
    sUSDAmountBN,
    snxUSDAmountBN,
    setSnxAmount,
    setSUSDAmount,
    setMaxSUSD,
  };
}

export default useBurn;
