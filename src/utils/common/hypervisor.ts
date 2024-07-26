import { Address, BigInt, ethereum, store } from "@graphprotocol/graph-ts";
import {
  Account,
  HypervisorStaking,
  UniswapV3HypervisorShare,
} from "../../../generated/schema";
import { resetAggregates, updateAggregates, updateTvl } from "../aggregation";
import { updateAlgebraFeeGrowth } from "../algebraFinance/hypervisor";
import { ADDRESS_ZERO, ONE_BI, ZERO_BD, ZERO_BI } from "../../config/constants";
import { getOrCreateFeeUpdate, getOrCreateProtocol } from "../entities";
import { splitFees } from "../fees";
import { updateAndGetUniswapV3HypervisorDayData } from "../intervalUpdates";
import { calcTwoTokenUSD } from "../pricing";
import {
  createDeposit,
  createRebalance,
  createWithdraw,
  getOrCreateHypervisor,
  getOrCreateHypervisorShare,
  updateUniV3FeeGrowth,
} from "../uniswapV3/hypervisor";

export function processDeposit(
  sender: Address,
  to: Address,
  shares: BigInt,
  amount0: BigInt,
  amount1: BigInt,
  event: ethereum.Event
): void {
  const hypervisorId = event.address.toHex();
  const depositAddress = to.toHex();

  // Reset aggregates until new amounts are calculated
  resetAggregates(hypervisorId);

  // Create deposit event
  const deposit = createDeposit(sender, to, shares, amount0, amount1, event);
  deposit.amountUSD = calcTwoTokenUSD(event.address, amount0, amount1);
  deposit.save();

  // Update visor shares
  const hypervisorShare = getOrCreateHypervisorShare(
    hypervisorId,
    depositAddress
  );
  hypervisorShare.shares = hypervisorShare.shares.plus(deposit.shares);
  hypervisorShare.initialToken0 = hypervisorShare.initialToken0.plus(
    deposit.amount0
  );
  hypervisorShare.initialToken1 = hypervisorShare.initialToken1.plus(
    deposit.amount1
  );
  hypervisorShare.initialUSD = hypervisorShare.initialUSD.plus(
    deposit.amountUSD
  );
  hypervisorShare.save();

  updateTvl(event.address);
  updateAggregates(hypervisorId);

  // Aggregate daily data
  const hypervisorDayData =
    updateAndGetUniswapV3HypervisorDayData(hypervisorId);
  hypervisorDayData.deposited0 = hypervisorDayData.deposited0.plus(
    deposit.amount0
  );
  hypervisorDayData.deposited1 = hypervisorDayData.deposited1.plus(
    deposit.amount1
  );
  hypervisorDayData.depositedUSD = hypervisorDayData.depositedUSD.plus(
    deposit.amountUSD
  );
  hypervisorDayData.save();
}

export function processRebalance(
  tick: i32,
  totalAmount0: BigInt,
  totalAmount1: BigInt,
  feeAmount0: BigInt,
  feeAmount1: BigInt,
  totalSupply: BigInt,
  event: ethereum.Event
): void {
  const hypervisor = getOrCreateHypervisor(
    event.address,
    event.block.timestamp
  );
  const hypervisorId = event.address.toHex();

  // Reset aggregates until new amounts are calculated
  resetAggregates(hypervisorId);

  // Create rebalance
  const rebalance = createRebalance(
    tick,
    totalAmount0,
    totalAmount1,
    feeAmount0,
    feeAmount1,
    totalSupply,
    hypervisor.fee,
    event
  );

  rebalance.totalAmountUSD = calcTwoTokenUSD(
    event.address,
    rebalance.totalAmount0,
    rebalance.totalAmount1
  );
  rebalance.grossFeesUSD = calcTwoTokenUSD(
    event.address,
    rebalance.grossFees0,
    rebalance.grossFees1
  );
  rebalance.protocolFeesUSD = calcTwoTokenUSD(
    event.address,
    rebalance.protocolFees0,
    rebalance.protocolFees1
  );
  rebalance.netFeesUSD = calcTwoTokenUSD(
    event.address,
    rebalance.netFees0,
    rebalance.netFees1
  );

  rebalance.save();

  hypervisor.tick = rebalance.tick;
  hypervisor.baseLower = rebalance.baseLower;
  hypervisor.baseUpper = rebalance.baseUpper;
  hypervisor.limitLower = rebalance.limitLower;
  hypervisor.limitUpper = rebalance.limitUpper;
  hypervisor.save();

  updateTvl(event.address);
  updateAggregates(hypervisorId);
}

