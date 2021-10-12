import { useState, useMemo, useCallback, useEffect } from "react";
import { ethers, BigNumber, Signer } from "ethers";
import { addresses } from "@snx-flash-tool/contracts/constants";
import {
  SNXFlashLoanTool,
  SNXFlashLoanTool__factory,
} from "@snx-flash-tool/contracts/types";
import useSynthetix from "./useSynthetix";
import useWeb3React from "./useWeb3React";
import useTransaction from "./useTransaction";
import useRequest from "./useRequest";
import {
  IDelegateApprovals,
  IDelegateApprovals__factory,
  ERC20,
  ERC20__factory,
} from "../types";
import {
  stripInputValue,
  tryParseUnits,
  fetchSwapURL,
  OneInchSwap,
  formatAmount,
} from "../utils";

export interface SwapData {
  to: string;
  data: string;
  snxAmount: BigNumber;
}

export interface Burn {
  snxAmount: string;
  sUSDAmount: string;
  isSUSDMax: boolean;
  snxAmountBN: BigNumber;
  sUSDAmountBN: BigNumber;
  snxUSDAmountBN: BigNumber;
  loading: boolean;
  isBurnApproved: boolean;
  isApproved: boolean;
  isValid: boolean;
  isInputValid: boolean;
  priceImpact: string;
  oneInchError: boolean;
  amountError: boolean;
  slippage: string;
  loadingApproveBurn: boolean;
  loadingApprove: boolean;
  loadingBurn: boolean;
  setSnxAmount: (value: string) => void;
  setSUSDAmount: (value: string) => void;
  setSlippage: (value: string) => void;
  setMaxSUSD: () => void;
  fetchTrade: () => Promise<SwapData | undefined>;
  approveBurn: () => Promise<void>;
  approve: () => Promise<void>;
  burn: (swapData: SwapData | undefined) => Promise<void>;
  burnButton: () => Promise<void>;
}

const approveBuffer: string = "1100";

