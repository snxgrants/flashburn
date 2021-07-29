import type { AppProps } from "next/app";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { Web3ReactProvider } from "../hooks/useWeb3React";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#06061B",
        color: "#00D1FF",
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Web3ReactProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Web3ReactProvider>
  );
}
export default MyApp;
