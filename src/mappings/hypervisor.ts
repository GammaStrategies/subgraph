/* eslint-disable prefer-const */
import { Address } from '@graphprotocol/graph-ts'
import { 
	Hypervisor as HyperVisorContract,
	BonusTokenRegistered,
	HypervisorCreated,
	HypervisorFunded,
	OwnershipTransferred,
	RewardClaimed,
	Staked,
	Unstaked,
	VaultFactoryRegistered,
	VaultFactoryRemoved
} from "../../generated/Hypervisor/Hypervisor"
import { Hypervisor, RewardedToken } from "../../generated/schema"
import { getOrCreateStakedToken, createRewardedToken } from "../utils/tokens"
import { ADDRESS_ZERO, ZERO_BI } from "../utils/constants"


function getOrCreateStakingHypervisor(addressString: string): Hypervisor {
	let nullAddress = Address.fromString(ADDRESS_ZERO)
	let hypervisor = Hypervisor.load(addressString)
	if (hypervisor == null) {
		hypervisor = new Hypervisor(addressString)
		hypervisor.powerSwitch = nullAddress
		hypervisor.rewardPool = nullAddress
		hypervisor.rewardPoolAmount = ZERO_BI
		hypervisor.stakingToken = ADDRESS_ZERO
		hypervisor.totalStakedAmount = ZERO_BI
		hypervisor.rewardToken = ADDRESS_ZERO
	}

	return hypervisor as Hypervisor
}

export function handleBonusTokenRegistered(event: BonusTokenRegistered): void {
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	let bonusTokens = hypervisor.bonusTokens
	if (bonusTokens != null) {
		bonusTokens.push(event.params.token)
		hypervisor.bonusTokens = bonusTokens
	}
	hypervisor.save()
}

export function handleHypervisorCreated(event: HypervisorCreated): void {
	// OwnershipTransferred event always emited before HypervisorCreated, so it's safe to load
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	hypervisor.powerSwitch = event.params.powerSwitch
	hypervisor.rewardPool = event.params.rewardPool
	hypervisor.rewardPoolAmount = ZERO_BI

	let hypervisorContract = HyperVisorContract.bind(event.address)
	let callResults = hypervisorContract.getHypervisorData()
	hypervisor.stakingToken = callResults.stakingToken.toHexString()
	hypervisor.totalStakedAmount = ZERO_BI
	hypervisor.rewardToken = callResults.rewardToken.toHexString()
	hypervisor.save()
}

export function handleHypervisorFunded(event: HypervisorFunded): void {
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	hypervisor.rewardPoolAmount += event.params.amount
	hypervisor.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
	let to = event.address.toHex()
	let hypervisor = Hypervisor.load(to)
	if (hypervisor == null) {
		hypervisor = new Hypervisor(to)
	}
	hypervisor.owner = event.params.newOwner
	hypervisor.save()
}

export function handleRewardClaimed(event: RewardClaimed): void {
	// there is both reward token and bonus token
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	if (event.params.token.toHex() == hypervisor.rewardToken) {
		hypervisor.rewardPoolAmount -= event.params.amount
	}
	hypervisor.save()

	let rewardedToken = RewardedToken.load(event.params.vault.toHexString() + "-" + hypervisor.rewardToken)
	if (rewardedToken == null) {
		rewardedToken = createRewardedToken(event.params.vault, Address.fromString(hypervisor.rewardToken))
	}
	rewardedToken.amount += event.params.amount
	rewardedToken.save()
}

export function handleStaked(event: Staked): void {
	// Add data to visor instance - amount staked
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	hypervisor.totalStakedAmount += event.params.amount
	hypervisor.save()

	let stakedToken = getOrCreateStakedToken(event.params.vault, Address.fromString(hypervisor.stakingToken))
	stakedToken.amount += event.params.amount
	stakedToken.save()
}

export function handleUnstaked(event: Unstaked): void {
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	hypervisor.totalStakedAmount -= event.params.amount
	hypervisor.save()

	let stakedToken = getOrCreateStakedToken(event.params.vault, Address.fromString(hypervisor.stakingToken))
	stakedToken.amount -= event.params.amount
	stakedToken.save()
}

export function handleVaultFactoryRegistered(event: VaultFactoryRegistered): void {
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	hypervisor.vaultFactory = event.params.factory.toHex()
	hypervisor.save()
}

export function handleVaultFactoryRemoved(event: VaultFactoryRemoved): void {
	let hypervisor = getOrCreateStakingHypervisor(event.address.toHex())
	hypervisor.vaultFactory = null
	hypervisor.save()
}
