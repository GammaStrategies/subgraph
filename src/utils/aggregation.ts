import { Address } from "@graphprotocol/graph-ts";
import { UniswapV3Hypervisor as HypervisorContract } from "../../generated/templates/Hypervisor/UniswapV3Hypervisor";
import {
  UniswapV3HypervisorFactory,
  UniswapV3Hypervisor,
  UniswapV3Pool,
  UniswapV3HypervisorConversion,
} from "../../generated/schema";
import { getOrCreateFactory } from "../utils/uniswapV3/hypervisorFactory";
import { getOrCreateHypervisor } from "../utils/uniswapV3/hypervisor";
import { getExchangeRate, getBaseTokenRateInUSDC } from "../utils/pricing";
import { ZERO_BI, ZERO_BD } from "../config/constants";

export function resetAggregates(hypervisorAddress: string): void {
  // Resets aggregates in factory
  let hypervisor = getOrCreateHypervisor(Address.fromString(hypervisorAddress));
  let factory = getOrCreateFactory(hypervisor.factory);
  factory.grossFeesClaimedUSD = factory.grossFeesClaimedUSD.minus(
    hypervisor.grossFeesClaimedUSD
  );
  factory.protocolFeesCollectedUSD = factory.protocolFeesCollectedUSD.minus(
    hypervisor.protocolFeesCollectedUSD
  );
  factory.feesReinvestedUSD = factory.feesReinvestedUSD.minus(
    hypervisor.feesReinvestedUSD
  );
  factory.tvlUSD = factory.tvlUSD.minus(hypervisor.tvlUSD);
  factory.save();
}

export function updateAggregates(hypervisorAddress: string): void {
  // update aggregates in factory from hypervisor
  let hypervisor = UniswapV3Hypervisor.load(
    hypervisorAddress
  ) as UniswapV3Hypervisor;
  let factory = UniswapV3HypervisorFactory.load(
    hypervisor.factory
  ) as UniswapV3HypervisorFactory;
  factory.grossFeesClaimedUSD = factory.grossFeesClaimedUSD.plus(
    hypervisor.grossFeesClaimedUSD
  );
  factory.protocolFeesCollectedUSD = factory.protocolFeesCollectedUSD.plus(
    hypervisor.protocolFeesCollectedUSD
  );
  factory.feesReinvestedUSD = factory.feesReinvestedUSD.plus(
    hypervisor.feesReinvestedUSD
  );
  factory.tvlUSD = factory.tvlUSD.plus(hypervisor.tvlUSD);
  factory.save();
}

export function updateTvl(hypervisorAddress: Address): void {
  let hypervisorId = hypervisorAddress.toHex();
  let contract = HypervisorContract.bind(hypervisorAddress);
  let totalAmounts = contract.getTotalAmounts();

  let hypervisor = UniswapV3Hypervisor.load(
    hypervisorId
  ) as UniswapV3Hypervisor;
  let conversion = UniswapV3HypervisorConversion.load(
    hypervisorId
  ) as UniswapV3HypervisorConversion;

  hypervisor.tvl0 = totalAmounts.value0;
  hypervisor.tvl1 = totalAmounts.value1;

  let pool = UniswapV3Pool.load(hypervisor.pool) as UniswapV3Pool;
  let price = getExchangeRate(
    Address.fromString(hypervisor.pool),
    conversion.baseTokenIndex
  );
  let baseTokenInUSDC = getBaseTokenRateInUSDC(hypervisorId);

  conversion.priceTokenInBase = price;
  conversion.priceBaseInUSD = baseTokenInUSDC;
  conversion.save();

  if (conversion.baseTokenIndex == 0) {
    // If token0 is base token, then we convert token1 to the base token
    hypervisor.tvlUSD = hypervisor.tvl1
      .toBigDecimal()
      .times(price)
      .plus(hypervisor.tvl0.toBigDecimal())
      .times(baseTokenInUSDC);
  } else if (conversion.baseTokenIndex == 1) {
    // If token1 is base token, then we convert token0 to the base token
    hypervisor.tvlUSD = hypervisor.tvl0
      .toBigDecimal()
      .times(price)
      .plus(hypervisor.tvl1.toBigDecimal())
      .times(baseTokenInUSDC);
  } else {
    // If neither token is a base token, don't track USD
    hypervisor.tvlUSD = ZERO_BD;
  }

  // Update pricePerShare
  hypervisor.totalSupply = contract.totalSupply();
  if (hypervisor.totalSupply > ZERO_BI) {
    hypervisor.pricePerShare = hypervisor.tvlUSD.div(
      hypervisor.totalSupply.toBigDecimal()
    );
  } else {
    // Case where totalSupply is zero because all liquidity is withdrawn.
    // In this case we need to reset pricePerShare to 0
    hypervisor.pricePerShare = ZERO_BD;
  }

  hypervisor.lastUpdated = pool.lastSwapTime;
  hypervisor.save();
}
