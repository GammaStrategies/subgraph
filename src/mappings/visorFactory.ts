/* eslint-disable prefer-const */
import { store } from '@graphprotocol/graph-ts'
import { visorAddressFromTokenId } from "../utils/visor"
import { 
	Approval,
	ApprovalForAll,
	InstanceAdded,
	InstanceRemoved,
	OwnershipTransferred,
	TemplateActive,
	TemplateAdded,
	Transfer
} from "../../generated/VisorFactory/VisorFactory"
import { Factory, OwnerOperator, VisorTemplate } from "../../generated/schema"
import { getOrCreateUser, getOrCreateVisor } from "../utils/visorFactory"

export function handleApproval(event: Approval): void {
	let visorId = visorAddressFromTokenId(event.params.tokenId)
	let visor = getOrCreateVisor(visorId)
	visor.operator = event.params.approved.toHex()
	visor.save()
}

export function handleApprovalForAll(event: ApprovalForAll): void {
	let ownerOperator = new OwnerOperator(event.params.owner.toHex() + "-" + event.params.operator.toHex())
	ownerOperator.owner = event.params.owner.toHex()
	ownerOperator.operator = event.params.operator.toHex()
	ownerOperator.approved = event.params.approved
	ownerOperator.save()
}

export function handleInstanceAdded(event: InstanceAdded): void {
	let visorString = event.params.instance.toHex()
	let ownerString = event.transaction.from.toHex()
	let user = getOrCreateUser(ownerString)
	user.activeVisor = visorString
	user.save()

	let visor = getOrCreateVisor(visorString)
	visor.owner = ownerString
	visor.save()
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
	let user = getOrCreateUser(ownerString)
	user.save()

	let visorId = visorAddressFromTokenId(event.params.tokenId)
	let visor = getOrCreateVisor(visorId)
	visor.tokenId = event.params.tokenId
	visor.owner = ownerString
	visor.save()
}
