# Visor Finance Subgraph

This subgraph aims to provides data for all products of Visor Finance.  This includes: 
1. Phase 1 Liquidity Mining Program
1. Uniswap V3 Gamma Strategies Hypervisors

## Gamma Strategies Hypervisors
These hypervisors are used to actively manage LP positions on Uniswap V3.  Entities that relate these hypervisors are named beginning with UniswapV3. E.g. UniswapV3Hypervisor.

## Hosted Service
The subgraph is currently hosted on The Graph Hosted Service and can be accessed at: https://thegraph.com/explorer/subgraph/visorfinance/visor

## Build and Deploy
To deploy full subgraph to the hosted service at visorfinance/visor:
1. Generate the full subgraph.yaml file with ```yarn prepare:full-mainnet```.
2. Run ```yarn codegen```  to prepare the TypeScript sources for the GraphQL and ABIs.
3. Deploy via ```yarn deploy --access-token <ACCESS_TOKEN>```

The access token can alternatively be added via ```graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>```
