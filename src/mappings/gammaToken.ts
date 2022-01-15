/* eslint-disable prefer-const */
import { dataSource, Address } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from "../../generated/GammaToken/ERC20"
import { updateDistributionDayData, updateRewardHypervisorDayData } from '../utils/intervalUpdates'
import {
	ADDRESS_ZERO,
	ZERO_BI,
	ZERO_BD,
	REWARD_HYPERVISOR_ADDRESS,
	SWAPPER_ADDRESS,
	constantAddresses,
	TZ_UTC,
	TZ_EST
} from '../utils/constants'
import { getOrCreateRewardHypervisor } from '../utils/rewardHypervisor'
import { unstakeGammaFromAccount } from '../utils/gammaToken'
import { 
	getOrCreateAccount,
	getOrCreateUser,
	getOrCreateProtocolDistribution
} from '../utils/entities'
import { getOrCreateToken } from '../utils/tokens'


let REWARD_HYPERVISOR = Address.fromString(REWARD_HYPERVISOR_ADDRESS)
let SWAPPER = Address.fromString(SWAPPER_ADDRESS)

export function handleTransfer(event: TransferEvent): void {
	let addressLookup = constantAddresses.network(dataSource.network())
	let gammaAddress = addressLookup.get("GAMMA") as string

	let gammaAmount = event.params.value

	let gamma = getOrCreateToken(Address.fromString(gammaAddress))
	if (event.params.from == Address.fromString(ADDRESS_ZERO)) {
		// Mint event
		gamma.totalSupply += gammaAmount
		gamma.save()
	}

	let distributed = ZERO_BI
	let distributedUSD = ZERO_BD

	let xgamma = getOrCreateRewardHypervisor()
	let protocolDist = getOrCreateProtocolDistribution(gammaAddress)
	
	if (event.params.to == REWARD_HYPERVISOR) {
		xgamma.totalGamma += gammaAmount
		// Deposit into reward hypervisor
		if (event.params.from !== SWAPPER) {
			// If not from swapper, this is deposit by user
			let accountFrom = getOrCreateAccount(event.params.from.toHexString())
			if (accountFrom.type === 'non visor') {
				getOrCreateUser(accountFrom.parent, true)
			}
			accountFrom.gammaDeposited += gammaAmount
			accountFrom.save()
		}
	} else if (event.params.from == REWARD_HYPERVISOR) {
		// User withdraw from reward hypervisor
		// update account
		unstakeGammaFromAccount(event.params.to.toHexString(), gammaAmount)
		xgamma.totalGamma -= gammaAmount
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
			TZ_UTC
		)
		// EST
		updateDistributionDayData(
			gammaAddress,
			distributed,
			distributedUSD,
			event.block.timestamp,
			TZ_EST
		)
	
	}

	if (event.params.to === REWARD_HYPERVISOR || event.params.from === REWARD_HYPERVISOR) {
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
