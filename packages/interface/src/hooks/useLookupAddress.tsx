import { useEffect, useState } from "react";
import { ethers } from "ethers";

function useLookupAddress(
  address: string,
  provider?: ethers.providers.Web3Provider
): {
  name: string;
} {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (provider) {
        try {
          const getName: string = await provider.lookupAddress(address);
          if (getName) {
            setName(getName);
          } else {
            setName("");
          }
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchData();
  }, [address, provider]);

  return { name };
}

export default useLookupAddress;
