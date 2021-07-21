import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { siteURL } from "../constants";
import { Header, ExternalLink } from "../components/Header";
import Layout from "../components/layout";
import Loading from "../components/Loading";

const pageTitle: string = "Compound Swaps - Swap your Compound collateral";
const pageDescription: string =
  "Compound Swaps - Collateral swaps and swap & repay debt with collateral on Compound";
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
        <Header>
          Swap your{" "}
          <ExternalLink href={"https://compound.finance/"} text={"Compound"} />{" "}
          collateral
        </Header>
        <Loading></Loading>
      </Box>
    </Layout>
  );
}

export default Home;
