import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Hypervisor as HypervisorContract } from "../../../generated/templates/Hypervisor/Hypervisor";
import { UniswapV3Pool as PoolContract } from "../../../generated/templates/Pool/UniswapV3Pool";
import {
  UniswapV3Hypervisor,
  UniswapV3Deposit,
  UniswapV3Rebalance,
  UniswapV3Withdraw,
  UniswapV3HypervisorShare,
  UniswapV3FeeUpdate,
} from "../../../generated/schema";
import { Pool as PoolTemplate } from "../../../generated/templates";
import { getOrCreatePool } from "../pool";
import { createConversion } from "../tokens";
import { ADDRESS_ZERO, ZERO_BI, ONE_BI, ZERO_BD } from "../constants";
import { positionKey } from "../common/positions";
import { getOrCreateAccount, getOrCreateUser } from "../entities";
import { splitFees } from "../fees";
import { updateHypervisorFeeGrowth } from "../common/hypervisor";

export function getOrCreateHypervisor(
  hypervisorAddress: Address,
  timestamp: BigInt = ZERO_BI
): UniswapV3Hypervisor {
  const hypervisorId = hypervisorAddress.toHex();
  let hypervisor = UniswapV3Hypervisor.load(hypervisorId);

  if (hypervisor == null) {
    const hypervisorContract = HypervisorContract.bind(hypervisorAddress);

    // Creating pool also creates tokens
    const poolAddress = hypervisorContract.pool();
    const pool = getOrCreatePool(poolAddress);

    // Update hypervisors linked to pool
    const hypervisors = pool.hypervisors;
    hypervisors.push(hypervisorId);
    pool.hypervisors = hypervisors;
    pool.save();

    hypervisor = new UniswapV3Hypervisor(hypervisorId);
    hypervisor.pool = poolAddress.toHex();
    hypervisor.factory = ADDRESS_ZERO;
    hypervisor.version = "";
    hypervisor.owner = hypervisorContract.owner();
    hypervisor.symbol = hypervisorContract.symbol();
    hypervisor.fee = 10;
    hypervisor.created = timestamp.toI32();
    hypervisor.tick = hypervisorContract.currentTick();
    hypervisor.baseLower = hypervisorContract.baseLower();
    hypervisor.baseUpper = hypervisorContract.baseUpper();
    hypervisor.baseLiquidity = ZERO_BI;
    hypervisor.baseAmount0 = ZERO_BI;
    hypervisor.baseAmount1 = ZERO_BI;
    hypervisor.baseTokensOwed0 = ZERO_BI;
    hypervisor.baseTokensOwed1 = ZERO_BI;
    hypervisor.baseFeeGrowthInside0LastX128 = ZERO_BI;
    hypervisor.baseFeeGrowthInside1LastX128 = ZERO_BI;
    hypervisor.baseFeeGrowthInside0LastRebalanceX128 = ZERO_BI;
    hypervisor.baseFeeGrowthInside1LastRebalanceX128 = ZERO_BI;
    hypervisor.limitLower = hypervisorContract.limitLower();
    hypervisor.limitUpper = hypervisorContract.limitUpper();
    hypervisor.limitLiquidity = ZERO_BI;
    hypervisor.limitAmount0 = ZERO_BI;
    hypervisor.limitAmount1 = ZERO_BI;
    hypervisor.limitTokensOwed0 = ZERO_BI;
    hypervisor.limitTokensOwed1 = ZERO_BI;
    hypervisor.limitFeeGrowthInside0LastX128 = ZERO_BI;
    hypervisor.limitFeeGrowthInside1LastX128 = ZERO_BI;
    hypervisor.limitFeeGrowthInside0LastRebalanceX128 = ZERO_BI;
    hypervisor.limitFeeGrowthInside1LastRebalanceX128 = ZERO_BI;
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

export function createDeposit(
  sender: Address,
  to: Address,
  shares: BigInt,
  amount0: BigInt,
  amount1: BigInt,
  event: ethereum.Event
): UniswapV3Deposit {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  const deposit = new UniswapV3Deposit(id);
  deposit.hypervisor = event.address.toHex();
  deposit.block = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.sender = sender;
  deposit.to = to;
  deposit.shares = shares;
  deposit.amount0 = amount0;
  deposit.amount1 = amount1;
  deposit.amountUSD = ZERO_BD;

  return deposit as UniswapV3Deposit;
}

export function createRebalance(
  tick: i32,
  totalAmount0: BigInt,
  totalAmount1: BigInt,
  feeAmount0: BigInt,
  feeAmount1: BigInt,
  totalSupply: BigInt,
  feeRate: i32,
  event: ethereum.Event
): UniswapV3Rebalance {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  const collectedFees0 = splitFees(feeAmount0, feeRate)
  const collectedFees1 = splitFees(feeAmount1, feeRate)

  const rebalance = new UniswapV3Rebalance(id);
  rebalance.hypervisor = event.address.toHex();
  rebalance.block = event.block.number;
  rebalance.timestamp = event.block.timestamp;
  rebalance.tick = tick;
  rebalance.totalAmount0 = totalAmount0;
  rebalance.totalAmount1 = totalAmount1;
  rebalance.grossFees0 = collectedFees0.grossFees;
  rebalance.grossFees1 = collectedFees1.grossFees;
  rebalance.protocolFees0 = collectedFees0.protocolFees
  rebalance.protocolFees1 = collectedFees1.protocolFees
  rebalance.netFees0 = collectedFees0.netFees
  rebalance.netFees1 = collectedFees1.netFees
  rebalance.totalSupply = totalSupply;

  // Read rebalance limits from contract as not available in event
  const hypervisorContract = HypervisorContract.bind(event.address);

  const basePosition = hypervisorContract.getBasePosition();
  const limitPosition = hypervisorContract.getLimitPosition();

  rebalance.baseLower = hypervisorContract.baseLower();
  rebalance.baseUpper = hypervisorContract.baseUpper();
  rebalance.baseLiquidity = basePosition.value0;
  rebalance.baseAmount0 = basePosition.value1;
  rebalance.baseAmount1 = basePosition.value2;

  rebalance.limitLower = hypervisorContract.limitLower();
  rebalance.limitUpper = hypervisorContract.limitUpper();
  rebalance.limitLiquidity = limitPosition.value0;
  rebalance.limitAmount0 = limitPosition.value1;
  rebalance.limitAmount1 = limitPosition.value2;

  return rebalance as UniswapV3Rebalance;
}

export function createWithdraw(
  sender: Address,
  to: Address,
  shares: BigInt,
  amount0: BigInt,
  amount1: BigInt,
  event: ethereum.Event
): UniswapV3Withdraw {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  const withdraw = new UniswapV3Withdraw(id);
  withdraw.hypervisor = event.address.toHex();
  withdraw.block = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.sender = sender;
  withdraw.to = to;
  withdraw.shares = shares;
  withdraw.amount0 = amount0;
  withdraw.amount1 = amount1;
  withdraw.amountUSD = ZERO_BD;

  return withdraw as UniswapV3Withdraw;
}

// export function createFeeUpdate(event: ethereum.Event): UniswapV3FeeUpdate {
//   const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
// }

export function getOrCreateHypervisorShare(
  hypervisorAddress: string,
  accountAddress: string
): UniswapV3HypervisorShare {
  const id = hypervisorAddress + "-" + accountAddress;

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
    const account = getOrCreateAccount(accountAddress);
    account.hypervisorCount += ONE_BI;
    account.save();
    getOrCreateUser(account.parent, true);

    const hypervisor = UniswapV3Hypervisor.load(
      hypervisorAddress
    ) as UniswapV3Hypervisor;
    hypervisor.accountCount += ONE_BI;
    hypervisor.save();
  }

  return hypervisorShare as UniswapV3HypervisorShare;
}

export function updatePositions(hypervisorAddress: Address): void {
  const hypervisor = getOrCreateHypervisor(hypervisorAddress);
  const hypervisorContract = HypervisorContract.bind(hypervisorAddress);

  const basePosition = hypervisorContract.getBasePosition();
  const limitPosition = hypervisorContract.getLimitPosition();

  hypervisor.baseLiquidity = basePosition.value0;
  hypervisor.baseAmount0 = basePosition.value1;
  hypervisor.baseAmount1 = basePosition.value2;
  hypervisor.limitLiquidity = limitPosition.value0;
  hypervisor.limitAmount0 = limitPosition.value1;
  hypervisor.limitAmount1 = limitPosition.value2;

  hypervisor.save();
}


export function updateUniV3FeeGrowth(
  hypervisorAddress: Address,
  isRebalance: boolean = false
): void {
  const hypervisor = getOrCreateHypervisor(hypervisorAddress);
  const poolAddress = Address.fromString(hypervisor.pool);
  const poolContract = PoolContract.bind(poolAddress);

  const baseKey = positionKey(
    hypervisorAddress,
    hypervisor.baseLower,
    hypervisor.baseUpper
  );
  const limitKey = positionKey(
    hypervisorAddress,
    hypervisor.limitLower,
    hypervisor.limitUpper
  );

  const basePosition = poolContract.positions(baseKey);
  const limitPosition = poolContract.positions(limitKey);

  updateHypervisorFeeGrowth(
      hypervisorAddress,
      basePosition.getLiquidity(),
      basePosition.getTokensOwed0(),
      basePosition.getTokensOwed1(),
      basePosition.getFeeGrowthInside0LastX128(),
      basePosition.getFeeGrowthInside1LastX128(),
      limitPosition.getLiquidity(),
      limitPosition.getTokensOwed0(),
      limitPosition.getTokensOwed1(),
      limitPosition.getFeeGrowthInside0LastX128(),
      limitPosition.getFeeGrowthInside1LastX128(),
      isRebalance
  )
}

// export function updateAmounts(hypervisorAddress: Address, sqrtPrice: BigInt): void {
//   let hypervisor = getOrCreateHypervisor(hypervisorAddress)
//   let baseAmounts = getAmounts(
//     sqrtPrice,
//     BigInt.fromI32(hypervisor.baseLower),  // need to convert ticks to sqrtPrice
//     BigInt.fromI32(hypervisor.baseUpper),
//     hypervisor.baseLiquidity
//   )

//   let limitAmounts = getAmounts(
//     sqrtPrice,
//     BigInt.fromI32(hypervisor.limitLower),
//     BigInt.fromI32(hypervisor.limitUpper),
//     hypervisor.limitLiquidity
//   )
// }
