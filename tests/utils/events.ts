import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/GammaToken/ERC20";
import { createMockedFunction, newMockEvent } from "matchstick-as"


export function createTransferEvent(
    from: string,
    to: string,
    value: string
): Transfer {
    let newTransferEvent = changetype<Transfer>(newMockEvent())
    newTransferEvent.parameters = new Array()
    let fromParam = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString(from)))
    let toParam = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(to)))
    let valueParam = new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value)))

    newTransferEvent.parameters.push(fromParam)
    newTransferEvent.parameters.push(toParam)
    newTransferEvent.parameters.push(valueParam)

    return newTransferEvent
}

export function mockTokenSymbol(): void {
    createMockedFunction(
        Address.fromString("0x6bea7cfef803d1e3d5f7c0103f7ded065644e197"),
        "symbol",
        "symbol():(string)"
    ).returns([ethereum.Value.fromString("GAMMA")])
}

export function mockToken(address: string, symbol: string, name: string, decimals: i8): void {
    let tokenAddress = Address.fromString(address)
    
    createMockedFunction(tokenAddress, "symbol", "symbol():(string)")
        .returns([ethereum.Value.fromString(symbol)])
    
    createMockedFunction(tokenAddress, "name","name():(string)")
        .returns([ethereum.Value.fromString(name)])
    
    createMockedFunction(tokenAddress, "decimals", "decimals():(uint8)")
    .returns([ethereum.Value.fromI32(decimals)])
}
