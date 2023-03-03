import { Address } from "@graphprotocol/graph-ts";
import { AlgebraPool as PoolContract } from "../../../generated/templates/Pool/AlgebraPool"
import { getOrCreateHypervisor } from "../uniswapV3/hypervisor";
import { positionKey } from "../common/positions";
import { updateHypervisorFeeGrowth } from "../common/hypervisor";

export function updateAlgebraFeeGrowth(
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
        basePosition.getFees0(),
        basePosition.getFees1(),
        basePosition.getInnerFeeGrowth0Token(),
        basePosition.getInnerFeeGrowth1Token(),
        limitPosition.getLiquidity(),
        limitPosition.getFees0(),
        limitPosition.getFees1(),
        limitPosition.getInnerFeeGrowth0Token(),
        limitPosition.getInnerFeeGrowth1Token(),
        isRebalance
    )
  }