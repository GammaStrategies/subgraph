import { ClaimRewards } from "../../../generated/templates/RamsesGaugeV2/RamsesGaugeV2";
import { createRamsesClaimRewardsEvent } from "../../utils/entities";

export function handleClaimRewards(event: ClaimRewards): void {
  createRamsesClaimRewardsEvent(event);
}
