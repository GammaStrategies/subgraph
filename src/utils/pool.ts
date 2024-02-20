import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { UniswapV3Pool } from "../../generated/schema";
import {
  createAlgebraV1Pool,
  createAlgebraV2Pool,
} from "./algebraFinance/pool";
import { createUniV3Pool } from "./uniswapV3/pool";
import { getOrCreatePoolQueue } from "./entities";
import { poolTemplateCreate } from "./common/pool";

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
    log.warning("Create pool failed on: {}", [poolAddress.toHex()]);
  }
  return pool as UniswapV3Pool;
}

export function processPoolQueue(blockNumber: BigInt): void {
  const queue = getOrCreatePoolQueue();

  const newAddresses: string[] = [];
  const newStartBlocks: BigInt[] = [];
  for (let i = 0; i < queue.addresses.length; i++) {
    if (blockNumber >= queue.startBlocks[i]) {
      const poolAddress = Address.fromString(queue.addresses[i]);
      const pool = getOrCreatePool(poolAddress);
      pool.save();
      poolTemplateCreate(poolAddress);
    } else {
      newAddresses.push(queue.addresses[i]);
      newStartBlocks.push(queue.startBlocks[i]);
    }
  }
  queue.addresses = newAddresses;
  queue.startBlocks = newStartBlocks;
  queue.save();
}