export function processFees(
  hypervisorAddress: Address,
  block: ethereum.Block,
  amount0: BigInt,
  amount1: BigInt
): void {
  const hypervisor = getOrCreateHypervisor(hypervisorAddress);

  // Reset aggregates until new amounts are calculated
  resetAggregates(hypervisor.id);

  const collectedFees0 = splitFees(amount0, hypervisor.fee);
  const collectedFees1 = splitFees(amount1, hypervisor.fee);

  const grossFeesUSD = calcTwoTokenUSD(
    hypervisorAddress,
    collectedFees0.grossFees,
    collectedFees1.grossFees
  );
  const protocolFeesUSD = calcTwoTokenUSD(
    hypervisorAddress,
    collectedFees0.protocolFees,
    collectedFees1.protocolFees
  );
  const netFeesUSD = calcTwoTokenUSD(
    hypervisorAddress,
    collectedFees0.netFees,
    collectedFees1.netFees
  );

  // Update relevant hypervisor fields
  hypervisor.grossFeesClaimed0 = hypervisor.grossFeesClaimed0.plus(
    collectedFees0.grossFees
  );
  hypervisor.grossFeesClaimed1 = hypervisor.grossFeesClaimed1.plus(
    collectedFees1.grossFees
  );
  hypervisor.grossFeesClaimedUSD =
    hypervisor.grossFeesClaimedUSD.plus(grossFeesUSD);

  hypervisor.protocolFeesCollected0 = hypervisor.protocolFeesCollected0.plus(
    collectedFees0.protocolFees
  );
  hypervisor.protocolFeesCollected1 = hypervisor.protocolFeesCollected1.plus(
    collectedFees1.protocolFees
  );
  hypervisor.protocolFeesCollectedUSD =
    hypervisor.protocolFeesCollectedUSD.plus(protocolFeesUSD);

  hypervisor.feesReinvested0 = hypervisor.feesReinvested0.plus(
    collectedFees0.netFees
  );
  hypervisor.feesReinvested1 = hypervisor.feesReinvested1.plus(
    collectedFees1.netFees
  );
  hypervisor.feesReinvestedUSD = hypervisor.feesReinvestedUSD.plus(netFeesUSD);

  hypervisor.save();

  // Track FeeUpdate in block
  updateFeeUpdate(
    hypervisorAddress,
    block,
    collectedFees0.grossFees,
    collectedFees1.grossFees
  );

  updateAggregates(hypervisor.id);

  // Aggregate daily data
  const hypervisorDayData = updateAndGetUniswapV3HypervisorDayData(
    hypervisor.id
  );
  hypervisorDayData.grossFeesClaimed0 =
    hypervisorDayData.grossFeesClaimed0.plus(collectedFees0.grossFees);
  hypervisorDayData.grossFeesClaimed1 =
    hypervisorDayData.grossFeesClaimed1.plus(collectedFees1.grossFees);
  hypervisorDayData.grossFeesClaimedUSD =
    hypervisorDayData.grossFeesClaimedUSD.plus(grossFeesUSD);

  hypervisorDayData.protocolFeesCollected0 =
    hypervisorDayData.protocolFeesCollected0.plus(collectedFees0.protocolFees);
  hypervisorDayData.protocolFeesCollected1 =
    hypervisorDayData.protocolFeesCollected1.plus(collectedFees1.protocolFees);
  hypervisorDayData.protocolFeesCollectedUSD =
    hypervisorDayData.protocolFeesCollectedUSD.plus(protocolFeesUSD);

  hypervisorDayData.feesReinvested0 = hypervisorDayData.feesReinvested0.plus(
    collectedFees0.netFees
  );
  hypervisorDayData.feesReinvested1 = hypervisorDayData.feesReinvested1.plus(
    collectedFees1.netFees
  );
  hypervisorDayData.feesReinvestedUSD =
    hypervisorDayData.feesReinvestedUSD.plus(netFeesUSD);

  hypervisorDayData.save();
}

