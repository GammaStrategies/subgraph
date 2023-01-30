import {
  LogPoolAddition,
  LogSetPool,
  LogRewardPerSecond,
  LogUpdatePool,
} from "../../../generated/templates/Rewarder/MasterChefV2Rewarder";
import {
  getHypervisorFromPoolId,
  getOrCreateMCV2Rewarder,
  updateRewarderAllocPoint,
} from "../../utils/masterChefV2";

export function handleLogPoolAddition(event: LogPoolAddition): void {
  // This is the point where a rewarder is attached to a pool, so this is where RewarderPool should be created
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  
  if (!hypervisorAddress) {
    return;
  }

  updateRewarderAllocPoint(
    event.address,
    hypervisorAddress,
    event.params.allocPoint
  );
}

export function handleLogSetPool(event: LogSetPool): void {
  const hypervisorAddress = getHypervisorFromPoolId(
    event.address,
    event.params.pid
  );
  
  if (!hypervisorAddress) {
    return;
  }
  
  updateRewarderAllocPoint(
    event.address,
    hypervisorAddress,
    event.params.allocPoint
  );
}

export function handleLogRewardPerSecond(event: LogRewardPerSecond): void {
  const rewarder = getOrCreateMCV2Rewarder(event.address);
  rewarder.rewardPerSecond = event.params.rewardPerSecond;
  rewarder.save();
}

export function handleLogUpdatePool(event: LogUpdatePool): void {
  const rewarder = getOrCreateMCV2Rewarder(event.address);
  rewarder.lastRewardTimestamp = event.params.lastRewardTime;
  rewarder.save();
}
