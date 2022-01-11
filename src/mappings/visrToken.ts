/* eslint-disable prefer-const */
import { dataSource, Address, BigInt } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20"
import { updateDistributionDayData } from '../utils/intervalUpdates'
import { ADDRESS_ZERO, ZERO_BI, ZERO_BD, REWARD_HYPERVISOR_ADDRESS, constantAddresses } from '../utils/constants'
import { getGammaRateInUSDC } from '../utils/pricing'
import { getOrCreateRewardHypervisor } from '../utils/rewardHypervisor'
import { unstakeGammaFromVisor } from '../utils/visrToken'
import { getActiveVisor } from '../utils/visor'
import { getOrCreateVisor } from '../utils/visorFactory'
import { getOrCreateProtocolDistribution } from '../utils/entities'
import { getOrCreateToken } from '../utils/tokens'


let DISTRIBUTORS: Array<Address> = [
	Address.fromString("0xe50df7cd9d64690a2683c07400ef9ed451c2ab31"),  // Distributor 1
	Address.fromString("0x354ad875a68e5d4ac69cb56df72137e638dcf4a0"),  // Distributor 2
	Address.fromString("0x3e738bef54e64be0c99759e0c77d9c72c5a8666e"),  // Distributor 3
	Address.fromString("0x242814d6f31fc7ddbef77e8888a3b6cf96f44d68"),  // Distributor 4
	Address.fromString("0xa5025faba6e70b84f74e9b1113e5f7f4e7f4859f")   // Multisend App
]

let REWARD_HYPERVISOR = Address.fromString(REWARD_HYPERVISOR_ADDRESS)

export function handleTransfer(event: TransferEvent): void {
	let addressLookup = constantAddresses.network(dataSource.network())
	let gammaAddress = addressLookup.get("GAMMA") as string

	let gammaRate = ZERO_BD
	let gammaAmount = event.params.value

	let gamma = getOrCreateToken(Address.fromString(gammaAddress))
	if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
		// Mint event
		gamma.totalSupply += gammaAmount
		gamma.save()
	}

	let distributed = ZERO_BI
	let distributedUSD = ZERO_BD

	// Check if either from or to address are VISOR vaults
	let visorTo = getActiveVisor(event.params.to.toHexString())
	let visorFrom = getActiveVisor(event.params.from.toHexString())

	let xgamma = getOrCreateRewardHypervisor()

	let protocolDist = getOrCreateProtocolDistribution(gammaAddress)
	
	if (event.params.to == REWARD_HYPERVISOR) {
		xgamma.totalGamma += gammaAmount
		// visr.totalStaked += gammaAmount  // Already tracked in hypervisor
		if (DISTRIBUTORS.includes(event.params.from)) {
			// VISR distribution event into rewards hypervisor
			gammaRate = getGammaRateInUSDC()
			distributed = gammaAmount
			distributedUSD = distributed.toBigDecimal() * gammaRate
			
			// Tracks all time distribute
			protocolDist.distributed += distributed
			protocolDist.distributedUSD += distributedUSD
		} else {
			// User deposit into reward hypervisor
			if (visorFrom == null) {
				// Skip if address is not a visor vault
				visorFrom = getOrCreateVisor(event.params.from.toHexString())
			}
			visorFrom.gammaDeposited += gammaAmount
			visorFrom.save()
		}
	} else if (event.params.from == REWARD_HYPERVISOR) {
		// User withdraw from reward hypervisor
		// update visor entity
		if (!DISTRIBUTORS.includes(event.params.to) && visorTo != null) {
			// Skip if address is not a visor vault
			unstakeGammaFromVisor(visorTo.id.toString(), gammaAmount)
		}
		xgamma.totalGamma -= gammaAmount
		//visr.totalStaked -= gammaAmount // Already tracked in hypervisor
	} else if (DISTRIBUTORS.includes(event.params.from)  && visorTo != null) {
		gammaRate = getGammaRateInUSDC()
		distributed = gammaAmount
		distributedUSD = distributed.toBigDecimal() * gammaRate

		protocolDist.distributed = distributed
		protocolDist.distributedUSD = distributedUSD
	}

	xgamma.save()
	protocolDist.save()

	// Update daily distributed data
	if (distributed > ZERO_BI) {		
		// UTC
		updateDistributionDayData(
			gammaAddress,
			distributed,
			distributedUSD,
			event.block.timestamp,
			ZERO_BI
		)
		// EST
		updateDistributionDayData(
			gammaAddress,
			distributed,
			distributedUSD,
			event.block.timestamp,
			BigInt.fromI32(-5)
		)
	
	}
}
