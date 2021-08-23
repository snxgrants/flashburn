import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Header } from "../components/Header";
import Layout from "../components/layout";
import { siteURL } from "../constants";

const pageTitle: string = "FlashBurn - 500 Server-side error occurred";
const pageDescription: string = "500 Server-side error occurred";
const pageURL: string = siteURL;

function Custom500(): JSX.Element {
  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:url" content={pageURL} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:url" content={pageURL} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>
      <Box p={2}>
        <Header>500 Server-side error occurred</Header>
      </Box>
    </Layout>
  );
}

export default Custom500;
