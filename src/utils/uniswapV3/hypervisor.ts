/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { UniswapV3Hypervisor as HypervisorContract } from "../../../generated/templates/UniswapV3Hypervisor/UniswapV3Hypervisor";
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Rebalance as RebalanceEvent,
} from "../../../generated/templates/UniswapV3Hypervisor/UniswapV3Hypervisor";
import {
  Account,
  UniswapV3Hypervisor,
  UniswapV3Deposit,
  UniswapV3Rebalance,
  UniswapV3Withdraw,
  UniswapV3HypervisorShare,
} from "../../../generated/schema";
import { UniswapV3Pool as PoolTemplate } from "../../../generated/templates";
import { getOrCreatePool } from "../uniswapV3/pool";
import { createConversion } from "../tokens";
import { ADDRESS_ZERO, ZERO_BI, ONE_BI, ZERO_BD } from "../constants";


export function getOrCreateHypervisor(
  hypervisorAddress: Address,
  timestamp: BigInt
): UniswapV3Hypervisor {
  let hypervisorId = hypervisorAddress.toHex();
  let hypervisor = UniswapV3Hypervisor.load(hypervisorId);

  if (hypervisor == null) {
    let hypervisorContract = HypervisorContract.bind(hypervisorAddress);

    // Creating pool also creates tokens
    let poolAddress = hypervisorContract.pool();
    let pool = getOrCreatePool(poolAddress);

    // Update hypervisors linked to pool
    let hypervisors = pool.hypervisors;
    hypervisors.push(hypervisorId);
    pool.hypervisors = hypervisors;
    pool.save();

    hypervisor = new UniswapV3Hypervisor(hypervisorId);
    hypervisor.pool = poolAddress.toHex();
    hypervisor.factory = ADDRESS_ZERO;
    hypervisor.owner = hypervisorContract.owner();
    hypervisor.symbol = hypervisorContract.symbol();
    hypervisor.created = timestamp.toI32();
    hypervisor.tick = hypervisorContract.currentTick();
    hypervisor.baseLower = hypervisorContract.baseLower();
    hypervisor.baseUpper = hypervisorContract.baseUpper();
    hypervisor.limitLower = hypervisorContract.limitLower();
    hypervisor.limitUpper = hypervisorContract.limitUpper();
    hypervisor.deposit0Max = hypervisorContract.deposit0Max();
    hypervisor.deposit1Max = hypervisorContract.deposit1Max();
    hypervisor.totalSupply = hypervisorContract.totalSupply();
    hypervisor.maxTotalSupply = hypervisorContract.maxTotalSupply();
    hypervisor.grossFeesClaimed0 = ZERO_BI;
    hypervisor.grossFeesClaimed1 = ZERO_BI;
    hypervisor.grossFeesClaimedUSD = ZERO_BD;
    hypervisor.protocolFeesCollected0 = ZERO_BI;
    hypervisor.protocolFeesCollected1 = ZERO_BI;
    hypervisor.protocolFeesCollectedUSD = ZERO_BD;
    hypervisor.feesReinvested0 = ZERO_BI;
    hypervisor.feesReinvested1 = ZERO_BI;
    hypervisor.feesReinvestedUSD = ZERO_BD;
    hypervisor.tvl0 = ZERO_BI;
    hypervisor.tvl1 = ZERO_BI;
    hypervisor.tvlUSD = ZERO_BD;
    hypervisor.pricePerShare = ZERO_BD;
    hypervisor.accountCount = ZERO_BI;
    hypervisor.conversion = hypervisorId;
    hypervisor.lastUpdated = timestamp;
    hypervisor.save();

    // Create Conversion entity to track path to USD calculations
    createConversion(hypervisorId);

    PoolTemplate.create(poolAddress);
  }

  return hypervisor as UniswapV3Hypervisor;
}

