/* eslint-disable prefer-const */
import { Address, } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from '../utils/constants'
import { Transfer as TransferEvent } from "../../generated/VisrToken/ERC20"
import { 
	getOrCreateRewardHypervisor,
	getOrCreateRewardHypervisorShare,
	decreaseRewardHypervisorShares
} from '../utils/rewardHypervisor'

export function handleTransfer(event: TransferEvent): void {
	let vVisr = getOrCreateRewardHypervisor()
	let shares = event.params.value

	if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
		// Mint shares
		let vVisrShare = getOrCreateRewardHypervisorShare(event.params.to.toHex())
		vVisrShare.shares += shares
		vVisr.totalSupply += shares

		vVisrShare.save()
		vVisr.save()
	} else if (event.params.to == Address.fromString(ADDRESS_ZERO)) {
		// Burn shares
		decreaseRewardHypervisorShares(event.params.from.toHex(), shares)
		vVisr.totalSupply -= shares
		vVisr.save()
	}
}
