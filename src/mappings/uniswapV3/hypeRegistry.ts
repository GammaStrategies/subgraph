/* eslint-disable prefer-const */
import { Address, log } from "@graphprotocol/graph-ts";
import { HypeAdded } from "../../../generated/HypeRegistry/HypeRegistry";
import { Hypervisor as HypervisorContract } from "../../../generated/templates/Hypervisor/Hypervisor";
import {
  Hypervisor as HypervisorTemplate,
  RamsesGaugeV2 as RamsesGaugeTemplate,
  RamsesMultiFeeDistribution as RamsesMfdTemplate,
} from "../../../generated/templates";
import { Pool as PoolContract } from "../../../generated/templates/Pool/Pool";
import { getOrCreateHypervisor } from "../../utils/uniswapV3/hypervisor";
import { UniswapV3Hypervisor } from "../../../generated/schema";
import {
  getOrCreateProtocol,
  getOrCreateRamsesHypervisor,
} from "../../utils/entities";
import { processPoolQueue } from "../../utils/pool";

export function handleHypeAdded(event: HypeAdded): void {
  // Try and clear pool queue
  processPoolQueue(event.block.number);

  log.info("Adding hypervisor: {}", [event.address.toHex()]);
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
  const test_slot0 = poolContract.try_slot0();
  if (test_slot0.reverted) {
    log.warning(
      "Pool associated with {} does not appear to be a valid uniswap pool",
      [event.params.hype.toHex()]
    );
    return;
  }

  const protocol = getOrCreateProtocol();

  hypervisor = getOrCreateHypervisor(
    event.params.hype,
    event.block.timestamp,
    event.block.number
  );
  hypervisor.save();

  HypervisorTemplate.create(event.params.hype);
  log.info("Hypervisor added: {}", [event.address.toHex()]);

  if (protocol.name == "ramses") {
    const ramsesHypervisor = getOrCreateRamsesHypervisor(event.params.hype);
    RamsesGaugeTemplate.create(Address.fromString(ramsesHypervisor.gauge));
    RamsesMfdTemplate.create(Address.fromString(ramsesHypervisor.receiver));
    log.warning("Tracking receiver: {}", [ramsesHypervisor.receiver]);
  }
}
