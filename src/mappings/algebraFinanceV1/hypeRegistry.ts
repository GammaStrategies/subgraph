/* eslint-disable prefer-const */
import { dataSource, log } from "@graphprotocol/graph-ts";
import { HypeAdded } from "../../../generated/HypeRegistry/HypeRegistry";
import { Hypervisor as HypervisorContract } from "../../../generated/templates/Hypervisor/Hypervisor";
import { Hypervisor as HypervisorTemplate } from "../../../generated/templates";
import { AlgebraV1Pool as PoolContract } from "../../../generated/templates/Pool/AlgebraV1Pool";
import { getOrCreateHypervisor } from "../../utils/uniswapV3/hypervisor";
import { UniswapV3Hypervisor } from "../../../generated/schema";
import { getOrCreateProtocol } from "../../utils/entities";

export function handleHypeAdded(event: HypeAdded): void {
  log.warning("network name: {}", [dataSource.network()])
  let hypervisor = UniswapV3Hypervisor.load(event.params.hype.toHex());
  if (hypervisor) {
    return; // No need to add if hype was already added manually as orphan.
  }

  const hypervisorContract = HypervisorContract.bind(event.params.hype);
  const test_amount = hypervisorContract.try_getTotalAmounts();
  if (test_amount.reverted) {
    log.warning("Could not add {}, does not appear to be a hypervisor", [
      event.params.hype.toHex(),
    ]);
    return;
  }

  const poolContract = PoolContract.bind(hypervisorContract.pool());
  const test_globalState = poolContract.try_globalState();
  if (test_globalState.reverted) {
    log.warning(
      "Pool associated with {} does not appear to be a valid algebra pool",
      [event.params.hype.toHex()]
    );
    return;
  }

  getOrCreateProtocol();

  hypervisor = getOrCreateHypervisor(event.params.hype, event.block.timestamp);
  hypervisor.save();

  HypervisorTemplate.create(event.params.hype);
}
