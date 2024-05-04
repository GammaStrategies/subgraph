import {
  Deposit,
  Rebalance,
  SetFee,
  Transfer,
  Withdraw,
  ZeroBurn,
} from "../../../generated/templates/Hypervisor/AlgebraHypervisor";
import {
  getOrCreateHypervisor,
  updatePositions,
} from "../../utils/uniswapV3/hypervisor";
import {
  processDeposit,
  processFees,
  processRebalance,
  processTransfer,
  processWithdraw,
  setHypervisorVersion,
  updateFeeGrowth,
} from "../../utils/common/hypervisor";

export function handleDeposit(event: Deposit): void {
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

export function handleWithdraw(event: Withdraw): void {
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

export function handleRebalance(event: Rebalance): void {
  processRebalance(
    event.params.tick,
    event.params.totalAmount0,
    event.params.totalAmount1,
    event.params.feeAmount0,
    event.params.feeAmount1,
    event.params.totalSupply,
    event
  );
  updatePositions(event.address);
  updateFeeGrowth(event.address, true);
}

export function handleTransfer(event: Transfer): void {
  processTransfer(
    event.params.from,
    event.params.to,
    event.params.value,
    event
  );
}

export function handleZeroBurn(event: ZeroBurn): void {
  setHypervisorVersion(event.address, "ZeroBurn");
  processFees(event.address, event.block, event.params.fees0, event.params.fees1);
  updatePositions(event.address);
  updateFeeGrowth(event.address);
}

export function handleSetFee(event: SetFee): void {
  const hypervisor = getOrCreateHypervisor(event.address);
  hypervisor.fee = event.params.newFee;
  hypervisor.save();
}
