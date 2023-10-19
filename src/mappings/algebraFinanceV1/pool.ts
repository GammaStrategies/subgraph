import { Swap } from "../../../generated/templates/Pool/AlgebraV1Pool";
import { processSwap } from "../../utils/common/pool";

export function handleSwap(event: Swap): void {
    processSwap(
        event.address,
        event.params.price,
        event.params.tick,
        event.block
    )
}