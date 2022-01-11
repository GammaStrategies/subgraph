/* eslint-disable prefer-const */
import { Address, } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from '../utils/constants'
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20"
import { 
	getOrCreateRewardHypervisor,
	getOrCreateRewardHypervisorShare,
	decreaseRewardHypervisorShares
} from '../utils/rewardHypervisor'

export function handleTransfer(event: TransferEvent): void {
	let xgamma = getOrCreateRewardHypervisor()
	let shares = event.params.value

	if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
		// Mint shares
		let xgammaShare = getOrCreateRewardHypervisorShare(event.params.to.toHex())
		xgammaShare.shares += shares
		xgamma.totalSupply += shares

		xgammaShare.save()
		xgamma.save()
	} else if (event.params.to == Address.fromString(ADDRESS_ZERO)) {
		// Burn shares
		decreaseRewardHypervisorShares(event.params.from.toHex(), shares)
		xgamma.totalSupply -= shares
		xgamma.save()
	}
}
