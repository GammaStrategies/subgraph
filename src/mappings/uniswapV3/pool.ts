/* eslint-disable prefer-const */
import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { Burn, Mint, Swap } from "../../../generated/templates/UniswapV3Pool/UniswapV3Pool"
import { resetAggregates, updateAggregates, updateTvl } from "../../utils/aggregation"
import { updateAndGetUniswapV3HypervisorDayData } from "../../utils/intervalUpdates"
import { getOrCreatePool } from '../../utils/uniswapV3/pool'

const hypervisorUpdateIntervalSeconds = BigInt.fromI32(600)

export function handleSwap(event: Swap): void {
	let pool = getOrCreatePool(event.address)
	pool.lastSwapTime = event.block.timestamp
	pool.sqrtPriceX96 = event.params.sqrtPriceX96
	pool.save()

	let elapsedSinceLastHypervisorRefresh = event.block.timestamp - pool.lastHypervisorRefreshTime
	if (elapsedSinceLastHypervisorRefresh > hypervisorUpdateIntervalSeconds) {
		log.info(
			"{} seconds since last hypervisor refresh for pool {}.  Refreshing now",
			[elapsedSinceLastHypervisorRefresh.toString(), pool.id])
		let hypervisors = pool.hypervisors
		for (let i = 0; i < hypervisors.length; i++) {
			resetAggregates(hypervisors[i])
			updateTvl(Address.fromString(hypervisors[i]))
			updateAggregates(hypervisors[i])
			let hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(hypervisors[i])
			hypervisorDayData.save()
		}
		pool.lastHypervisorRefreshTime = event.block.timestamp
		pool.save()
	}
}
