/* eslint-disable prefer-const */
import { Address } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO, TZ_UTC, TZ_EST } from '../utils/constants'
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20"
import { 
	getOrCreateRewardHypervisor,
	getOrCreateRewardHypervisorShare,
	decreaseRewardHypervisorShares
} from '../utils/rewardHypervisor'
import { updateRewardHypervisorDayData } from '../utils/intervalUpdates'


export function handleTransfer(event: TransferEvent): void {
	let xgamma = getOrCreateRewardHypervisor()
	let shares = event.params.value

	let ADDR_ZERO = Address.fromString(ADDRESS_ZERO)
	let mintEvent = (event.params.from == ADDR_ZERO)
	let burnEvent = (event.params.to == ADDR_ZERO)

	if (mintEvent) {
		// Mint shares
		xgamma.totalSupply += shares
	} else {
		// Decrease shares of from account
		decreaseRewardHypervisorShares(event.params.from.toHex(), shares)
	}
	
	if (burnEvent) {
		// Burn shares
		xgamma.totalSupply -= shares
	} else {
		// Increase shares of to account
		let xgammaShare = getOrCreateRewardHypervisorShare(event.params.to.toHex())
		xgammaShare.shares += shares
		xgammaShare.save()
	}
	
	xgamma.save()

	if (mintEvent || burnEvent) {
		updateRewardHypervisorDayData(
			xgamma.totalGamma,
			xgamma.totalSupply,
			event.block.timestamp,
			TZ_UTC
		)
		updateRewardHypervisorDayData(
			xgamma.totalGamma,
			xgamma.totalSupply,
			event.block.timestamp,
			TZ_EST
		)
	}
}
