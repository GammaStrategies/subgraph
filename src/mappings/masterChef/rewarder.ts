import {
  LogPoolAddition,
  LogSetPool,
  LogRewardPerSecond,
  LogUpdatePool,
} from "../../../generated/templates/Rewarder/MasterChefV2Rewarder";
import {
  getOrCreateMCV2Rewarder,
  updateRewarderAllocPoint,
} from "../../utils/masterChefV2";

export function handleLogPoolAddition(event: LogPoolAddition): void {
  // This is the point where a rewarder is attached to a pool, so this is where RewarderPool should be created
  updateRewarderAllocPoint(
    event.address,
    event.params.pid,
    event.params.allocPoint
  );
}

export function handleLogSetPool(event: LogSetPool): void {
  updateRewarderAllocPoint(
    event.address,
    event.params.pid,
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
