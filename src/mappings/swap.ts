/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts'
import { SwapVISR } from '../../generated/SwapContract/SwapContract'
import { getVisrRateInUSDC } from '../utils/pricing'
import { getOrCreateVisrToken } from '../utils/visrToken'
import { updateVisrTokenDayData } from '../utils/intervalUpdates'
import { REWARD_HYPERVISOR_ADDRESS, ZERO_BI } from '../utils/constants'


export function handleSwapVISR(event: SwapVISR): void {
	if (event.params.recipient.toHex() == REWARD_HYPERVISOR_ADDRESS) {
		let visr = getOrCreateVisrToken()
		let visrRate = getVisrRateInUSDC()

		let distributed = event.params.amountOut
		visr.totalDistributed += distributed
		visr.totalDistributedUSD += distributed.toBigDecimal() * visrRate
		visr.save()

		let visrTokenDayDataUTC = updateVisrTokenDayData(distributed, event.block.timestamp, ZERO_BI)
		let visrTokenDayDataEST = updateVisrTokenDayData(distributed, event.block.timestamp, BigInt.fromI32(-5))
	}
}