import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  Pool as PoolTemplate,
  AlternatePool as AlternatePoolTemplate,
} from "../../../generated/templates";
import { resetAggregates, updateAggregates, updateTvl } from "../aggregation";
import { updateAndGetUniswapV3HypervisorDayData } from "../intervalUpdates";
import { getOrCreatePool } from "../pool";

const hypervisorUpdateIntervalSeconds = BigInt.fromI32(600);

export function processSwap(
  poolAddress: Address,
  poolPrice: BigInt,
  poolTick: i32,
  block: ethereum.Block
): void {
  const pool = getOrCreatePool(poolAddress);
  pool.lastSwapTime = block.timestamp;
  pool.sqrtPriceX96 = poolPrice;
  pool.tick = poolTick;
  pool.save();

  const elapsedSinceLastHypervisorRefresh = block.timestamp.minus(
    pool.lastHypervisorRefreshTime
  );
  if (elapsedSinceLastHypervisorRefresh > hypervisorUpdateIntervalSeconds) {
    log.info(
      "{} seconds since last hypervisor refresh for pool {}.  Refreshing now",
      [elapsedSinceLastHypervisorRefresh.toString(), pool.id]
    );
    const hypervisors = pool.hypervisors;
    for (let i = 0; i < hypervisors.length; i++) {
      resetAggregates(hypervisors[i]);
      updateTvl(Address.fromString(hypervisors[i]));
      updateAggregates(hypervisors[i]);
      const hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(
        hypervisors[i]
      );
      hypervisorDayData.save();
    }
    pool.lastHypervisorRefreshTime = block.timestamp;
    pool.save();
  }
}

export function processCollect(poolAddress: Address): void {
  const pool = getOrCreatePool(poolAddress);

  const hypervisors = pool.hypervisors;
  for (let i = 0; i < hypervisors.length; i++) {
    resetAggregates(hypervisors[i]);
    updateTvl(Address.fromString(hypervisors[i]));
    updateAggregates(hypervisors[i]);
    const hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(
      hypervisors[i]
    );
    hypervisorDayData.save();
  }
}

export function poolTemplateCreate(poolAddress: Address): void {
  PoolTemplate.create(poolAddress);
  AlternatePoolTemplate.create(poolAddress);
}
