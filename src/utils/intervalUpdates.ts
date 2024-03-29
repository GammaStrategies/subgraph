/* eslint-disable prefer-const */
import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import {
  DistributionDayData,
  RewardHypervisorDayData,
  UniswapV3HypervisorDayData,
  UniswapV3Hypervisor,
} from "../../generated/schema";
import { ZERO_BD, ZERO_BI } from "../config/constants";
import { getOrCreateRewardHypervisor } from "./entities";

let SECONDS_IN_HOUR = BigInt.fromI32(60 * 60);
let SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24);

export function updateDistributionDayData(
  tokenId: string,
  distributed: BigInt,
  distributedUSD: BigDecimal,
  timestamp: BigInt,
  utcDiffHours: BigInt
): DistributionDayData {
  let utcDiffSeconds = utcDiffHours.times(SECONDS_IN_HOUR);
  let timezone =
    utcDiffHours == ZERO_BI ? "UTC" : "UTC" + utcDiffHours.toString();

  let dayNumber = timestamp.plus(utcDiffSeconds).div(SECONDS_IN_DAY);
  let dayStartTimestamp = dayNumber.times(SECONDS_IN_DAY).minus(utcDiffSeconds);
  let dayId = tokenId + "-" + timezone + "-" + dayNumber.toString();

  let distDayData = DistributionDayData.load(dayId);
  if (distDayData == null) {
    distDayData = new DistributionDayData(dayId);
    distDayData.date = dayStartTimestamp;
    distDayData.timezone = timezone;
    distDayData.token = tokenId;
    distDayData.distributed = ZERO_BI;
    distDayData.distributedUSD = ZERO_BD;
  }

  distDayData.distributed = distDayData.distributed.plus(distributed);
  distDayData.distributedUSD = distDayData.distributedUSD.plus(distributedUSD);
  distDayData.save();

  return distDayData as DistributionDayData;
}

export function updateRewardHypervisorDayData(
  timestamp: BigInt,
  utcDiffHours: BigInt
): RewardHypervisorDayData {
  let utcDiffSeconds = utcDiffHours.times(SECONDS_IN_HOUR);
  let timezone =
    utcDiffHours == ZERO_BI ? "UTC" : "UTC" + utcDiffHours.toString();

  let dayNumber = timestamp.plus(utcDiffSeconds).div(SECONDS_IN_DAY);
  let dayStartTimestamp = dayNumber.times(SECONDS_IN_DAY).minus(utcDiffSeconds);
  let dayId = timezone + "-" + dayNumber.toString();

  let rewardHypervisorDayData = RewardHypervisorDayData.load(dayId);
  if (rewardHypervisorDayData == null) {
    rewardHypervisorDayData = new RewardHypervisorDayData(dayId);
    rewardHypervisorDayData.date = dayStartTimestamp;
    rewardHypervisorDayData.timezone = timezone;
  }

  let xgamma = getOrCreateRewardHypervisor();

  rewardHypervisorDayData.totalGamma = xgamma.totalGamma;
  rewardHypervisorDayData.totalSupply = xgamma.totalSupply;
  rewardHypervisorDayData.save();

  return rewardHypervisorDayData as RewardHypervisorDayData;
}

export function updateAndGetUniswapV3HypervisorDayData(
  hypervisorAddress: string
): UniswapV3HypervisorDayData {
  let hypervisor = UniswapV3Hypervisor.load(
    hypervisorAddress
  ) as UniswapV3Hypervisor;
  // hypervisorDayData.adjustedFeesReinvestedUSD = hypervisor.adjustedFeesReinvestedUSD

  let hypervisorDayDataUTC = getOrCreateHypervisorDayData(
    hypervisorAddress,
    ZERO_BI
  );
  hypervisorDayDataUTC.totalSupply = hypervisor.totalSupply;
  hypervisorDayDataUTC.tvl0 = hypervisor.tvl0;
  hypervisorDayDataUTC.tvl1 = hypervisor.tvl1;
  hypervisorDayDataUTC.tvlUSD = hypervisor.tvlUSD;
  hypervisorDayDataUTC.close = hypervisor.pricePerShare;

  if (hypervisor.pricePerShare > hypervisorDayDataUTC.high) {
    hypervisorDayDataUTC.high = hypervisor.pricePerShare;
  } else if (hypervisor.pricePerShare < hypervisorDayDataUTC.low) {
    hypervisorDayDataUTC.low = hypervisor.pricePerShare;
  }

  return hypervisorDayDataUTC as UniswapV3HypervisorDayData;
}

function getOrCreateHypervisorDayData(
  hypervisorAddress: string,
  utcDiffHours: BigInt
): UniswapV3HypervisorDayData {
  let hypervisor = UniswapV3Hypervisor.load(
    hypervisorAddress
  ) as UniswapV3Hypervisor;

  let utcDiffSeconds = utcDiffHours.times(SECONDS_IN_HOUR);
  let timezone =
    utcDiffHours == ZERO_BI ? "UTC" : "UTC" + utcDiffHours.toString();

  let dayNumber = hypervisor.lastUpdated
    .plus(utcDiffSeconds)
    .div(SECONDS_IN_DAY);
  let dayStartTimestamp = dayNumber.times(SECONDS_IN_DAY).minus(utcDiffSeconds);

  let dayHypervisorId =
    hypervisorAddress + "-" + timezone + "-" + dayNumber.toString();
  let hypervisorDayData = UniswapV3HypervisorDayData.load(dayHypervisorId);
  if (hypervisorDayData === null) {
    hypervisorDayData = new UniswapV3HypervisorDayData(dayHypervisorId);
    hypervisorDayData.date = dayStartTimestamp;
    hypervisorDayData.hypervisor = hypervisorAddress;
    hypervisorDayData.deposited0 = ZERO_BI;
    hypervisorDayData.deposited1 = ZERO_BI;
    hypervisorDayData.depositedUSD = ZERO_BD;
    hypervisorDayData.withdrawn0 = ZERO_BI;
    hypervisorDayData.withdrawn1 = ZERO_BI;
    hypervisorDayData.withdrawnUSD = ZERO_BD;
    hypervisorDayData.grossFeesClaimed0 = ZERO_BI;
    hypervisorDayData.grossFeesClaimed1 = ZERO_BI;
    hypervisorDayData.grossFeesClaimedUSD = ZERO_BD;
    hypervisorDayData.protocolFeesCollected0 = ZERO_BI;
    hypervisorDayData.protocolFeesCollected1 = ZERO_BI;
    hypervisorDayData.protocolFeesCollectedUSD = ZERO_BD;
    hypervisorDayData.feesReinvested0 = ZERO_BI;
    hypervisorDayData.feesReinvested1 = ZERO_BI;
    hypervisorDayData.feesReinvestedUSD = ZERO_BD;
    hypervisorDayData.totalSupply = ZERO_BI;
    hypervisorDayData.tvl0 = ZERO_BI;
    hypervisorDayData.tvl1 = ZERO_BI;
    hypervisorDayData.tvlUSD = ZERO_BD;
    hypervisorDayData.open = hypervisor.pricePerShare;
    hypervisorDayData.close = hypervisor.pricePerShare;
    hypervisorDayData.low = hypervisor.pricePerShare;
    hypervisorDayData.high = hypervisor.pricePerShare;
  }

  return hypervisorDayData as UniswapV3HypervisorDayData;
}
