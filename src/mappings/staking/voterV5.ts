import { GaugeCreated } from "../../../generated/LineaVoterV5/LineaVoterV5"
import { HypervisorStaking } from "../../../generated/schema"

export function handleGaugeCreated(event: GaugeCreated): void {
    let gauge = HypervisorStaking.load(event.params.gauge)
    if (!gauge) {
        gauge = new HypervisorStaking(event.params.gauge)
        gauge.hypervisor = event.params.pool.toHex()
        gauge.save()
    }
}