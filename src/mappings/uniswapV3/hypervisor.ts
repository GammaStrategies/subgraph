/* eslint-disable prefer-const */
import { Address, store } from '@graphprotocol/graph-ts'
import { 
	Deposit as DepositEvent,
	Withdraw as WithdrawEvent,
	Rebalance as RebalanceEvent,
	Transfer as TransferEvent,
	SetDepositMaxCall,
	SetMaxTotalSupplyCall
} from "../../../generated/templates/UniswapV3Hypervisor/UniswapV3Hypervisor"
import {
	Account,
	UniswapV3HypervisorShare,
	UniswapV3HypervisorConversion,
	MasterChef
} from "../../../generated/schema"
import { 
	createDeposit,
	createRebalance,
	createWithdraw,
	getOrCreateHypervisor,
	getOrCreateHypervisorShare,
	updateFeeGrowth,
	updatePositions
} from "../../utils/uniswapV3/hypervisor"
import { updateAndGetUniswapV3HypervisorDayData } from "../../utils/intervalUpdates"
import { getExchangeRate, getBaseTokenRateInUSDC } from "../../utils/pricing"
import { resetAggregates, updateAggregates, updateTvl } from "../../utils/aggregation"
import { ADDRESS_ZERO, ONE_BI, ZERO_BD, ZERO_BI } from "../../utils/constants"


export function handleDeposit(event: DepositEvent): void {

	let hypervisor = getOrCreateHypervisor(event.address, event.block.timestamp)
	let hypervisorId = event.address.toHex()
	let depositAddress = event.params.to.toHex()

	// Reset aggregates until new amounts are calculated
	resetAggregates(hypervisorId)

	// Create deposit event
	let deposit = createDeposit(event)
	let conversion = UniswapV3HypervisorConversion.load(hypervisorId) as UniswapV3HypervisorConversion

	let price = getExchangeRate(Address.fromString(hypervisor.pool), conversion.baseTokenIndex)
	let baseTokenInUSDC = getBaseTokenRateInUSDC(hypervisorId)
	
	if (conversion.baseTokenIndex == 0) {
		// If token0 is base token, then we convert token1 to the base token
		deposit.amountUSD = (deposit.amount1.toBigDecimal() * price + deposit.amount0.toBigDecimal()) * baseTokenInUSDC
	} else if (conversion.baseTokenIndex == 1) {
		// If token1 is base token, then we convert token0 to the base token
		deposit.amountUSD = (deposit.amount0.toBigDecimal() * price + deposit.amount1.toBigDecimal()) * baseTokenInUSDC
	} else {
		// If neither token is WETH, don't track USD
		deposit.amountUSD = ZERO_BD
	}
	deposit.save()

	// Update visor shares

	
	let hypervisorShare = getOrCreateHypervisorShare(hypervisorId, depositAddress)
	hypervisorShare.shares += deposit.shares
	hypervisorShare.initialToken0 += deposit.amount0
	hypervisorShare.initialToken1 += deposit.amount1
	hypervisorShare.initialUSD += deposit.amountUSD
	hypervisorShare.save()

	updateFeeGrowth(event.address)
	updateTvl(event.address)
	updateAggregates(hypervisorId)
	
	// Aggregate daily data
	let hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(hypervisorId)
	hypervisorDayData.deposited0 += deposit.amount0
    hypervisorDayData.deposited1 += deposit.amount1
    hypervisorDayData.depositedUSD += deposit.amountUSD
    hypervisorDayData.save()
}

