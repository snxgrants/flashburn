import Head from "next/head";
import { Box, Grid, GridItem, Center } from "@chakra-ui/react";
import useBurn, { Burn as BurnInterface } from "../hooks/useBurn";
import { siteURL } from "../constants";
import { Header } from "../components/Header";
import Layout from "../components/layout";
import Loading from "../components/Loading";
import { Info, Data } from "../components/Balances";
import Burn from "../components/Burn";

const pageTitle: string = "FlashBurn - Burn sUSD Debt with Staked SNX";
const pageDescription: string = "Burn sUSD Debt with Staked SNX";
const pageURL: string = siteURL;

function Home(): JSX.Element {
  const burn: BurnInterface = useBurn();

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
        <Center>
          <Loading props={{ marginBottom: "2" }} />
        </Center>
        <Info />
        <Box
          display={{ base: "none", md: "flex" }}
          marginRight="10"
          marginLeft="10"
          marginTop="5"
        >
          <Grid width="full" templateColumns="repeat(3, 1fr)">
            <GridItem colSpan={2}>
              <Burn props={{ marginRight: 10 }} {...burn} />
            </GridItem>
            <GridItem colSpan={1}>
              <Data />
            </GridItem>
          </Grid>
        </Box>
        <Box display={{ base: "flex-col", md: "none" }} margin="2">
          <Center>
            <Burn {...burn} />
          </Center>
          <Center>
            <Data props={{ justifyContent: "center", marginTop: "5" }} />
          </Center>
        </Box>
      </Box>
    </Layout>
  );
}

export default Home;
