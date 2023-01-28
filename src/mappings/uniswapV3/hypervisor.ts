import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent,
  Rebalance as RebalanceEvent,
  Transfer as TransferEvent,
  SetDepositMaxCall,
  SetMaxTotalSupplyCall,
} from "../../../generated/templates/UniswapV3Hypervisor/UniswapV3Hypervisor";
import { getOrCreateHypervisor, updatePositions } from "../../utils/uniswapV3/hypervisor";
import {
  processDeposit,
  processFees,
  processRebalance,
  processTransfer,
  processWithdraw,
  setHypervisorVersion,
  updateFeeGrowth,
} from "../../utils/common/hypervisor";
import { SetFee, ZeroBurn } from "../../../generated/templates/Hypervisor/Hypervisor";

export function handleDeposit(event: DepositEvent): void {
  processDeposit(
    event.params.sender,
    event.params.to,
    event.params.shares,
    event.params.amount0,
    event.params.amount1,
    event
  );
  updatePositions(event.address);
  updateFeeGrowth(event.address);
}

export function handleRebalance(event: RebalanceEvent): void {
  processRebalance(
    event.params.tick,
    event.params.totalAmount0,
    event.params.totalAmount1,
    event.params.feeAmount0,
    event.params.feeAmount1,
    event.params.totalSupply,
    event
  );
  
  const hypervisor = getOrCreateHypervisor(event.address)
  if (hypervisor.version !== "ZeroBurn") {
    processFees(event.address, event.params.feeAmount0, event.params.feeAmount1);
  }

  updatePositions(event.address);
  updateFeeGrowth(event.address, true);
}

export function handleWithdraw(event: WithdrawEvent): void {
  processWithdraw(
    event.params.sender,
    event.params.to,
    event.params.shares,
    event.params.amount0,
    event.params.amount1,
    event
  );
  updatePositions(event.address);
  updateFeeGrowth(event.address);
}

export function handleTransfer(event: TransferEvent): void {
  processTransfer(
    event.params.from,
    event.params.to,
    event.params.value,
    event
  );
}

export function handleZeroBurn(event: ZeroBurn): void {
  setHypervisorVersion(event.address, "ZeroBurn")
  processFees(event.address, event.params.fees0, event.params.fees1);
  updatePositions(event.address);
  updateFeeGrowth(event.address);
}

export function handleSetFee(event: SetFee): void {
  const hypervisor = getOrCreateHypervisor(event.address);
  hypervisor.fee = event.params.newFee;
  hypervisor.save();
}

export function handleSetDepositMax(call: SetDepositMaxCall): void {
  const hypervisor = getOrCreateHypervisor(call.to, call.block.timestamp);
  hypervisor.deposit0Max = call.inputs._deposit0Max;
  hypervisor.deposit1Max = call.inputs._deposit1Max;
  hypervisor.save();
}

export function handleSetMaxTotalSupply(call: SetMaxTotalSupplyCall): void {
  const hypervisor = getOrCreateHypervisor(call.to, call.block.timestamp);
  hypervisor.maxTotalSupply = call.inputs._maxTotalSupply;
  hypervisor.save();
}