export function handleRebalance(event: RebalanceEvent): void {

	let hypervisor = getOrCreateHypervisor(event.address, event.block.timestamp)
	let hypervisorId = event.address.toHex()

	// Reset aggregates until new amounts are calculated
	resetAggregates(hypervisorId)
	
	// Create rebalance
	let rebalance = createRebalance(event)
	let conversion = UniswapV3HypervisorConversion.load(hypervisorId) as UniswapV3HypervisorConversion

	let price = getExchangeRate(Address.fromString(hypervisor.pool), conversion.baseTokenIndex)
	let baseTokenInUSDC = getBaseTokenRateInUSDC(hypervisorId)

	if (conversion.baseTokenIndex == 0) {
		// If token0 is WETH, then we use need price0 to convert token1 to ETH
		rebalance.totalAmountUSD = (rebalance.totalAmount1.toBigDecimal() * price + rebalance.totalAmount0.toBigDecimal()) * baseTokenInUSDC
		rebalance.grossFeesUSD = (rebalance.grossFees1.toBigDecimal() * price + rebalance.grossFees0.toBigDecimal()) * baseTokenInUSDC
		rebalance.protocolFeesUSD = (rebalance.protocolFees1.toBigDecimal() * price + rebalance.protocolFees0.toBigDecimal()) * baseTokenInUSDC
		rebalance.netFeesUSD = (rebalance.netFees1.toBigDecimal() * price + rebalance.netFees0.toBigDecimal()) * baseTokenInUSDC
	} else if (conversion.baseTokenIndex == 1) {
		// If token1 is WETH, then we use need price1 to convert token0 to ETH
		rebalance.totalAmountUSD = (rebalance.totalAmount0.toBigDecimal() * price + rebalance.totalAmount1.toBigDecimal()) * baseTokenInUSDC
		rebalance.grossFeesUSD = (rebalance.grossFees0.toBigDecimal() * price+ rebalance.grossFees1.toBigDecimal()) * baseTokenInUSDC
		rebalance.protocolFeesUSD = (rebalance.protocolFees0.toBigDecimal() * price + rebalance.protocolFees1.toBigDecimal()) * baseTokenInUSDC
		rebalance.netFeesUSD = (rebalance.netFees0.toBigDecimal() * price + rebalance.netFees1.toBigDecimal()) * baseTokenInUSDC
	} else {
		// If neither token is WETH, don't track USD
		rebalance.totalAmountUSD = ZERO_BD
		rebalance.grossFeesUSD = ZERO_BD
		rebalance.protocolFeesUSD = ZERO_BD
		rebalance.netFeesUSD = ZERO_BD
	}
	rebalance.save()
	
	// Update relevant hypervisor fields
	hypervisor.tick = rebalance.tick
	hypervisor.grossFeesClaimed0 += rebalance.grossFees0
	hypervisor.grossFeesClaimed1 += rebalance.grossFees1
	hypervisor.grossFeesClaimedUSD += rebalance.grossFeesUSD
	hypervisor.protocolFeesCollected0 += rebalance.protocolFees0
	hypervisor.protocolFeesCollected1 += rebalance.protocolFees1
	hypervisor.protocolFeesCollectedUSD += rebalance.protocolFeesUSD
	hypervisor.feesReinvested0 += rebalance.netFees0
	hypervisor.feesReinvested1 += rebalance.netFees1
	hypervisor.feesReinvestedUSD += rebalance.netFeesUSD
	hypervisor.baseLower = rebalance.baseLower
	hypervisor.baseUpper = rebalance.baseUpper
	hypervisor.limitLower = rebalance.limitLower
	hypervisor.limitUpper = rebalance.limitUpper
	hypervisor.save()
	
	updatePositions(event.address)
	updateFeeGrowth(event.address, true)

	updateTvl(event.address)
	updateAggregates(hypervisorId)

	// Aggregate daily data	
	let hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(hypervisorId)
	hypervisorDayData.grossFeesClaimed0 += rebalance.grossFees0
	hypervisorDayData.grossFeesClaimed1 += rebalance.grossFees1
	hypervisorDayData.grossFeesClaimedUSD += rebalance.grossFeesUSD
	hypervisorDayData.protocolFeesCollected0 += rebalance.protocolFees0
	hypervisorDayData.protocolFeesCollected1 += rebalance.protocolFees1
	hypervisorDayData.protocolFeesCollectedUSD += rebalance.protocolFeesUSD
	hypervisorDayData.feesReinvested0 += rebalance.netFees0
	hypervisorDayData.feesReinvested1 += rebalance.netFees1
	hypervisorDayData.feesReinvestedUSD += rebalance.netFeesUSD
    hypervisorDayData.save()
}

