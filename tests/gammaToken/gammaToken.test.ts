import { BigInt } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as";
import { createTransferEvent, mockToken } from "../utils/events"
import { handleTransfer } from '../../src/mappings/gammaToken'


// test("Distribution event", () => {

//     let transferEvent = createTransferEvent(
//         "0x0b7d3ae92b6f4a440bacc4b9826ad2b4c35a12c8",
//         "0x26805021988f1a45dc708b5fb75fc75f21747d8c",
//         "100000000000000000000"  // 100 tokens
//     )
//     transferEvent.block.timestamp = BigInt.fromI32(1642419070)

//     mockToken("0x6bea7cfef803d1e3d5f7c0103f7ded065644e197", "GAMMA", "GAMMA", 18)
//     handleTransfer(transferEvent)
//     assert.fieldEquals(
//         "ProtocolDistribution",
//         "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",
//         "distributed",
//         "100000000000000000000"
//     )
// })