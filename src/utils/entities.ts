import { User, Account, ProtocolDistribution } from "../../generated/schema"


export function getOrCreateUser(addressString: string, saveOnCreate: boolean=false): User {
	let user = User.load(addressString)
	if (user == null) {
		user = new User(addressString)
		user.activeAccount = addressString

		if (saveOnCreate) {
			user.save()
		}
	}
	return user as User
}


export function getOrCreateAccount(addressString: string, saveOnCreate: boolean=false): Account {
	let account = Account.load(addressString)
	if (account == null) {
		account = new Account(addressString)
        account.type == "non visor"
		account.parent = addressString  // Default to self, update to visor owner if created from Visor Factory
		
		if (saveOnCreate) {
			account.save()
		}
	}

	return account as Account
}


export function getOrCreateProtocolDistribution(
    tokenId: string
): ProtocolDistribution {
    let protocolDist = ProtocolDistribution.load(tokenId)

    if (!protocolDist) {
        protocolDist = new ProtocolDistribution(tokenId)
    }

    return protocolDist as ProtocolDistribution
}
