# Gamma Strategies Subgraph

This subgraph aims to provides data for all products of Gamma Strategies.  This includes: 
1. Phase 1 Liquidity Mining Program
1. Gamma Strategies Hypervisors managing liquidity on Uniswap V3 type DEXes

## Gamma Strategies Hypervisors
These hypervisors are used to actively manage LP positions on Uniswap V3.  Entities that relate these hypervisors are named beginning with UniswapV3. E.g. UniswapV3Hypervisor.

## Hosted Service
The subgraph is currently hosted on The Graph Hosted Service.

| DEX | Chain | Deployment | API Playground |
|-----|-------|------------|----------------|
| Uniswap | Ethereum | [gammastrategies/gamma](https://thegraph.com/hosted-service/subgraph/gammastrategies/gamma) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/gamma) |
| Uniswap | Polygon | [gammastrategies/polygon](https://thegraph.com/hosted-service/subgraph/gammastrategies/polygon) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/polygon) |
| Uniswap | Arbitrum | [gammastrategies/arbitrum](https://thegraph.com/hosted-service/subgraph/gammastrategies/arbitrum) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/arbitrum) |
| Uniswap | Optimism | [gammastrategies/optimism](https://thegraph.com/hosted-service/subgraph/gammastrategies/optimism) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/optimism) |
| Uniswap | BSC | [gammastrategies/uniswap-bsc](https://thegraph.com/hosted-service/subgraph/gammastrategies/uniswap-bsc) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/uniswap-bsc) |
| Uniswap | Celo | [gammastrategies/celo](https://thegraph.com/hosted-service/subgraph/gammastrategies/celo) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/celo) |
| Quickswap | Polygon | [gammastrategies/algebra-polygon](https://thegraph.com/hosted-service/subgraph/gammastrategies/algebra-polygon) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/algebra-polygon) |
| Zyberswap | Arbitrum | [gammastrategies/zyberswap-arbitrum](https://thegraph.com/hosted-service/subgraph/gammastrategies/zyberswap-arbitrum) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/zyberswap-arbitrum) |
| Thena | BSC | [gammastrategies/thena](https://thegraph.com/hosted-service/subgraph/gammastrategies/thena) | [API](https://api.thegraph.com/subgraphs/name/gammastrategies/thena) |

## Build and Deploy
To deploy full subgraph to the hosted service at visorfinance/visor:
1. Generate the full subgraph.yaml file with ```yarn prepare:{DEX}:{chain}```.  E.g. for uniswap on polygon this will be: ```yarn prepare:uniswap:mainnet```.
2. Run ```yarn codegen```  to prepare the TypeScript sources for the GraphQL and ABIs.
3. Deploy via ```yarn deploy:{DEX}:{chain} --access-token <ACCESS_TOKEN>```

The access token can alternatively be added via ```graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>```
