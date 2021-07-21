import { Button, useDisclosure } from "@chakra-ui/react";
import WalletModal from "./WalletModal";
import useWeb3React from "../../hooks/useWeb3React";
import useLookupAddress from "../../hooks/useLookupAddress";
import { formatAddress } from "../../utils";

function WalletButton(): JSX.Element {
  const {
    isOpen,
    onOpen,
    onClose,
  }: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  } = useDisclosure();
  const { provider, address, loadWeb3Modal, logoutOfWeb3Modal } =
    useWeb3React();
  const { name } = useLookupAddress(address, provider);

  return (
    <>
      <Button
        color="black"
        onClick={() => {
          if (!provider) {
            if (loadWeb3Modal) {
              loadWeb3Modal();
            }
          } else {
            onOpen();
          }
        }}
      >
        {!provider
          ? "Connect Wallet"
          : name === ""
          ? formatAddress(address)
          : name}
      </Button>
      <WalletModal
        address={address}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
}

export default WalletButton;
