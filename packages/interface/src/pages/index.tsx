import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { siteURL } from "../constants";
import { Header } from "../components/Header";
import Layout from "../components/layout";
import Loading from "../components/Loading";
import { Top } from "../components/Balances";

const pageTitle: string = "SNX Flash Tool - Burn sUSD Debt with Staked SNX";
const pageDescription: string = "Burn sUSD Debt with Staked SNX";
const pageURL: string = siteURL;

function Home(): JSX.Element {
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
        <Header>Burn sUSD Debt with Staked SNX</Header>
        <Loading>
          <Top />
        </Loading>
      </Box>
    </Layout>
  );
}

export default Home;
