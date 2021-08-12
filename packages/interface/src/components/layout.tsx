import { ReactNode } from "react";
import Head from "next/head";
import { Box, Center, Divider } from "@chakra-ui/react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { siteURL } from "../constants";

const siteTwitter: string = "@GauthamGE";
const siteImageAlt: string = "Synthetix Logo";
const siteLogo: string = `${siteURL}logo.png`;

function Layout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Box>
      <Head>
        <meta charSet="utf-8" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="favicon-16x16.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="manifest.json" />
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#00d1ff" />
        <meta name="msapplication-TileColor" content="#06061b" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={siteLogo} />
        <meta property="og:image:alt" content={siteImageAlt} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content={siteTwitter} />
        <meta name="twitter:creator" content={siteTwitter} />
        <meta name="twitter:image" content={siteLogo} />
        <meta name="twitter:image:alt" content={siteImageAlt} />
      </Head>
      <Center>
        <Box w={1000} position="relative" minHeight="100vh" overflow="hidden">
          <Box marginBottom="20">
            <NavBar />
            {children}
          </Box>
          <Box position="absolute" bottom={0} width="100%">
            <Divider />
            <Footer />
          </Box>
        </Box>
      </Center>
    </Box>
  );
}

export default Layout;
