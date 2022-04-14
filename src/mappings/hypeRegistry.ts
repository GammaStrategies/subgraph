/* eslint-disable prefer-const */
import {  log } from "@graphprotocol/graph-ts"
import { HypeAdded } from "../../generated/HypeRegistry/HypeRegistry"
import { UniswapV3Hypervisor as HypervisorContract } from "../../generated/templates/UniswapV3Hypervisor/UniswapV3Hypervisor"
import { UniswapV3Hypervisor as HypervisorTemplate } from "../../generated/templates"
import { getOrCreateHypervisor } from "../utils/uniswapV3/hypervisor"


export function handleHypeAdded(event: HypeAdded): void {

    let hypervisorContract = HypervisorContract.bind(event.params.hype)
    let test_amount = hypervisorContract.try_getTotalAmounts()
    if (test_amount.reverted) {
        log.warning("Could not add {}, does not appear to be a hypervisor", [event.params.hype.toHex()])
        return
    }

    let hypervisor = getOrCreateHypervisor(event.params.hype, event.block.timestamp)
    hypervisor.save()
    
    HypervisorTemplate.create(event.params.hype)

}
