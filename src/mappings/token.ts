import { Upgraded } from "../../generated/templates/Token/ERC20";
import { updateToken } from "../utils/tokens";

export function handleUpgraded(event: Upgraded): void {
  updateToken(event.address);
}