export function processWithdraw(
  sender: Address,
  to: Address,
  shares: BigInt,
  amount0: BigInt,
  amount1: BigInt,
  event: ethereum.Event
): void {
  const hypervisor = getOrCreateHypervisor(
    event.address,
    event.block.timestamp
  );
  const hypervisorId = event.address.toHex();

  // Reset factory aggregates until new values are calculated
  resetAggregates(hypervisorId);

  // Create Withdraw event
  const withdraw = createWithdraw(sender, to, shares, amount0, amount1, event);
  withdraw.amountUSD = calcTwoTokenUSD(event.address, amount0, amount1);
  withdraw.save();

  // Update visor shares
  const accountId = sender.toHex();
  const hypervisorShareId = hypervisorId + "-" + accountId;
  const hypervisorShare = UniswapV3HypervisorShare.load(hypervisorShareId);
  if (hypervisorShare != null) {
    if (hypervisorShare.shares == withdraw.shares) {
      // If all shares are withdrawn, remove entity
      store.remove("UniswapV3HypervisorShare", hypervisorShareId);
      const account = Account.load(accountId);
      if (account != null) {
        account.hypervisorCount = account.hypervisorCount.minus(ONE_BI);
        account.save();
      }
      hypervisor.accountCount = hypervisor.accountCount.minus(ONE_BI);
    } else {
      const remainingShares = hypervisorShare.shares.minus(withdraw.shares);
      hypervisorShare.initialToken0 = hypervisorShare.initialToken0
        .times(remainingShares)
        .div(hypervisorShare.shares);
      hypervisorShare.initialToken1 = hypervisorShare.initialToken1
        .times(remainingShares)
        .div(hypervisorShare.shares);
      hypervisorShare.initialUSD = hypervisorShare.initialUSD
        .times(remainingShares.toBigDecimal())
        .div(hypervisorShare.shares.toBigDecimal());
      hypervisorShare.shares = hypervisorShare.shares.minus(withdraw.shares);
      hypervisorShare.save();
    }
  }

  // Update relevant hypervisor fields
  hypervisor.totalSupply = hypervisor.totalSupply.minus(withdraw.shares);
  hypervisor.save();

  updateTvl(event.address);
  updateAggregates(hypervisorId);

  // Aggregate daily data
  const hypervisorDayData =
    updateAndGetUniswapV3HypervisorDayData(hypervisorId);
  hypervisorDayData.withdrawn0 = hypervisorDayData.withdrawn0.plus(
    withdraw.amount0
  );
  hypervisorDayData.withdrawn1 = hypervisorDayData.withdrawn1.plus(
    withdraw.amount1
  );
  hypervisorDayData.withdrawnUSD = hypervisorDayData.withdrawnUSD.plus(
    withdraw.amountUSD
  );
  hypervisorDayData.save();
}

export function processTransfer(
  from: Address,
  to: Address,
  value: BigInt,
  event: ethereum.Event
): void {
  const hypervisorId = event.address.toHex();
  const fromAddress = from.toHexString();
  const toAddress = to.toHexString();
  const shares = value;

  let initialToken0 = ZERO_BI;
  let initialToken1 = ZERO_BI;
  let initialUSD = ZERO_BD;
  if (fromAddress != ADDRESS_ZERO && toAddress != ADDRESS_ZERO) {
    const fromShare = getOrCreateHypervisorShare(hypervisorId, fromAddress);
    const toShare = getOrCreateHypervisorShare(hypervisorId, toAddress);

    
    // Check if this is a transfer to stake shares
    const toGauge = HypervisorStaking.load(to);
    const fromGauge = HypervisorStaking.load(from);
    if (toGauge) {
      // Transferring to gauge, keep shares under the user
      fromShare.sharesStaked = fromShare.sharesStaked.plus(value);
      fromShare.save();
      return;
    } else if (fromGauge) {
      //Transfering from gauge back
      toShare.sharesStaked = fromShare.sharesStaked.minus(value);
      toShare.save();
      return;
    }

    // Real transfer, do accounting for both accounts       
    if (shares >= fromShare.shares) {
      initialToken0 = fromShare.initialToken0;
      initialToken1 = fromShare.initialToken1;
      initialUSD = fromShare.initialUSD;
      // If all shares are withdrawn, remove entity
      const hypervisorShareId = hypervisorId + "-" + fromAddress;
      store.remove("UniswapV3HypervisorShare", hypervisorShareId);
      const accountFrom = Account.load(fromAddress);
      if (accountFrom != null) {
        accountFrom.hypervisorCount = accountFrom.hypervisorCount.minus(ONE_BI);
        accountFrom.save();
      }
      const hypervisor = getOrCreateHypervisor(
        event.address,
        event.block.timestamp
      );
      hypervisor.accountCount = hypervisor.accountCount.minus(ONE_BI);
      hypervisor.save();
    } else {
      initialToken0 = fromShare.initialToken0
        .times(shares)
        .div(fromShare.shares);
      initialToken1 = fromShare.initialToken1
        .times(shares)
        .div(fromShare.shares);
      initialUSD = fromShare.initialUSD
        .times(shares.toBigDecimal())
        .div(fromShare.shares.toBigDecimal());

      fromShare.initialToken0 = fromShare.initialToken0.minus(initialToken0);
      fromShare.initialToken1 = fromShare.initialToken1.minus(initialToken1);
      fromShare.initialUSD = fromShare.initialUSD.minus(initialUSD);
      fromShare.shares = fromShare.shares.minus(shares);
      fromShare.save();
    }

    toShare.initialToken0 = toShare.initialToken0.plus(initialToken0);
    toShare.initialToken1 = toShare.initialToken1.plus(initialToken1);
    toShare.initialUSD = toShare.initialUSD.plus(initialUSD);
    toShare.shares = toShare.shares.plus(shares);
    toShare.save();
  }
}

