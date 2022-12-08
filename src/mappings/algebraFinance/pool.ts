import { Swap } from "../../../generated/templates/AlgebraPool/AlgebraPool";
import { processSwap } from "../../utils/common/pool";

export function handleSwap(event: Swap): void {
    processSwap(
        event.address,
        event.params.price,
        event.block
    )
}