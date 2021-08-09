import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useReducer,
  Context,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { INFURA_ID } from "../constants";
import WalletConnectProvider from "@walletconnect/web3-provider";

interface State {
  provider?: ethers.providers.Web3Provider;
  address: string;
  chainId: number;
}

enum ActionType {
  CONNECTED,
}

type Action = {
  type: ActionType.CONNECTED;
  payload: Omit<State, "provider"> & {
    provider: ethers.providers.Web3Provider;
  };
};

export type Web3React = State & {
  loadWeb3Modal?: () => Promise<void>;
  logoutOfWeb3Modal?: () => Promise<void>;
};

export const initialData: Web3React = {
  provider: undefined,
  address: ethers.constants.AddressZero,
  chainId: 1,
  loadWeb3Modal: undefined,
  logoutOfWeb3Modal: undefined,
};

const initialState: State = {
  provider: undefined,
  address: ethers.constants.AddressZero,
  chainId: 1,
};

const Web3Context: Context<Web3React> = createContext<Web3React>(initialData);

function useWeb3React(): Web3React {
  return useContext(Web3Context);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.CONNECTED:
      const { provider, address, chainId } = action.payload;
      return { ...state, provider, address, chainId };
    default:
      throw new Error();
  }
}

export function Web3ReactProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter();
  const [state, dispatch] = useReducer<(state: State, action: Action) => State>(
    reducer,
    initialState
  );
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const [web3Provider, setWeb3Provider] = useState<any>();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [autoLoaded, setAutoLoaded] = useState<boolean>(false);
  const { provider } = state;
  const {
    autoLoad,
    infuraId,
    NETWORK,
  }: {
    autoLoad: boolean;
    infuraId: string;
    NETWORK: string;
  } = {
    autoLoad: true,
    infuraId: INFURA_ID,
    NETWORK: "mainnet",
  };

  // Open wallet selection modal.
  const loadWeb3Modal: () => Promise<void> = useCallback(async () => {
    try {
      if (web3Modal) {
        const newProvider = await web3Modal.connect();
        setWeb3Provider(newProvider);
        const newWeb3Provider: ethers.providers.Web3Provider =
          new ethers.providers.Web3Provider(newProvider, "any");
        const newNetwork: ethers.providers.Network =
          await newWeb3Provider.getNetwork();
        const newAddress: string = await newWeb3Provider
          .getSigner()
          .getAddress();
        dispatch({
          type: ActionType.CONNECTED,
          payload: {
            provider: newWeb3Provider,
            address: newAddress,
            chainId: newNetwork.chainId,
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [web3Modal]);

  const logoutOfWeb3Modal: () => Promise<void> = useCallback(
    async function () {
      if (web3Modal) {
        await web3Modal.clearCachedProvider();
        router.reload();
      }
    },
    [web3Modal, router]
  );

  useEffect(() => {
    const web3Modal: Web3Modal = new Web3Modal({
      network: NETWORK,
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId,
          },
        },
      },
    });
    setWeb3Modal(web3Modal);
  }, []);

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (autoLoad && !autoLoaded && web3Modal && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  }, [autoLoad, autoLoaded, loadWeb3Modal, setAutoLoaded, web3Modal]);

  useEffect(() => {
    const listener = (
      newNetwork: ethers.providers.Networkish,
      oldNetwork: ethers.providers.Networkish
    ) => {
      if (oldNetwork) router.reload();
    };
    if (provider !== undefined) provider.on("network", listener);
    return () => {
      if (provider !== undefined) provider.off("network", listener);
    };
  }, [provider]);

  useEffect(() => {
    const accountsListener = () => router.reload();
    const disconnectListener = () => {
      (async () => {
        if (web3Modal) {
          await web3Modal.clearCachedProvider();
          router.reload();
        }
      })();
    };
    if (web3Provider !== undefined) {
      web3Provider.on("accountsChanged", accountsListener);
      web3Provider.on("disconnect", disconnectListener);
    }
  }, [web3Provider]);

  return (
    <Web3Context.Provider
      value={{ ...state, loadWeb3Modal, logoutOfWeb3Modal }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export default useWeb3React;
