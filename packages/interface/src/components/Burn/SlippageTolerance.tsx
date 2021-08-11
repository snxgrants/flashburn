import { useEffect, useRef } from "react";
import { FlexProps, Button, Flex, Select } from "@chakra-ui/react";

const slippageOptions: string[] = ["0.1", "0.5", "1", "3"];

function SlippageTolerance({
  slippage,
  setSlippage,
  props,
}: {
  slippage: string;
  setSlippage: (value: string) => void;
  props?: FlexProps;
}): JSX.Element {
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (mounted.current) {
      localStorage.setItem("slippage", slippage);
    }
  }, [slippage]);

  useEffect(() => {
    const getSlippage: string | null = localStorage.getItem("slippage");
    if (getSlippage !== null && slippageOptions.includes(getSlippage)) {
      setSlippage(getSlippage);
    }
    mounted.current = true;
  }, [setSlippage]);

  return (
    <Flex {...props}>
      <Select
        width="28"
        height="8"
        marginRight="1"
        value={slippage}
        onChange={(e) => setSlippage(e.target.value)}
      >
        {slippageOptions.map((value: string) => (
          <option key={value} value={value}>{`${value}%`}</option>
        ))}
      </Select>
      <Button
        bg="#06061B"
        border="1px"
        borderColor="white"
        size="sm"
        onClick={() => setSlippage("0.5")}
      >
        Auto
      </Button>
    </Flex>
  );
}

export default SlippageTolerance;
