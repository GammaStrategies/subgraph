/* eslint-disable prefer-const */
import { CustomDepositCall } from "../../generated/UniProxy/UniProxy"
import { getOrCreateHypervisor } from "../utils/uniswapV3/hypervisor"


export function handleCustomDepositCall(call: CustomDepositCall): void {
    let hypervisorId = call.inputs.pos
    let hypervisor = getOrCreateHypervisor(hypervisorId, call.block.timestamp)

    hypervisor.deposit0Max = call.inputs.deposit0Max
    hypervisor.deposit0Max = call.inputs.deposit1Max
    hypervisor.maxTotalSupply = call.inputs.maxTotalSupply

    hypervisor.save()
}
