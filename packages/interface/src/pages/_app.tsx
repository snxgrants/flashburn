import type { AppProps } from "next/app";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { Web3ReactProvider } from "../hooks/useWeb3React";
import { SynthetixProvider } from "../hooks/useSynthetix";

const theme = extendTheme({
  colors: {
    synthetix: {
      50: "#00D1FF",
      100: "#00D1FF",
      200: "#00D1FF",
      300: "#00D1FF",
      400: "#00D1FF",
      500: "#00D1FF",
      600: "#00D1FF",
      700: "#00D1FF",
      800: "#00D1FF",
      900: "#00D1FF",
    },
  },
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
      <SynthetixProvider>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </SynthetixProvider>
    </Web3ReactProvider>
  );
}
export default MyApp;
