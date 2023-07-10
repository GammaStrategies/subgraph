import { Address, log } from "@graphprotocol/graph-ts";
import { UniswapV3Pool } from "../../generated/schema";
import { createAlgebraV1Pool, createAlgebraV2Pool } from "./algebraFinance/pool";
import { createUniV3Pool } from "./uniswapV3/pool";

export function getOrCreatePool(poolAddress: Address): UniswapV3Pool {
  let pool = UniswapV3Pool.load(poolAddress.toHex());
  if (!pool) {
    pool = createUniV3Pool(poolAddress);
    if (!pool) {
      pool = createAlgebraV1Pool(poolAddress);
      if (!pool) {
        pool = createAlgebraV2Pool(poolAddress);
      }
    }
  }
  if (!pool) {
    log.warning("Create pool failed on: {}", [poolAddress.toHex()])
  }
  return pool as UniswapV3Pool;
}
