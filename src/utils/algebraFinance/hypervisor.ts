import { Address } from "@graphprotocol/graph-ts";
import { AlgebraV1Pool as V1PoolContract } from "../../../generated/templates/Pool/AlgebraV1Pool"
import { AlgebraV2Pool as V2PoolContract } from "../../../generated/templates/Pool/AlgebraV2Pool"
import { getOrCreateHypervisor } from "../uniswapV3/hypervisor";
import { positionKey } from "../common/positions";
import { updateHypervisorFeeGrowth } from "../common/hypervisor";
import { getOrCreateProtocol } from "../entities";

export function updateAlgebraFeeGrowth(
    hypervisorAddress: Address,
    isRebalance: boolean = false
  ): void {
    const protocol = getOrCreateProtocol();

    const hypervisor = getOrCreateHypervisor(hypervisorAddress);
    const poolAddress = Address.fromString(hypervisor.pool);

  
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
    
    if (protocol.name == "algebraV1") {

      const poolContract = V1PoolContract.bind(poolAddress);
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
    } else if (protocol.name == "algebraV2") {

      const poolContract = V2PoolContract.bind(poolAddress);
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
  }