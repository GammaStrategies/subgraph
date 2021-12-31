/* eslint-disable prefer-const */
import { Address } from '@graphprotocol/graph-ts'
import { HypervisorCreated } from "../../../generated/UniswapV3HypervisorFactory/UniswapV3HypervisorFactory"
import { UniswapV3Hypervisor as HypervisorTemplate } from "../../../generated/templates"
import { getOrCreateHypervisor } from "../../utils/uniswapV3/hypervisor"
import { getOrCreateFactory } from "../../utils/uniswapV3/hypervisorFactory"

//Hypervisors that were created with invalid parameters and should not be indexed
let INVALID_HYPERVISORS: Array<Address> = [
    Address.fromString('0xce721b5dc9624548188b5451bb95989a7927080a'),  // CRV
    Address.fromString('0x0e9e16f6291ba2aaaf41ccffdf19d32ab3691d15'),  // MATIC
    Address.fromString('0x95b801f9bf7c49b383e36924c2ce176be3027d66'),  // Incorrect TCR
    Address.fromString('0x8172b894639f51e58f76baee0c24eac574e52528')   // Another TCR one
]

export function handleHypervisorCreated(event: HypervisorCreated): void {

    if (INVALID_HYPERVISORS.includes(event.params.hypervisor)) return;

    let factoryAddressString = event.address.toHexString()

    let factory = getOrCreateFactory(factoryAddressString)
    factory.save()

    let hypervisor = getOrCreateHypervisor(event.params.hypervisor, event.block.timestamp)
    hypervisor.factory = factoryAddressString
    hypervisor.save()
    
    HypervisorTemplate.create(event.params.hypervisor)
}
