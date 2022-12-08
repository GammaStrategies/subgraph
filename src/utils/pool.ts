import { Address, log } from "@graphprotocol/graph-ts";
import { UniswapV3Pool } from "../../generated/schema";
import { createAlgebraPool } from "./algebraFinance/pool";
import { getOrCreateProtocol } from "./entities";
import { createUniV3Pool } from "./uniswapV3/pool";

export function getOrCreatePool(poolAddress: Address): UniswapV3Pool {
  let pool = UniswapV3Pool.load(poolAddress.toHex());
  if (!pool) {
    // const protocol = getOrCreateProtocol();
    pool = createUniV3Pool(poolAddress)
    if (!pool) {
      pool = createAlgebraPool(poolAddress)
    }
  }
  return pool as UniswapV3Pool;
}
