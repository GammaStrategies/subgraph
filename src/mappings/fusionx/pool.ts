import { Swap } from "../../../generated/templates/Pool/Pool"
import { processSwap } from '../../utils/common/pool'

export function handleSwap(event: Swap): void {
    processSwap(
        event.address,
        event.params.sqrtPriceX96,
        event.block
    )
}
