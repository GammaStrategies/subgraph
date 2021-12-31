/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts'
import { User, Visor } from "../../generated/schema"

export function visorAddressFromTokenId(tokenId: BigInt): string {
	
	let visorAddress = '0x' + tokenId.toHex().substring(2).padStart(40, "0")

	return visorAddress as string
}

export function getActiveVisor(queryAddress: string): Visor | null {
	let visor = Visor.load(queryAddress)
	let user = User.load(queryAddress)

	if (user != null) {
		visor = Visor.load(user.activeVisor)
	}

	return visor
}