export function updateHypervisorFeeGrowth(
  hypervisorAddress: Address,
  baseLiquidity: BigInt,
  baseTokensOwed0: BigInt,
  baseTokensOwed1: BigInt,
  baseFeeGrowthInside0LastX128: BigInt,
  baseFeeGrowthInside1LastX128: BigInt,
  limitLiquidity: BigInt,
  limitTokensOwed0: BigInt,
  limitTokensOwed1: BigInt,
  limitFeeGrowthInside0LastX128: BigInt,
  limitFeeGrowthInside1LastX128: BigInt,
  isRebalance: boolean
): void {
  const hypervisor = getOrCreateHypervisor(hypervisorAddress);

  hypervisor.baseLiquidity = baseLiquidity;
  hypervisor.baseTokensOwed0 = baseTokensOwed0;
  hypervisor.baseTokensOwed1 = baseTokensOwed1;
  hypervisor.baseFeeGrowthInside0LastX128 = baseFeeGrowthInside0LastX128;
  hypervisor.baseFeeGrowthInside1LastX128 = baseFeeGrowthInside1LastX128;
  hypervisor.limitLiquidity = limitLiquidity;
  hypervisor.limitTokensOwed0 = limitTokensOwed0;
  hypervisor.limitTokensOwed1 = limitTokensOwed1;
  hypervisor.limitFeeGrowthInside0LastX128 = limitFeeGrowthInside0LastX128;
  hypervisor.limitFeeGrowthInside1LastX128 = limitFeeGrowthInside1LastX128;

  if (isRebalance) {
    hypervisor.baseFeeGrowthInside0LastRebalanceX128 =
      baseFeeGrowthInside0LastX128;
    hypervisor.baseFeeGrowthInside1LastRebalanceX128 =
      baseFeeGrowthInside1LastX128;
    hypervisor.limitFeeGrowthInside0LastRebalanceX128 =
      limitFeeGrowthInside0LastX128;
    hypervisor.limitFeeGrowthInside1LastRebalanceX128 =
      limitFeeGrowthInside1LastX128;
  }

  hypervisor.save();
}

export function updateFeeGrowth(
  hypervisorAddress: Address,
  isRebalance: boolean = false
): void {
  const protocol = getOrCreateProtocol();
  if (
    protocol.underlyingProtocol == "algebraV1" ||
    protocol.underlyingProtocol == "algebraV2" ||
    protocol.underlyingProtocol == "algebraIntegral"
  ) {
    updateAlgebraFeeGrowth(hypervisorAddress, isRebalance);
  } else {
    updateUniV3FeeGrowth(hypervisorAddress, isRebalance);
  }
}

export function setHypervisorVersion(
  hypervisorAddress: Address,
  version: string
): void {
  const hypervisor = getOrCreateHypervisor(hypervisorAddress);
  if (hypervisor.version !== version) {
    hypervisor.version = version;
    hypervisor.save();
  }
}

export function updateFeeUpdate(
  hypervisorAddress: Address,
  block: ethereum.Block,
  fee0: BigInt,
  fee1: BigInt
): void {
  const feeUpdate = getOrCreateFeeUpdate(hypervisorAddress, block);
  feeUpdate.fees0 = feeUpdate.fees0.plus(fee0);
  feeUpdate.fees1 = feeUpdate.fees1.plus(fee1);
  feeUpdate.feesUSD = feeUpdate.feesUSD.plus(
    calcTwoTokenUSD(hypervisorAddress, fee0, fee1)
  );
  feeUpdate.save();
}
