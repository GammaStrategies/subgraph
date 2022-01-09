import { ProtocolDistribution } from "../../generated/schema";

export function getOrCreateProtocolDistribution(
    tokenId: string
): ProtocolDistribution {
    let protocolDist = ProtocolDistribution.load(tokenId)

    if (!protocolDist) {
        protocolDist = new ProtocolDistribution(tokenId)
    }

    return protocolDist as ProtocolDistribution
}
