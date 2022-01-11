/* eslint-disable prefer-const */
import { dataSource, BigInt } from '@graphprotocol/graph-ts'
import { SwapVISR } from '../../generated/SwapContract/SwapContract'
import { getGammaRateInUSDC, getVisrRateInUSDC } from '../utils/pricing'
import { updateDistributionDayData } from '../utils/intervalUpdates'
import { 
	constantAddresses,
	REWARD_HYPERVISOR_ADDRESS,
	ZERO_BI,
	GAMMA_START_BLOCK } from '../utils/constants'
import { getOrCreateProtocolDistribution } from '../utils/entities'


export function handleSwapVISR(event: SwapVISR): void {
	if (event.params.recipient.toHex() == REWARD_HYPERVISOR_ADDRESS) {
		let addressLookup = constantAddresses.network(dataSource.network())
		const targetTokenName = (event.block.number > GAMMA_START_BLOCK) ? "GAMMA" : "VISR"
		const targetToken = addressLookup.get(targetTokenName) as string
		let protocolDist = getOrCreateProtocolDistribution(targetToken)
		
		let tokenRate = (targetTokenName === "GAMMA") ? getGammaRateInUSDC() : getVisrRateInUSDC()

		let distributed = event.params.amountOut
		let distributedUSD = distributed.toBigDecimal() * tokenRate

		protocolDist.distributed += distributed
		protocolDist.distributedUSD += distributedUSD
		protocolDist.save()

		// Update Daily Data
		// UTC
		updateDistributionDayData(
			targetToken,
			distributed,
			distributedUSD,
			event.block.timestamp,
			ZERO_BI
		)
		// EST
		updateDistributionDayData(
			targetToken,
			distributed,
			distributedUSD,
			event.block.timestamp,
			BigInt.fromI32(-5)
		)
	}
}