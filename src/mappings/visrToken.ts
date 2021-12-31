/* eslint-disable prefer-const */
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from "../../generated/VisrToken/ERC20"
import { updateVisrTokenDayData } from '../utils/intervalUpdates'
import { ADDRESS_ZERO, ZERO_BI, ZERO_BD, REWARD_HYPERVISOR_ADDRESS } from '../utils/constants'
import { getVisrRateInUSDC } from '../utils/pricing'
import { getOrCreateRewardHypervisor } from '../utils/rewardHypervisor'
import { getOrCreateVisrToken, unstakeVisrFromVisor } from '../utils/visrToken'
import { getActiveVisor } from '../utils/visor'


let DISTRIBUTORS: Array<Address> = [
	Address.fromString("0xe50df7cd9d64690a2683c07400ef9ed451c2ab31"),  // Distributor 1
	Address.fromString("0x354ad875a68e5d4ac69cb56df72137e638dcf4a0"),  // Distributor 2
	Address.fromString("0x3e738bef54e64be0c99759e0c77d9c72c5a8666e"),  // Distributor 3
	Address.fromString("0x242814d6f31fc7ddbef77e8888a3b6cf96f44d68"),  // Distributor 4
	Address.fromString("0xa5025faba6e70b84f74e9b1113e5f7f4e7f4859f")   // Multisend App
]

let REWARD_HYPERVISOR = Address.fromString(REWARD_HYPERVISOR_ADDRESS)

export function handleTransfer(event: TransferEvent): void {
	let visrRate = ZERO_BD
	let visrAmount = event.params.value

	let visr = getOrCreateVisrToken()
	if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
		// Mint event
		visr.totalSupply += visrAmount
	}

	let distributed = ZERO_BI

	// Check if either from or to address are VISOR vaults
	let visorTo = getActiveVisor(event.params.to.toHexString())
	let visorFrom = getActiveVisor(event.params.from.toHexString())

	let vVisr = getOrCreateRewardHypervisor()
	
	if (event.params.to == REWARD_HYPERVISOR) {
		vVisr.totalVisr += visrAmount
		visr.totalStaked += visrAmount
		if (DISTRIBUTORS.includes(event.params.from)) {
			// VISR distribution event into rewards hypervisor
			visrRate = getVisrRateInUSDC()
			distributed += visrAmount
			// Tracks all time distributed
			visr.totalDistributed += distributed
			visr.totalDistributedUSD += distributed.toBigDecimal() * visrRate
		} else {
			// User deposit into reward hypervisor
			if (visorFrom != null) {
				// Skip if address is not a visor vault
				visorFrom.visrDeposited += visrAmount
				visorFrom.save()
			}
		}
	} else if (event.params.from == REWARD_HYPERVISOR) {
		// User withdraw from reward hypervisor
		// update visor entity
		if (!DISTRIBUTORS.includes(event.params.to) && visorTo != null) {
			// Skip if address is not a visor vault
			unstakeVisrFromVisor(visorTo.id.toString(), visrAmount, event.transaction.hash.toHex())
		}
		vVisr.totalVisr -= visrAmount
		visr.totalStaked -= visrAmount
	} else if (DISTRIBUTORS.includes(event.params.from)  && visorTo != null) {
		visrRate = getVisrRateInUSDC()
		distributed += visrAmount
		visr.totalDistributed += distributed
		visr.totalDistributedUSD += distributed.toBigDecimal() * visrRate
	}

	vVisr.save()
	visr.save()	

	// Update daily distributed data
	if (distributed > ZERO_BI) {
		let visrTokenDayDataUTC = updateVisrTokenDayData(distributed, event.block.timestamp, ZERO_BI)
		let visrTokenDayDataEST = updateVisrTokenDayData(distributed, event.block.timestamp, BigInt.fromI32(-5))
	}
}