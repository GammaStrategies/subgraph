/* eslint-disable prefer-const */
import { CustomDeposit, CustomDepositCall } from "../../generated/UniProxy/UniProxy"
import { getOrCreateHypervisor } from "../utils/uniswapV3/hypervisor"


export function handleCustomDepositCall(call: CustomDepositCall): void {
    let hypervisorId = call.inputs.pos
    let hypervisor = getOrCreateHypervisor(hypervisorId, call.block.timestamp)

    hypervisor.deposit0Max = call.inputs.deposit0Max
    hypervisor.deposit0Max = call.inputs.deposit1Max
    hypervisor.maxTotalSupply = call.inputs.maxTotalSupply

    hypervisor.save()
}

export function handleCustomDeposit(event: CustomDeposit): void {
    let hypervisorId = event.params.param0
    let hypervisor = getOrCreateHypervisor(hypervisorId, event.block.timestamp)

    hypervisor.deposit0Max = event.params.param1
    hypervisor.deposit0Max = event.params.param2
    hypervisor.maxTotalSupply = event.params.param3

    hypervisor.save()
}
