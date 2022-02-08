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
import { getOrCreateRewardHypervisorTx } from '../utils/entities'


export function handleTransfer(event: TransferEvent): void {
	let xgamma = getOrCreateRewardHypervisor()
	let xgammaTx = getOrCreateRewardHypervisorTx(event.transaction.hash.toHex())
	let shares = event.params.value

	let ADDR_ZERO = Address.fromString(ADDRESS_ZERO)
	let fromAddress = event.params.from.toHex()
	let toAddress = event.params.to.toHex()
	let mintEvent = (event.params.from == ADDR_ZERO)
	let burnEvent = (event.params.to == ADDR_ZERO)

	//  Track state of shares before transfer
	let toShare = getOrCreateRewardHypervisorShare(toAddress)
	let toSharesBefore = toShare.shares

	let fromShare = getOrCreateRewardHypervisorShare(fromAddress)
	let fromSharesBefore = fromShare.shares
	
	xgammaTx.timestamp = event.block.timestamp
	xgammaTx.xgammaAmount = shares
	xgammaTx.xgammaSupplyBefore = xgamma.totalSupply


	if (mintEvent) {
		// Mint shares
		xgammaTx.action = "stake"
		xgammaTx.account = toAddress
		xgammaTx.xgammaAmountBefore = toSharesBefore
		xgamma.totalSupply += shares
		xgammaTx.xgammaSupplyAfter = xgamma.totalSupply
	} else {
		// Decrease shares of from account
		decreaseRewardHypervisorShares(fromAddress, shares)
		xgammaTx.xgammaAmountAfter = fromSharesBefore - shares
	}
	
	if (burnEvent) {
		// Burn shares
		xgammaTx.action = "unstake"
		xgammaTx.account = fromAddress
		xgammaTx.xgammaAmountBefore = fromSharesBefore
		xgamma.totalSupply -= shares
		xgammaTx.xgammaSupplyAfter = xgamma.totalSupply 
	} else {
		// Increase shares of to account
		toShare.shares += shares
		xgammaTx.xgammaAmountAfter = toSharesBefore + shares
		toShare.save()
	}
	
	xgamma.save()

	if (mintEvent || burnEvent) {
		xgammaTx.save()  // no need to save if not mint or burn
		updateRewardHypervisorDayData(event.block.timestamp, TZ_UTC)
		updateRewardHypervisorDayData(event.block.timestamp, TZ_EST)
	}
}
