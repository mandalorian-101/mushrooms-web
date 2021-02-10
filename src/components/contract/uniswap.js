import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'


function getClient(uri) {
    uri = uri || 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2';
    const client = new ApolloClient({
        link: new HttpLink({
            uri: uri,
        }),
        cache: new InMemoryCache(),
        shouldBatch: true,
    })
    return client;
}

export const PAIR_DAY_DATA = gql`
  query pairDayDatas($pairAddress: Bytes!, $date: Int!) {
    pairDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { pairAddress: $pairAddress, date_lt: $date }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      totalSupply
      reserveUSD
    }
  }
`
console.log("PAIR_DAY_DATA");

export async function queryPairData(id) {
    let gqlStr = gql`
    query queryPairData($id:Bytes!){
        pair(id: $id) {
          reserve0
          reserve1
          token0Price
          token1Price
        }
      }
    `;
    let response = await getClient().query({
        query: gqlStr,
        variables: {
            id
        },
        fetchPolicy: 'cache-first'
    });

    return response;
}

export async function queryPairDayData(pairAddress, sushi) {
    let result = await getClient(sushi ? "https://api.thegraph.com/subgraphs/name/croco-finance/sushiswap" : null).query({
        query: PAIR_DAY_DATA,
        variables: {
            pairAddress: pairAddress,
            date: parseInt(new Date().getTime() / 1000),
        },
        fetchPolicy: 'cache-first'
    })
    return result;
}


export async function raw(str, url) {
    let result = await getClient(url).query({
        query: gql`
            query queryData{    
                ${str}
            }
        `,
        fetchPolicy: 'cache-first'
    })
    return result;
}