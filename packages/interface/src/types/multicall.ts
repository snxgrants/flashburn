import { BytesLike } from "ethers";

export interface Call {
  target: string;
  callData: BytesLike;
}

export interface ReturnData {
  success: boolean;
  returnData: string;
}