export function handleWithdraw(event: WithdrawEvent): void {

	let hypervisor = getOrCreateHypervisor(event.address, event.block.timestamp)
	let hypervisorId = event.address.toHex()

	// Reset factory aggregates until new values are calculated
	resetAggregates(hypervisorId)

	// Create Withdraw event
	let withdraw = createWithdraw(event)
	let conversion = UniswapV3HypervisorConversion.load(hypervisorId) as UniswapV3HypervisorConversion

	let price = getExchangeRate(Address.fromString(hypervisor.pool), conversion.baseTokenIndex)
	let baseTokenInUSDC = getBaseTokenRateInUSDC(hypervisorId)

	if (conversion.baseTokenIndex == 0) {
		// If token0 is WETH, then we use need price0 to convert token1 to ETH
		withdraw.amountUSD = (withdraw.amount1.toBigDecimal() * price + withdraw.amount0.toBigDecimal()) * baseTokenInUSDC
	} else if (conversion.baseTokenIndex == 1) {
		// If token1 is WETH, then we use need price1 to convert token0 to ETH
		withdraw.amountUSD = (withdraw.amount0.toBigDecimal() * price + withdraw.amount1.toBigDecimal()) * baseTokenInUSDC
	} else {
		// If neither token is WETH, don't track USD
		withdraw.amountUSD = ZERO_BD
	}
	withdraw.save()

	// Update visor shares
	let accountId = event.params.sender.toHex()
	let hypervisorShareId = hypervisorId + "-" + accountId
	let hypervisorShare = UniswapV3HypervisorShare.load(hypervisorShareId)
	if (hypervisorShare != null) {
		if (hypervisorShare.shares == withdraw.shares ) {
			// If all shares are withdrawn, remove entity
			store.remove('UniswapV3HypervisorShare', hypervisorShareId)
			let account = Account.load(accountId)
			if (account != null) {
				account.hypervisorCount -= ONE_BI
				account.save()
			}
			hypervisor.accountCount -= ONE_BI
		} else {
			let remainingShares = hypervisorShare.shares - withdraw.shares
			hypervisorShare.initialToken0 = hypervisorShare.initialToken0 * remainingShares / hypervisorShare.shares
			hypervisorShare.initialToken1 = hypervisorShare.initialToken1 * remainingShares / hypervisorShare.shares
			hypervisorShare.initialUSD = hypervisorShare.initialUSD * remainingShares.toBigDecimal() / hypervisorShare.shares.toBigDecimal()
			hypervisorShare.shares -= withdraw.shares
			hypervisorShare.save()
		}
	}
	
	// Update relevant hypervisor fields
	hypervisor.totalSupply -= withdraw.shares
	hypervisor.save()

	updatePositions(event.address)
	updateFeeGrowth(event.address)
	updateTvl(event.address)
	updateAggregates(hypervisorId)
	
	// Aggregate daily data	
	let hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(hypervisorId)
	hypervisorDayData.withdrawn0 += withdraw.amount0
    hypervisorDayData.withdrawn1 += withdraw.amount1
    hypervisorDayData.withdrawnUSD += withdraw.amountUSD
    hypervisorDayData.save()
}

export function handleTransfer(event: TransferEvent): void {
	let hypervisorId = event.address.toHex()
	let fromAddress = event.params.from.toHexString()
	let toAddress = event.params.to.toHexString()
	let shares = event.params.value

	// // Check from and to address are not masterchef
	// let fromCheck = MasterChef.load(fromAddress)
	// let toCheck = MasterChef.load(toAddress)

	// if (fromCheck || toCheck) {
	// 	// This means it is a masterchef transfer
	// 	return
	// }

	let initialToken0 = ZERO_BI
	let initialToken1 = ZERO_BI
	let initialUSD = ZERO_BD
	if (fromAddress != ADDRESS_ZERO && toAddress != ADDRESS_ZERO) {
		let fromShare = getOrCreateHypervisorShare(hypervisorId, fromAddress)
		let toShare = getOrCreateHypervisorShare(hypervisorId, toAddress)

		if (shares >= fromShare.shares) {
			initialToken0 = fromShare.initialToken0
			initialToken1 = fromShare.initialToken1
			initialUSD = fromShare.initialUSD
			// If all shares are withdrawn, remove entity
			let hypervisorShareId = hypervisorId + "-" + fromAddress
			store.remove('UniswapV3HypervisorShare', hypervisorShareId)
			let accountFrom = Account.load(fromAddress)
			if (accountFrom != null) {
				accountFrom.hypervisorCount = accountFrom.hypervisorCount.minus(ONE_BI)
				accountFrom.save()
			}
			let hypervisor = getOrCreateHypervisor(event.address, event.block.timestamp)
			hypervisor.accountCount = hypervisor.accountCount.minus(ONE_BI)
			hypervisor.save()
		} else {
			initialToken0 = fromShare.initialToken0.times(shares).div(fromShare.shares)
			initialToken1 = fromShare.initialToken1.times(shares).div(fromShare.shares)
			initialUSD = fromShare.initialUSD.times(shares.toBigDecimal()).div(fromShare.shares.toBigDecimal())

			fromShare.initialToken0 = fromShare.initialToken0.minus(initialToken0)
			fromShare.initialToken1 = fromShare.initialToken1.minus(initialToken1)
			fromShare.initialUSD = fromShare.initialUSD.minus(initialUSD)
			fromShare.shares = fromShare.shares.minus(shares)
			fromShare.save()
		}

		toShare.initialToken0 = toShare.initialToken0.plus(initialToken0)
		toShare.initialToken1 = toShare.initialToken1.plus(initialToken1)
		toShare.initialUSD = toShare.initialUSD.plus(initialUSD)
		toShare.shares = toShare.shares.plus(shares)
		toShare.save()
	}	
}

export function handleSetDepositMax(call: SetDepositMaxCall): void {
	let hypervisor = getOrCreateHypervisor(call.to, call.block.timestamp)
	hypervisor.deposit0Max = call.inputs._deposit0Max
	hypervisor.deposit1Max = call.inputs._deposit1Max
	hypervisor.save()
}

export function handleSetMaxTotalSupply(call: SetMaxTotalSupplyCall): void {
	let hypervisor = getOrCreateHypervisor(call.to, call.block.timestamp)
	hypervisor.maxTotalSupply = call.inputs._maxTotalSupply
	hypervisor.save()
}
