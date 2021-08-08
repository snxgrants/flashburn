import { useState, useMemo, useCallback, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { addresses } from "@snx-flash-tool/contracts/constants";
import useSynthetix from "./useSynthetix";
import useWeb3React from "./useWeb3React";
import useRequest from "./useRequest";
import {
  stripInputValue,
  tryParseUnits,
  fetchSwapURL,
  OneInchSwap,
} from "../utils";

export interface Burn {
  snxAmount: string;
  sUSDAmount: string;
  isSUSDMax: boolean;
  snxAmountBN: BigNumber;
  sUSDAmountBN: BigNumber;
  snxUSDAmountBN: BigNumber;
  loading: boolean;
  setSnxAmount: (value: string) => void;
  setSUSDAmount: (value: string) => void;
  setMaxSUSD: () => void;
}

const incrementSwapSearch: string = "1005";

function useBurn(): Burn {
  const { provider, chainId } = useWeb3React();
  const { balances, synthetixAddresses } = useSynthetix();
  const { cancellableRequest } = useRequest(false);
  const { snxDecimals, sUSDDecimals, debtBalanceOf, rateForCurrency } =
    balances;
  const { snx, sUSD } = synthetixAddresses;
  const [snxAmount, setSnxAmount] = useState<string>("0");
  const [sUSDAmount, setSUSDAmount] = useState<string>("0");
  const [slippage, setSlippage] = useState<string>("0.5");
  const [loading, setLoading] = useState<boolean>(false);

  const snxFlashToolAddress: string = addresses[chainId].snxFlashTool;

  const snxAmountBN: BigNumber = useMemo(
    () => tryParseUnits(stripInputValue(snxAmount), snxDecimals),
    [snxAmount, snxDecimals]
  );
  const sUSDAmountBN: BigNumber = useMemo(
    () => tryParseUnits(stripInputValue(sUSDAmount), sUSDDecimals),
    [sUSDAmount, sUSDDecimals]
  );

  const slippageBN: BigNumber = useMemo(
    () => BigNumber.from((1000 + Number(slippage) * 10).toString()),
    [slippage]
  );

  const rateForCurrencyString: string = rateForCurrency.toString();
  const snxUSDAmountBN: BigNumber = useMemo(
    () =>
      snxAmountBN
        .mul(BigNumber.from(rateForCurrencyString))
        .div(ethers.utils.parseUnits("1", snxDecimals)),
    [snxAmountBN, rateForCurrencyString, snxDecimals]
  );
  const sUSDSNXAmountBN: BigNumber = useMemo(
    () =>
      BigNumber.from(rateForCurrencyString).lte(BigNumber.from("0"))
        ? BigNumber.from("0")
        : sUSDAmountBN
            .mul(ethers.utils.parseUnits("1", sUSDDecimals))
            .div(BigNumber.from(rateForCurrencyString)),
    [sUSDAmountBN, rateForCurrencyString, sUSDDecimals]
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
    if (!sUSDSNXAmountBN.lte(BigNumber.from("0"))) {
      setLoading(true);
      try {
        let searching: boolean = true;
        let tradeSUSDAmount: BigNumber = sUSDSNXAmountBN;
        while (searching) {
          const oneInchTrade: OneInchSwap | undefined =
            await cancellableRequest(
              fetchSwapURL(
                chainId,
                snx,
                sUSD,
                snxFlashToolAddress,
                tradeSUSDAmount
                  .mul(slippageBN)
                  .div(BigNumber.from("1000"))
                  .toString(),
                slippage
              ),
              false
            );
          if (oneInchTrade) {
            const sendSnxAmount: BigNumber = BigNumber.from(
              oneInchTrade.fromTokenAmount
            );
            const receiveSUSDAmount: BigNumber = BigNumber.from(
              oneInchTrade.toTokenAmount
            );
            if (
              sendSnxAmount.lte(BigNumber.from("0")) ||
              receiveSUSDAmount.lte(BigNumber.from("0"))
            ) {
              searching = false;
              setLoading(false);
              setSnxAmount("0");
            } else {
              if (receiveSUSDAmount.lt(sUSDAmountBN)) {
                tradeSUSDAmount = tradeSUSDAmount
                  .mul(incrementSwapSearch)
                  .div(BigNumber.from("1000"));
              } else {
                setSnxAmount(
                  ethers.utils.formatUnits(sendSnxAmount, snxDecimals)
                );
                searching = false;
                setLoading(false);
              }
            }
          } else {
            searching = false;
          }
        }
      } catch (error) {
        console.log(error.message);
        setSnxAmount("0");
        setLoading(false);
      }
    } else {
      setSnxAmount("0");
      setLoading(false);
    }
  }, [
    chainId,
    snxFlashToolAddress,
    snx,
    sUSD,
    sUSDAmountBN,
    sUSDSNXAmountBN,
    snxDecimals,
    slippageBN,
    slippage,
    cancellableRequest,
    setSnxAmount,
    setLoading,
  ]);

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
    loading,
    setSnxAmount,
    setSUSDAmount,
    setMaxSUSD,
  };
}

export default useBurn;
