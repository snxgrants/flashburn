import { useRef, useCallback } from "react";
import axios, {
  AxiosResponse,
  AxiosRequestConfig,
  CancelTokenSource,
} from "axios";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type Request = (
  url: string,
  enableCache?: boolean,
  config?: AxiosRequestConfig
) => Promise<any | undefined>;

function useRequest(throwError: boolean = true): {
  request: Request;
  cancellableRequest: Request;
} {
  const cancel = useRef<CancelTokenSource>();
  const cache = useRef<{ [url: string]: any }>({});

  const request: Request = useCallback(
    async (
      url: string,
      enableCache: boolean = true,
      config: AxiosRequestConfig = {}
    ) => {
      const configString: string = JSON.stringify(config);
      const cacheKey: string = configString === "{}" ? url : url + configString;
      try {
        if (enableCache && cache.current[cacheKey]) {
          return cache.current[cacheKey];
        }
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const res: AxiosResponse<any> = await axios(url, {
          ...config,
        });
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const result: any = res.data;
        if (enableCache) {
          cache.current[cacheKey] = result;
        }
        return result;
      } catch (error) {
        if (throwError) {
          throw new Error(error.message);
        } else {
          console.log("Request failed:", error.message);
        }
        return undefined;
      }
    },
    [throwError]
  );

  const cancellableRequest: Request = useCallback(
    async (
      url: string,
      enableCache: boolean = true,
      config: AxiosRequestConfig = {}
    ) => {
      if (cancel.current) {
        cancel.current.cancel();
      }
      cancel.current = axios.CancelToken.source();
      const configString: string = JSON.stringify(config);
      const cacheKey: string = configString === "{}" ? url : url + configString;
      try {
        if (enableCache && cache.current[cacheKey]) {
          return cache.current[cacheKey];
        }
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const res: AxiosResponse<any> = await axios(url, {
          ...config,
          cancelToken: cancel.current.token,
        });
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const result: any = res.data;
        if (enableCache) {
          cache.current[cacheKey] = result;
        }
        return result;
      } catch (error) {
        if (!axios.isCancel(error)) {
          if (throwError) {
            throw new Error(error.message);
          } else {
            console.log("Request failed:", error.message);
          }
        }
        return undefined;
      }
    },
    [throwError]
  );

  return { request, cancellableRequest };
}

export default useRequest;
