import { User, Account, ProtocolDistribution, RewardHypervisorTx } from "../../generated/schema"
import { ZERO_BI } from "./constants"


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
        account.type = "non-visor"
		account.parent = addressString  // Default to self, update to visor owner if created from Visor Factory
		account.gammaDeposited = ZERO_BI
		account.gammaEarnedRealized = ZERO_BI
		account.hypervisorCount = ZERO_BI
		
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


export function getOrCreateRewardHypervisorTx(
	txId: string
): RewardHypervisorTx {
	let tx = RewardHypervisorTx.load(txId)

	if (!tx) {
		tx = new RewardHypervisorTx(txId)
		tx.timestamp = ZERO_BI
		tx.action = ""
		tx.account = ""
		tx.gammaAmount = ZERO_BI
		tx.xgammaAmount = ZERO_BI
		tx.xgammaAmountBefore = ZERO_BI
		tx.xgammaAmountAfter = ZERO_BI
		tx.xgammaSupplyBefore = ZERO_BI
		tx.xgammaSupplyAfter = ZERO_BI
	}

	return tx as RewardHypervisorTx
}
