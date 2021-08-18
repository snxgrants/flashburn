import { useCallback } from "react";
import { ContractTransaction } from "ethers";
import { Box, Link, Spinner, useToast, ToastId, Text } from "@chakra-ui/react";
import { addresses } from "@snx-flash-tool/contracts/constants";
import useWeb3React from "./useWeb3React";

function useTransaction(): {
  sendTransaction: (
    transaction: Promise<ContractTransaction>,
    loaded?: () => void
  ) => Promise<void>;
} {
  const toast = useToast();
  const { chainId } = useWeb3React();
  const explorer: string =
    addresses[chainId in addresses ? chainId : 1].explorer;

  const sendTransaction = useCallback(
    async (transaction: Promise<ContractTransaction>, loaded?: () => void) => {
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
        if (loaded) {
          loaded();
        }
        if (toastId) {
          toast.update(toastId, {
            description: (
              <Box>
                <Link href={`${explorer}tx/${tx.hash}`} isExternal>
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
                <Link href={`${explorer}tx/${tx.hash}`} isExternal>
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
                <Link href={`${explorer}tx/${tx.hash}`} isExternal>
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
        if (loaded) {
          loaded();
        }
        if (toastId) {
          toast.update(toastId, {
            description: (
              <Box>
                <Text
                  fontWeight={"bold"}
                >{`Transaction rejected. Please try again.`}</Text>
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