export function createDeposit(event: DepositEvent): UniswapV3Deposit {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  let deposit = new UniswapV3Deposit(id);
  deposit.hypervisor = event.address.toHex();
  deposit.timestamp = event.block.timestamp;
  deposit.sender = event.params.sender;
  deposit.to = event.params.to;
  deposit.shares = event.params.shares;
  deposit.amount0 = event.params.amount0;
  deposit.amount1 = event.params.amount1;

  return deposit as UniswapV3Deposit;
}

export function createRebalance(event: RebalanceEvent): UniswapV3Rebalance {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  // 10% fee is hardcoded in the contracts
  let protocolFeeRate = BigInt.fromI32(10);

  let rebalance = new UniswapV3Rebalance(id);
  rebalance.hypervisor = event.address.toHex();
  rebalance.timestamp = event.block.timestamp;
  rebalance.tick = event.params.tick;
  rebalance.totalAmount0 = event.params.totalAmount0;
  rebalance.totalAmount1 = event.params.totalAmount1;
  rebalance.grossFees0 = event.params.feeAmount0;
  rebalance.grossFees1 = event.params.feeAmount1;
  rebalance.protocolFees0 = rebalance.grossFees0 / protocolFeeRate;
  rebalance.protocolFees1 = rebalance.grossFees1 / protocolFeeRate;
  rebalance.netFees0 = rebalance.grossFees0 - rebalance.protocolFees0;
  rebalance.netFees1 = rebalance.grossFees1 - rebalance.protocolFees1;
  rebalance.totalSupply = event.params.totalSupply;

  // Read rebalance limits from contract as not available in event
  let hypervisorContract = HypervisorContract.bind(event.address);

  let basePosition = hypervisorContract.getBasePosition();
  let limitPosition = hypervisorContract.getLimitPosition()
  
  rebalance.baseLower = hypervisorContract.baseLower();
  rebalance.baseUpper = hypervisorContract.baseUpper();
  rebalance.baseLiquidity = basePosition.value0
  rebalance.baseAmount0 = basePosition.value1
  rebalance.baseAmount1 = basePosition.value2

  rebalance.limitLower = hypervisorContract.limitLower();
  rebalance.limitUpper = hypervisorContract.limitUpper();
  rebalance.limitLiquidity = limitPosition.value0
  rebalance.limitAmount0 = limitPosition.value1
  rebalance.limitAmount1 = limitPosition.value2

  return rebalance as UniswapV3Rebalance;
}

export function createWithdraw(event: WithdrawEvent): UniswapV3Withdraw {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  let withdraw = new UniswapV3Withdraw(id);
  withdraw.hypervisor = event.address.toHex();
  withdraw.timestamp = event.block.timestamp;
  withdraw.sender = event.params.sender;
  withdraw.to = event.params.to;
  withdraw.shares = event.params.shares;
  withdraw.amount0 = event.params.amount0;
  withdraw.amount1 = event.params.amount1;

  return withdraw as UniswapV3Withdraw;
}

export function getOrCreateHypervisorShare(
  hypervisorAddress: string,
  accountAddress: string,
): UniswapV3HypervisorShare {

  let id = hypervisorAddress + "-" + accountAddress;

  let hypervisorShare = UniswapV3HypervisorShare.load(id);
  if (hypervisorShare == null) {
    hypervisorShare = new UniswapV3HypervisorShare(id);
    hypervisorShare.hypervisor = hypervisorAddress;
    hypervisorShare.account = accountAddress;
    hypervisorShare.shares = ZERO_BI;
    hypervisorShare.initialToken0 = ZERO_BI;
    hypervisorShare.initialToken1 = ZERO_BI;
    hypervisorShare.initialUSD = ZERO_BD;
    // increment counts
    let account = Account.load(accountAddress);
    if (account != null) {
      account.hypervisorCount += ONE_BI;
      account.save();
    }
    let hypervisor = UniswapV3Hypervisor.load(hypervisorAddress) as UniswapV3Hypervisor;
    hypervisor.accountCount += ONE_BI;
    hypervisor.save();
  }

  return hypervisorShare as UniswapV3HypervisorShare;
}

export function updateLiquidity(hypervisorId: string): void {
  // Need current price, current
}