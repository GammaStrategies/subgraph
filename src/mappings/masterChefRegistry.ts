import { log } from "@graphprotocol/graph-ts"
import { HypeAdded } from "../../generated/MasterChefRegistry/HypeRegistry"
import { MasterChef as MasterChefContract } from "../../generated/templates/MasterChef/MasterChef"
import { MasterChef as MasterChefTemplate } from "../../generated/templates"
import { getOrCreateMasterChef } from "../utils/masterChef"

export function handleHypeAdded(event: HypeAdded): void {

    let masterChefContract = MasterChefContract.bind(event.params.hype)
    const testAllocPoints = masterChefContract.try_totalAllocPoint()
    if (testAllocPoints.reverted) {
        log.warning("Could not add {}, does not appear to be a masterchef", [event.params.hype.toHex()])
        return
    }

    let masterChef = getOrCreateMasterChef(event.params.hype)
    masterChef.save()
    
    MasterChefTemplate.create(event.params.hype)

}
