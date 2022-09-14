import { log } from "@graphprotocol/graph-ts";
import { RewardsAdded } from "../../generated/RewardsRegistry/RewardsRegistry";
import { MasterChef as MasterChefContract } from "../../generated/templates/MasterChef/MasterChef";
import { MasterChef as MasterChefTemplate } from "../../generated/templates";
import { getOrCreateMasterChef } from "../utils/masterChef";
import { MasterChef } from "../../generated/schema";

export function handleRewardsAdded(event: RewardsAdded): void {
  let masterChef = MasterChef.load(event.params.rewards.toHex());
  if (masterChef) {
    return;  // No need to add if hype was already added manually as orphan.
  }

  let masterChefContract = MasterChefContract.bind(event.params.rewards);
  const testAllocPoints = masterChefContract.try_totalAllocPoint();
  if (testAllocPoints.reverted) {
    log.warning("Could not add {}, does not appear to be a masterchef", [
      event.params.rewards.toHex(),
    ]);
    return;
  }

  masterChef = getOrCreateMasterChef(event.params.rewards);
  masterChef.save();

  MasterChefTemplate.create(event.params.rewards);
}
