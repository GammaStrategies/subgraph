/* eslint-disable prefer-const */
import { store } from '@graphprotocol/graph-ts'
import { visorAddressFromTokenId } from "../utils/account"
import { 
	InstanceAdded,
	InstanceRemoved,
	OwnershipTransferred,
	TemplateActive,
	TemplateAdded,
	Transfer
} from "../../generated/VisorFactory/VisorFactory"
import { Factory, VisorTemplate } from "../../generated/schema"
import { getOrCreateUser, getOrCreateAccount } from "../utils/entities"


export function handleInstanceAdded(event: InstanceAdded): void {
	let visorString = event.params.instance.toHex()
	let ownerString = event.transaction.from.toHex()
	let user = getOrCreateUser(ownerString)
	user.activeAccount = visorString
	user.save()

	let account = getOrCreateAccount(visorString)
	account.type = "visor"
	account.parent = ownerString
	account.save()
}

export function handleInstanceRemoved(event: InstanceRemoved): void {
	store.remove('Visor', event.params.instance.toHex())
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
	let factory = new Factory(event.address.toHex())
	factory.owner = event.params.newOwner
	factory.save()
}

export function handleTemplateActive(event: TemplateActive): void {
	let template = new VisorTemplate(event.params.name.toString())
	template.address = event.params.template
	template.active = true
	template.save()
}

export function handleTemplateAdded(event: TemplateAdded): void {
	let template = VisorTemplate.load(event.params.name.toString())
	if (template == null) {
		template = new VisorTemplate(event.params.name.toString())
		template.active = false
	}
	template.address = event.params.template
	template.save()
}

export function handleTransfer(event: Transfer): void {
	let ownerString = event.params.to.toHex()
	getOrCreateUser(ownerString, true)

	let visorId = visorAddressFromTokenId(event.params.tokenId)
	let account = getOrCreateAccount(visorId)
	// visor.tokenId = event.params.tokenId

	getOrCreateUser(ownerString, true)

	account.parent = ownerString
	account.save()
}
