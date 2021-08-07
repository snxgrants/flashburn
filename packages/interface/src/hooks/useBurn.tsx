import { useState, useMemo, useCallback, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import useSynthetix from "./useSynthetix";
import useWeb3React from "./useWeb3React";
import { stripInputValue, tryParseUnits } from "../utils";

export interface Burn {
  snxAmount: string;
  sUSDAmount: string;
  isSUSDMax: boolean;
  setSnxAmount: (value: string) => void;
  setSUSDAmount: (value: string) => void;
  setMaxSUSD: () => void;
}

function useBurn(): Burn {
  const { provider, chainId } = useWeb3React();
  const { balances } = useSynthetix();
  const { snxDecimals, sUSDDecimals, debtBalanceOf } = balances;
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

  const isSUSDMax: boolean = useMemo(
    () =>
      ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals).toString() ===
      sUSDAmount,
    [debtBalanceOf, sUSDDecimals, sUSDAmount]
  );

  const setMaxSUSD: () => void = useCallback(() => {
    const value: string = ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals);
    setSUSDAmount(value);
  }, [debtBalanceOf, sUSDDecimals]);

  return {
    snxAmount,
    sUSDAmount,
    isSUSDMax,
    setSnxAmount,
    setSUSDAmount,
    setMaxSUSD,
  };
}

export default useBurn;
