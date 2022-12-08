import {
  LogInit,
  LogRewardPerSecond,
  LogUpdatePool,
} from "../../../generated/templates/Rewarder/MasterChefV2Rewarder";
import { getOrCreateMasterChefV2Rewarder } from "../../utils/masterChefV2";
import { getOrCreateToken } from "../../utils/tokens";

export function handleLogInit(event: LogInit): void {
  const rewarder = getOrCreateMasterChefV2Rewarder(event.address);
  const rewardToken = getOrCreateToken(event.params.rewardToken);
  rewarder.rewardToken = rewardToken.id;
  rewarder.rewardPerSecond = event.params.rewardPerSecond;
  rewarder.save();
}

export function handleLogSushiPerSecond(event: LogRewardPerSecond): void {
  const rewarder = getOrCreateMasterChefV2Rewarder(event.address);
  rewarder.rewardPerSecond = event.params.rewardPerSecond;
  rewarder.save();
}

export function handleLogUpdatePool(event: LogUpdatePool): void {
  const rewarder = getOrCreateMasterChefV2Rewarder(event.address);
  rewarder.lastRewardTimestamp = event.params.lastRewardTime;
  rewarder.save();
}
