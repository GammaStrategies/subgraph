import { Address, log } from "@graphprotocol/graph-ts";
import { UniswapV3Hypervisor } from "../../../generated/schema";

export function processHypeRemoved(hypervisorAddress: Address): void {
  const hypervisor = UniswapV3Hypervisor.load(hypervisorAddress.toHex());
  if (hypervisor) {
    hypervisor.active = false;
    hypervisor.save();
    log.info("Hypervisor removed: {}", [hypervisorAddress.toHex()]);
  } else {
    log.info("Attempted to remove hypervisor not on registry: {}", [
      hypervisorAddress.toHex(),
    ]);
  }
}
