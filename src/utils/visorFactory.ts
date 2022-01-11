import { User, Visor } from "../../generated/schema"
import { ZERO_BI, ADDRESS_ZERO } from "../utils/constants"


export function getOrCreateUser(addressString: string): User {
	let user = User.load(addressString)
	if (user == null) {
		user = new User(addressString)
		user.activeVisor = ADDRESS_ZERO
	}
	return user as User
}


export function getOrCreateVisor(addressString: string): Visor {
	let visor = Visor.load(addressString)
	if (visor == null) {
		visor = new Visor(addressString)
		visor.tokenId = ZERO_BI
		visor.owner = ADDRESS_ZERO
	}
	return visor as Visor
}
