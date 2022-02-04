import { BigInt } from "@graphprotocol/graph-ts"


let Q96 = BigInt.fromI32(2).pow(96)

function getAmount0(
	sqrtA: BigInt,
	sqrtB: BigInt,
	liquidity: BigInt,
): BigInt {
	let priceDiff = (sqrtB - sqrtA).abs()
	let amount0 = liquidity * Q96 * priceDiff / (sqrtA * sqrtB)

	return amount0 as BigInt
}

function getAmount1(
	sqrtA: BigInt,
	sqrtB: BigInt,
	liquidity: BigInt,
): BigInt {
	let priceDiff = (sqrtB - sqrtA).abs()
	let amount1 = liquidity * priceDiff / Q96

	return amount1 as BigInt
}

export function getAmounts(
	sqrtPrice: BigInt,
	sqrtA: BigInt,
	sqrtB: BigInt,
	liquidity: BigInt
): BigInt[] {

	let amount0 = BigInt.fromI32(0)
	let amount1 = BigInt.fromI32(0)

	if (sqrtPrice <= sqrtA) {
		amount0 = getAmount0(sqrtA, sqrtB, liquidity)
	} else if (sqrtPrice >= sqrtB) {
		amount1 = getAmount1(sqrtA, sqrtB, liquidity)
	} else {
		amount0 = getAmount0(sqrtPrice, sqrtB, liquidity)
		amount1 = getAmount1(sqrtA, sqrtPrice, liquidity)
	}

	return [amount0, amount1]
}

function getLiquidity0(
	sqrtA: BigInt,
	sqrtB: BigInt,
	amount0: BigInt
): BigInt {
	let priceDiff = (sqrtB - sqrtA).abs()
	let liquidity0 = amount0 * sqrtA * sqrtB / (Q96 * priceDiff)

	return liquidity0 as BigInt
}

function getLiquidity1(
	sqrtA: BigInt,
	sqrtB: BigInt,
	amount1: BigInt
): BigInt {
	let priceDiff = (sqrtB - sqrtA).abs()
	let liquidity1 = amount1 * Q96 / priceDiff

	return liquidity1 as BigInt
}

export function getLiquidity(
	sqrtPrice: BigInt,
	sqrtA: BigInt,
	sqrtB: BigInt,
	amount0: BigInt,
	amount1: BigInt
): BigInt {
	let liquidity = BigInt.fromI32(13579);
	if (sqrtPrice <= sqrtA) {
		liquidity = getLiquidity0(sqrtA, sqrtB, amount0)
	}
	else if (sqrtPrice >= sqrtB) {
		liquidity = getLiquidity1(sqrtA, sqrtB, amount1)
	} else {
		let liquidity0 = getLiquidity0(sqrtPrice, sqrtB, amount0)
		let liquidity1 = getLiquidity1(sqrtA, sqrtPrice, amount1)

		liquidity = (liquidity0 < liquidity1) ? liquidity0 : liquidity1
	}
    
	return liquidity as BigInt
}

