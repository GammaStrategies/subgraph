/* eslint-disable prefer-const */
import { HypeAdded } from "../../generated/HypeRegistry/HypeRegistry"
import { UniswapV3Hypervisor as HypervisorTemplate } from "../../generated/templates"
import { getOrCreateHypervisor } from "../utils/uniswapV3/hypervisor"

export function handleHypeAdded(event: HypeAdded): void {

    let hypervisor = getOrCreateHypervisor(event.params.hype, event.block.timestamp)
    hypervisor.save()
    
    HypervisorTemplate.create(event.params.hype)
}