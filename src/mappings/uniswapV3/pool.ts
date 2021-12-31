import { Address } from '@graphprotocol/graph-ts'
import { Swap } from "../../../generated/templates/UniswapV3Pool/UniswapV3Pool"
import { resetAggregates, updateAggregates, updateTvl } from "../../utils/aggregation"
import { updateAndGetUniswapV3HypervisorDayData } from "../../utils/intervalUpdates"
import { getOrCreatePool } from '../../utils/uniswapV3/pool'

export function handleSwap(event: Swap): void {
	let pool = getOrCreatePool(event.address)
	pool.lastSwapTime = event.block.timestamp
	pool.sqrtPriceX96 = event.params.sqrtPriceX96
	pool.save()

	let hypervisors = pool.hypervisors
	for (let i = 0; i < hypervisors.length; i++) {
		resetAggregates(hypervisors[i])
		updateTvl(Address.fromString(hypervisors[i]))
		updateAggregates(hypervisors[i])
		let hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(hypervisors[i])
		hypervisorDayData.save()
	}
}
