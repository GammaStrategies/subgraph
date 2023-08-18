/* eslint-disable prefer-const */
import { dataSource } from '@graphprotocol/graph-ts'
import { SwapVISR } from '../../generated/SwapContract/SwapContract'
import { getGammaRateInUSDC, getVisrRateInUSDC } from '../utils/pricing'
import { updateDistributionDayData } from '../utils/intervalUpdates'
import { 
	constantAddresses,
	REWARD_HYPERVISOR_ADDRESS,
	GAMMA_START_BLOCK,
	TZ_UTC,
	TZ_EST
} from '../config/constants'
import { getOrCreateProtocol, getOrCreateProtocolDistribution } from '../utils/entities'


export function handleSwapVISR(event: SwapVISR): void {
	if (event.params.recipient.toHex() == REWARD_HYPERVISOR_ADDRESS) {
		const protocol = getOrCreateProtocol()
		
		let addressLookup = constantAddresses.network(protocol.network)
		const targetTokenName = (event.block.number > GAMMA_START_BLOCK) ? "GAMMA" : "VISR"
		const targetToken = addressLookup.get(targetTokenName) as string
		let protocolDist = getOrCreateProtocolDistribution(targetToken)
		
		let tokenRate = (targetTokenName === "GAMMA") ? getGammaRateInUSDC() : getVisrRateInUSDC()

		let distributed = event.params.amountOut
		let distributedUSD = distributed.toBigDecimal().times(tokenRate)

		protocolDist.distributed = protocolDist.distributed.plus(distributed)
		protocolDist.distributedUSD = protocolDist.distributedUSD.plus(distributedUSD)
		protocolDist.save()

		// Update Daily Data
		// UTC
		updateDistributionDayData(
			targetToken,
			distributed,
			distributedUSD,
			event.block.timestamp,
			TZ_UTC
		)
		// EST
		updateDistributionDayData(
			targetToken,
			distributed,
			distributedUSD,
			event.block.timestamp,
			TZ_EST
		)
	}
}