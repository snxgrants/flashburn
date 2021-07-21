import { BytesLike } from "ethers";

export interface Call {
  target: string;
  callData: BytesLike;
}
