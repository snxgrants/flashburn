import { useCallback } from "react";
import { ContractTransaction } from "ethers";
import { Box, Link, Spinner, useToast, ToastId, Text } from "@chakra-ui/react";

function useTransaction(): {
  sendTransaction: (transaction: Promise<ContractTransaction>) => Promise<void>;
} {
  const toast = useToast();

  const sendTransaction = useCallback(
    async (transaction: Promise<ContractTransaction>) => {
      let toastId: ToastId | undefined;
      try {
        toastId = toast({
          title: (
            <Box>
              {`Please confirm the transaction...`}
              <Spinner marginLeft={1} size={"xs"} />
            </Box>
          ),
          duration: null,
        });
        const tx = await transaction;
        if (toastId) {
          toast.update(toastId, {
            description: (
              <Box>
                <Link href={`https://etherscan.io/tx/${tx.hash}`} isExternal>
                  <Text
                    as="u"
                    fontWeight={"bold"}
                  >{`Transaction pending... ↗`}</Text>
                </Link>
                <Spinner marginLeft={1} size={"xs"} />
              </Box>
            ),
            status: "info",
            duration: null,
          });
        }
        const receipt = await tx.wait();
        if (receipt.status === 1 && toastId) {
          toast.update(toastId, {
            description: (
              <Box>
                <Link href={`https://etherscan.io/tx/${tx.hash}`} isExternal>
                  <Text
                    as="u"
                    fontWeight={"bold"}
                  >{`Transaction confirmed ↗`}</Text>
                </Link>
              </Box>
            ),
            status: "success",
          });
        } else if (toastId) {
          toast.update(toastId, {
            description: (
              <Box>
                <Link href={`https://etherscan.io/tx/${tx.hash}`} isExternal>
                  <Text
                    as="u"
                    fontWeight={"bold"}
                  >{`Transaction reverted ↗`}</Text>
                </Link>
              </Box>
            ),
            status: "error",
          });
        }
      } catch (err) {
        console.log(err);
        if (toastId) {
          toast.update(toastId, {
            description: (
              <Box>
                <Text fontWeight={"bold"}>{`Transaction rejected`}</Text>
              </Box>
            ),
            status: "error",
          });
        }
      }
    },
    [toast]
  );

  return { sendTransaction };
}

export default useTransaction;
