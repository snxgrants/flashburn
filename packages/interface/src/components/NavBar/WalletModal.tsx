import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Heading,
  Center,
  Link,
  useClipboard,
} from "@chakra-ui/react";

function WalletModal({
  address,
  logoutOfWeb3Modal,
  isOpen,
  onClose,
}: {
  address: string;
  logoutOfWeb3Modal?: () => void;
  isOpen: boolean;
  onClose: () => void;
}): JSX.Element {
  const { hasCopied, onCopy }: { hasCopied: boolean; onCopy: () => void } =
    useClipboard(address);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="black">Wallet</ModalHeader>
        <ModalCloseButton
          background="blackAlpha.500"
          color="black"
          _hover={{ background: "blackAlpha.600" }}
        />
        <ModalBody>
          <Heading
            as="h1"
            size="md"
            marginBottom="4"
            textAlign="center"
            color="black"
          >
            {address}
          </Heading>
          <Center>
            <Button color="black" size="sm" marginRight="1" onClick={onCopy}>
              {hasCopied ? "Copied" : "Copy"}
            </Button>
            <Link
              href={`https://etherscan.io/address/${address}`}
              isExternal
              color="black"
            >
              <Button size="sm">Explorer ↗</Button>
            </Link>
          </Center>
        </ModalBody>
        <ModalFooter>
          <Button
            color="black"
            colorScheme="blackAlpha"
            mr={3}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            color="black"
            mr={3}
            onClick={() => {
              if (logoutOfWeb3Modal) {
                logoutOfWeb3Modal();
              }
            }}
          >
            Disconnect Wallet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default WalletModal;