function useBurn(): Burn {
  const { provider, chainId, address } = useWeb3React();
  const { balances, synthetixAddresses, fetchBalances } = useSynthetix();
  const { sendTransaction } = useTransaction();
  const { cancellableRequest, cancelAll } = useRequest();
  const {
    snxDecimals,
    sUSDDecimals,
    debtBalanceOf,
    rateForCurrency,
    canBurnFor,
    allowance,
    balanceOf,
  } = balances;
  const { snx, sUSD, delegateApprovals } = synthetixAddresses;
  const [snxAmount, setSnxAmount] = useState<string>("0");
  const [sUSDAmount, setSUSDAmount] = useState<string>("0");
  const [slippage, setSlippage] = useState<string>("0.5");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingApproveBurn, setLoadingApproveBurn] = useState<boolean>(false);
  const [loadingApprove, setLoadingApprove] = useState<boolean>(false);
  const [loadingBurn, setLoadingBurn] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<boolean>(false);
  const [oneInchError, setOneInchError] = useState<boolean>(false);

  const snxFlashToolAddress: string =
    addresses[chainId in addresses ? chainId : 1].snxFlashTool;

  const snxAmountBN: BigNumber = useMemo(
    () => tryParseUnits(stripInputValue(snxAmount), snxDecimals),
    [snxAmount, snxDecimals]
  );
  const sUSDAmountBN: BigNumber = useMemo(
    () =>
      tryParseUnits(stripInputValue(sUSDAmount), sUSDDecimals, setAmountError),
    [sUSDAmount, sUSDDecimals, setAmountError]
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

  const isBurnApproved: boolean = canBurnFor;
  const isApproved: boolean = useMemo(
    () =>
      snxAmountBN.gt(BigNumber.from("0")) ? snxAmountBN.lte(allowance) : false,
    [allowance]
  );
  const isValid: boolean =
    sUSDAmountBN.gt(BigNumber.from("0")) &&
    snxAmountBN.gt(BigNumber.from("0")) &&
    sUSDAmountBN.lte(debtBalanceOf) &&
    snxAmountBN.lte(balanceOf);
  const isInputValid: boolean =
    sUSDAmountBN.gte(BigNumber.from("0")) &&
    sUSDAmountBN.lte(debtBalanceOf) &&
    !amountError;

  const priceImpact: string = useMemo(
    () =>
      snxUSDAmountBN.gt(BigNumber.from("0")) &&
      sUSDAmountBN.gt(BigNumber.from("0")) &&
      !loading
        ? snxUSDAmountBN.gt(sUSDAmountBN)
          ? "-" +
            formatAmount(
              (
                BigNumber.from("10000")
                  .sub(
                    sUSDAmountBN
                      .mul(BigNumber.from("10000"))
                      .div(snxUSDAmountBN)
                  )
                  .toNumber() / 100
              ).toString()
            )
          : "+" +
            formatAmount(
              (
                BigNumber.from("10000")
                  .sub(
                    snxUSDAmountBN
                      .mul(BigNumber.from("10000"))
                      .div(sUSDAmountBN)
                  )
                  .toNumber() / 100
              ).toString()
            )
        : "+0",
    [snxUSDAmountBN, sUSDAmountBN, loading]
  );

  const setMaxSUSD: () => void = useCallback(() => {
    const value: string = ethers.utils.formatUnits(debtBalanceOf, sUSDDecimals);
    setSUSDAmount(value);
  }, [debtBalanceOf, sUSDDecimals, setSUSDAmount]);

  const fetchTrade: () => Promise<SwapData | undefined> =
    useCallback(async () => {
      let swapData:
        | { to: string; data: string; snxAmount: BigNumber }
        | undefined = undefined;
      if (sUSDSNXAmountBN.gt(BigNumber.from("0"))) {
        setLoading(true);
        setOneInchError(false);
        try {
          let searching: boolean = true;
          let searchCount: number = 0;
          let tradeSUSDAmount: BigNumber = sUSDSNXAmountBN;
          while (searching) {
            if (searchCount > 15) {
              throw new Error("Search exceeded allowed iterations.");
            }
            const oneInchTrade: OneInchSwap | undefined =
              await cancellableRequest(
                fetchSwapURL(
                  chainId === 1337 ? 1 : chainId,
                  snx,
                  sUSD,
                  snxFlashToolAddress,
                  tradeSUSDAmount.toString(),
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
                setSnxAmount("0");
                setLoading(false);
                setOneInchError(false);
              } else {
                if (
                  receiveSUSDAmount.lt(
                    sUSDAmountBN.mul(slippageBN).div(BigNumber.from("1000"))
                  )
                ) {
                  const margin: BigNumber = receiveSUSDAmount
                    .mul(BigNumber.from("100"))
                    .div(sUSDAmountBN);
                  let incrementAmount: BigNumber = BigNumber.from("1005");
                  if (margin.lt(BigNumber.from("99"))) {
                    incrementAmount = BigNumber.from("100000").div(margin);
                  }
                  tradeSUSDAmount = tradeSUSDAmount
                    .mul(incrementAmount)
                    .div(BigNumber.from("1000"));
                } else {
                  setSnxAmount(
                    ethers.utils.formatUnits(sendSnxAmount, snxDecimals)
                  );
                  searching = false;
                  setLoading(false);
                  setOneInchError(false);
                  swapData = {
                    to: oneInchTrade.tx.to,
                    data: oneInchTrade.tx.data,
                    snxAmount: sendSnxAmount,
                  };
                }
              }
            } else {
              searching = false;
            }
            searchCount += 1;
          }
        } catch (error) {
          console.log(error.message);
          setSnxAmount("0");
          setLoading(false);
          setOneInchError(true);
        }
      } else {
        setSnxAmount("0");
        setLoading(false);
        setOneInchError(false);
        cancelAll();
      }
      return swapData;
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
      cancelAll,
    ]);

  const approveBurn: () => Promise<void> = useCallback(async () => {
    if (
      !isBurnApproved &&
      provider !== undefined &&
      delegateApprovals !== ethers.constants.AddressZero &&
      address !== ethers.constants.AddressZero
    ) {
      setLoadingApproveBurn(true);
      const signer: Signer = await provider.getUncheckedSigner();
      const delegateApprovalsContract: IDelegateApprovals =
        IDelegateApprovals__factory.connect(delegateApprovals, signer);
      await sendTransaction(
        delegateApprovalsContract.approveBurnOnBehalf(snxFlashToolAddress),
        () => setLoadingApproveBurn(false)
      );
      if (fetchBalances) await fetchBalances();
    } else {
      setLoadingApproveBurn(false);
    }
  }, [
    isBurnApproved,
    provider,
    delegateApprovals,
    address,
    snxFlashToolAddress,
    fetchBalances,
    sendTransaction,
    setLoadingApproveBurn,
  ]);

  const approve: () => Promise<void> = useCallback(async () => {
    if (
      !isApproved &&
      provider !== undefined &&
      snx !== ethers.constants.AddressZero &&
      address !== ethers.constants.AddressZero
    ) {
      setLoadingApprove(true);
      const signer: Signer = await provider.getUncheckedSigner();
      const snxContract: ERC20 = ERC20__factory.connect(snx, signer);
      await sendTransaction(
        snxContract.approve(
          snxFlashToolAddress,
          snxAmountBN.mul(approveBuffer).div(BigNumber.from("1000"))
        ),
        () => setLoadingApprove(false)
      );
      if (fetchBalances) await fetchBalances();
    } else {
      setLoadingApprove(false);
    }
  }, [
    isApproved,
    provider,
    snx,
    address,
    snxFlashToolAddress,
    snxAmountBN,
    fetchBalances,
    sendTransaction,
    setLoadingApprove,
  ]);

  const burn: (swapData: SwapData | undefined) => Promise<void> = useCallback(
    async (swapData: SwapData | undefined) => {
      if (
        isBurnApproved &&
        isApproved &&
        isValid &&
        provider !== undefined &&
        swapData !== undefined &&
        snxFlashToolAddress !== ethers.constants.AddressZero &&
        address !== ethers.constants.AddressZero
      ) {
        setLoadingBurn(true);
        const signer: Signer = await provider.getUncheckedSigner();
        const snxFlashToolContract: SNXFlashLoanTool =
          SNXFlashLoanTool__factory.connect(snxFlashToolAddress, signer);
        const gasEstimate: BigNumber =
          await snxFlashToolContract.estimateGas.burn(
            isSUSDMax ? ethers.constants.MaxUint256 : sUSDAmountBN,
            swapData.snxAmount,
            swapData.data
          );
        await sendTransaction(
          snxFlashToolContract.burn(
            isSUSDMax ? ethers.constants.MaxUint256 : sUSDAmountBN,
            swapData.snxAmount,
            swapData.data,
            {
              gasLimit: gasEstimate.mul("120").div("100"),
            }
          ),
          () => setLoadingBurn(false)
        );
        if (fetchBalances) await fetchBalances();
      } else {
        setLoadingBurn(false);
      }
    },
    [
      isBurnApproved,
      isApproved,
      isValid,
      provider,
      address,
      snxFlashToolAddress,
      isSUSDMax,
      sUSDAmountBN,
      fetchBalances,
      sendTransaction,
      setLoadingBurn,
    ]
  );

  const burnButton: () => Promise<void> = useCallback(async () => {
    setLoadingBurn(true);
    const swapData: SwapData | undefined = await fetchTrade();
    if (
      swapData !== undefined &&
      swapData.snxAmount.gt(BigNumber.from("0")) &&
      swapData.snxAmount.lte(allowance)
    ) {
      await burn(swapData);
    } else {
      setLoadingBurn(false);
    }
  }, [setLoadingBurn, fetchTrade, allowance, burn]);

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
    isBurnApproved,
    isApproved,
    isValid,
    isInputValid,
    priceImpact,
    oneInchError,
    amountError,
    slippage,
    loadingApproveBurn,
    loadingApprove,
    loadingBurn,
    setSnxAmount,
    setSUSDAmount,
    setMaxSUSD,
    setSlippage,
    fetchTrade,
    approveBurn,
    approve,
    burn,
    burnButton,
  };
}

export default useBurn;
