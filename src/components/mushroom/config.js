import { eventEmitter, getChainId, isApp } from "../../mushroomsStore";


let config = {
    masterchefAddress: "",
    mmVaultAddress: "",
    vaults: [],
    farms: [],
    prices: [
        {
            queryId: "MM",
            showName: "MM"
        },
        {
            queryId: "ethereum",
            showName: "ETH"
        },
        {
            queryId: "curve-dao-token",
            showName: "CRV"
        },
        {
            queryId: "compound-governance-token",
            showName: "COMP"
        },
        {
            queryId: "bitcoin",
            showName: "BTC"
        },
        {
            queryId: "mirror-protocol",
            showName: "MIR"
        },
        {
            queryId: "cover-protocol",
            showName: "COVER"
        },
        {
            queryId: "88mph",
            showName: "MPH"
        },
        {
            queryId: "chainlink",
            showName: "LINK"
        }
    ],
    open: true,
    zaps: {
        coinList: [
            { name: "ETH", decimal: 18, address: "0x0", },
            { name: "WETH", decimal: 18, address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
            { name: "MIR", decimal: 18, address: "0x09a3EcAFa817268f77BE1283176B946C4ff2E608", tokenQueryId: "mirror-protocol" },
            { name: "UST", decimal: 18, address: "0xa47c8bf37f92abed4a126bda807a7b7498661acd", tokenQueryId: "terrausd" },
            { name: "DAI", decimal: 18, address: "0x6b175474e89094c44da98b954eedeac495271d0f" },
            { name: "USDT", decimal: 6, address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
            { name: "USDC", decimal: 6, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
            { name: "WBTC", decimal: 8, address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
            { name: "RENBTC", decimal: 8, address: "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d" },
            { name: "MIR-UST UNI LP", icon: "UniswapLP.png", decimal: 8, address: "0x87dA823B6fC8EB8575a235A824690fda94674c88" },
            { name: "3Crv", decimal: 18, address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490" },
            { name: "crvRENWBTC", decimal: 18, address: "0x49849C98ae39Fff122806C06791Fa73784FB3675" },
        ],
        path: [
            { from: ["ETH"], to: "WETH", type: "deposit", funcAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
            { from: [["MIR", "UST"]], type: "LP", to: "MIR-UST UNI LP", func: "addLiquidity", funcAddress: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", abi: [{ "inputs": [{ "internalType": "address", "name": "tokenA", "type": "address" }, { "internalType": "address", "name": "tokenB", "type": "address" }, { "internalType": "uint256", "name": "amountADesired", "type": "uint256" }, { "internalType": "uint256", "name": "amountBDesired", "type": "uint256" }, { "internalType": "uint256", "name": "amountAMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountBMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "addLiquidity", "outputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "amountB", "type": "uint256" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }] },
            { from: ["DAI", "USDC", "USDT"], addLiquidityMap: ["DAI", "USDC", "USDT"], type: "addLiquidity", to: "3Crv", func: "add_liquidity", funcAddress: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", abi: [{ "name": "add_liquidity", "outputs": [], "inputs": [{ "type": "uint256[3]", "name": "amounts" }, { "type": "uint256", "name": "min_mint_amount" }], "stateMutability": "nonpayable", "type": "function", "gas": 6954858 }] },
            { from: ["WBTC", "RENBTC"], addLiquidityMap: ["RENBTC", "WBTC"], to: "crvRENWBTC", type: "addLiquidity", func: "add_liquidity", funcAddress: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B", abi: [{ "name": "add_liquidity", "outputs": [], "inputs": [{ "type": "uint256[2]", "name": "amounts" }, { "type": "uint256", "name": "min_mint_amount" }], "constant": false, "payable": false, "type": "function", "gas": 5858197 }] }
        ]
    }
};

config.zaps.defaultFrom = [config.zaps.coinList[0]];
config.zaps.defaultPath = config.zaps.path[0];

function setConfig() {
    console.log("current chain id = ", getChainId());
    if (getChainId() == 1) {
        config.masterchefAddress = "0xf8873a6080e8dbf41ada900498de0951074af577";
        config.mmVaultAddress = "0x0c0291f4c12f04da8b4139996c720a89d28ca069";
        config.vaults = [{
            "icon": "3CRV",
            "address": "0x0c0291f4c12f04da8b4139996c720a89d28ca069",
            "type": "vault",
            "token": "3CRV",
            "name": "Matsutake Field",
            apyConfig: {
                gaugeInflationRate: "0xbfcf63294ad7105dea65aa58f8ae5be2d9d0952a",
                gaugeRelativeWeight: "0x2f50d538606fa9edd2b11e2446beb18c9d5846bb",
                gaugeWorkingSupply: "0xbfcf63294ad7105dea65aa58f8ae5be2d9d0952a",
                poolVirtualPrice: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                coinQueryId: "tether",
                apyId: "3pool"
            },
            id: 0
        },
        {
            "icon": "RENCRV",
            "address": "0x1e074d6da2987f0cb5a44f2ab1c5bfeddd81f23f",
            "type": "vault",
            "token": "crvRENWBTC",
            "name": "Boletus Field",
            apyConfig: {
                gaugeInflationRate: "0xB1F2cdeC61db658F091671F5f199635aEF202CAC",
                gaugeRelativeWeight: "0x2f50d538606fa9edd2b11e2446beb18c9d5846bb",
                gaugeWorkingSupply: "0xB1F2cdeC61db658F091671F5f199635aEF202CAC",
                poolVirtualPrice: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
                coinQueryId: "bitcoin",
                apyId: "ren2"
            },
            id: 1
        },
        {
            "icon": "DAI",
            "address": "0x6802377968857656fe8ae47fbece76aae588eef7",
            "type": "vault2",
            "token": "DAI",
            "name": "Kikurage Field",
            apyConfig: {
                strategyAddress: "0xf0ba303fd2ce5ebbb22d0d6590463d7549a08388",
                token: "DAI",
                coinQueryId: "dai"
            },
            id: 2
        }, {
            "icon": "USDT",
            "address": "0x23b197dc671a55f256199cf7e8bee77ea2bdc16d",
            "type": "vault2",
            "token": "USDC",
            "name": "Lentinula Field",
            apyConfig: {
                strategyAddress: "0x8f288a56a6c06ffc75994a2d46e84f8bda1a0744",
                token: "USDC",
                coinQueryId: "usd-coin"
            },
            id: 3,
            flash: true
        }, {
            "icon": "Agaricus",
            "address": "0x374513251ef47db34047f07998e31740496c6faa",
            "type": "mir",
            "token": "MIR-UST UNI LP",
            "name": "Agaricus Field",
            apyConfig: {
                stakedLpShare: "0x5d447fc0f8965ced158bab42414af10139edf0af",
                pair: "0x87dA823B6fC8EB8575a235A824690fda94674c88",
                coinQueryId: "mirror-protocol"
            },
            id: 4,
            flash: true
        }, {
            "icon": "RussulaField",
            "address": "0xb0f1a38F5531b398E2081c2F9E61EdD2A924b488",
            "type": "vault2",
            "token": "WETH",
            "name": "Russula Field",
            apyConfig: {
                strategyAddress: "0xFC89086c0B1f8acbd342f418D3EA1C9e425e5cbb",
                token: "DAI",
                coinQueryId: "ethereum"
            },
            id: 5,
            flash: true
        }, {
            "icon": "CoprinusField",
            "address": "0x41e0c2a507415e25005b1713f5f68ad6648fcf43",
            "type": "mph",
            "token": "UNI",
            "name": "Coprinus Field",
            id: 6,
            apyConfig: {
                coinQueryId: "uniswap"
            },
            flash: true,
            permit: true
        }, {
            "icon": "PleurotusField",
            "address": "0xb06661A221Ab2Ec615531f9632D6Dc5D2984179A",
            "token": "WBTC",
            "name": "Pleurotus Field",
            "type": "vault2",
            apyConfig: {
                strategyAddress: "0xc8EBBaAaD5fF2e5683f8313fd4D056b7Ff738BeD",
                token: "WBTC",
                coinQueryId: "dai",
                valueCoinQueryId: "bitcoin"
            },
            flash: true,
            // permit: true,
            id: 7
        }, {
            "icon": "Calvatia",
            "address": "0x3edee5f69e9a8f88da9063b1aa78311e38dbe96c",
            "token": "LINK",
            "name": "Calvatia Field",
            "type": "vault2",
            apyConfig: {
                strategyAddress: "0xBfA66151a798D893D4537A59dDACC8FDC56BE749",
                token: "DAI",
                coinQueryId: "chainlink"
            },
            flash: true,
            // permit: true,
            id: 8
        }];
        config.farms = [];
        if (!isApp()) {
            config.farms.push({
                external: true,
                icon: "COVER",
                name: "COVER Rewards Mining",
                nameUrl: "https://app.coverprotocol.com/app/rewards",
                line1: "Secure your asset with COVER",
                line1Url: "https://app.coverprotocol.com/app/marketplace/protocols/MUSHROOMS",
                line2: "How does COVER work?",
                line2Url: "https://medium.com/iearn/understanding-cover-protocol-8b12745137b1",
            });
        }
        config.farms = [...config.farms,
        {
            name: "MM",
            pid: 0,
            type: "MM",
            farmName: "Super Mario",
            icon: "MM"
        },
        {
            name: "m3CRV",
            pid: 1,
            type: "CRV",
            farmName: "Enoki Pot",
            icon: "3CRV",
            coinQueryId: "tether",
            vaultId: 0
        },
        {
            name: "MM-USDC UNISWAP LP",
            pid: 2,
            type: "LP",
            farmName: "Cremini Soup",
            icon: "3CRV_M",
            pairAddress: "0xbbf933c1af0e9798615099a37a17cafc6da87732"
        },
        {
            name: "mCrvRenWBTC",
            pid: 3,
            type: "CRV",
            farmName: "Chocolate Truffle",
            icon: "REN3CRV",
            coinQueryId: "bitcoin",
            vaultId: 1
        }, {
            name: "mDAI",
            pid: 4,
            type: "CRV",
            farmName: "Porcini Risotto",
            icon: "DAI",
            coinQueryId: "dai",
            vaultId: 2
        }, {
            name: "mUSDC",
            pid: 5,
            type: "CRV",
            farmName: "Chanterelle Pancake",
            icon: "USDC",
            coinQueryId: "usd-coin",
            vaultId: 3
        }, {
            name: "mMIRUST",
            pid: 6,
            type: "MLP",
            farmName: "Lingzhi Tea",
            icon: "LingzhiTea",
            pairAddress: "0x87dA823B6fC8EB8575a235A824690fda94674c88",
            coinQueryId: "mirror-protocol",
            timestamp: 1607967900000,
            vaultId: 4
        }, {
            name: "MM-ETH SUSHISWAP LP",
            pid: 7,
            type: "SUSHILP",
            farmName: "Snow Fungus Dessert",
            icon: "SnowFungusDessert"
        }, {
            name: "MM-KP3R SUSHISWAP LP",
            pid: 8,
            type: "SUSHILP",
            farmName: "Fried King Oyster",
            icon: "FriedKingOyster"
        },
        {
            name: "mWETH",
            pid: 9,
            type: "CRV",
            farmName: "Maitake Tempura",
            icon: "MaitakeTempura",
            coinQueryId: "ethereum",
            vaultId: 5,
            timestamp: 1609178400000
        },
        {
            name: "mUNI",
            pid: 10,
            type: "CRV",
            farmName: "Budae Jjigae",
            icon: "BudaeJjigae",
            coinQueryId: "uniswap",
            vaultId: 6,
            timestamp: 1610391600000
        },
        {
            name: "mWBTC",
            pid: 11,
            type: "CRV",
            farmName: "Creamy Pasta",
            icon: "CreamyPasta",
            coinQueryId: "bitcoin",
            vaultId: 7,
            timestamp: 1611615600000
        },
        {
            name: "mLINK",
            pid: 12,
            type: "CRV",
            farmName: "Quinoa Burger",
            icon: "QuinoaBurger",
            coinQueryId: "chainlink",
            vaultId: 8,
            timestamp: 1612224000000
        }]
    } else if (getChainId() == 4) {
        config.masterchefAddress = "0x1bcBFA03FB2217fDD9078d20B7cb2A147A259641";
        config.vaults = [{
            "icon": "USDC",
            "address": "0xb0a4695615D46574a6a604a02826f98852e244f7",
            "type": "vault",
            "token": "USDC",
            "name": "Matsutake Field",
            apyConfig: {
                gaugeInflationRate: "0xbfcf63294ad7105dea65aa58f8ae5be2d9d0952a",
                gaugeRelativeWeight: "0x2f50d538606fa9edd2b11e2446beb18c9d5846bb",
                gaugeWorkingSupply: "0xbfcf63294ad7105dea65aa58f8ae5be2d9d0952a",
                poolVirtualPrice: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
                coinQueryId: "tether",
                apyId: "3pool"
            },
            id: 0
        }];
        config.farms = [
            {
                name: "mUSDC",
                pid: 1,
                type: "CRV",
                farmName: "Enoki Pot",
                icon: "USDC",
                coinQueryId: "tether",
                vaultId: 0
            }
        ]
    } else {
        config.masterchefAddress = "0xb2682f32ca7BAfb339b310595B852e6dB12fe5f5";
        config.mmVaultAddress = "0x0c0291f4c12f04da8b4139996c720a89d28ca069";
        config.vaults = [{
            "icon": "Calvatia",
            "address": "0x6f524b919ca948F063DD642FA915Df13d807e87B",
            "token": "LINK",
            "name": "Calvatia Field",
            "type": "vault2",
            apyConfig: {
                strategyAddress: "0x4e24b3564Dd9f7643955C4269182cF79C454AaAb",
                token: "DAI",
                coinQueryId: "chainlink"
            },
            flash: true,
            // permit: true,
            id: 2
        }];
        config.farms = [
            {
                external: true,
                icon: "COVER",
                name: "COVER Rewards Mining",
                nameUrl: "https://app.coverprotocol.com/app/shieldmining",
                line1: "Secure your asset with COVER",
                line1Url: "https://app.coverprotocol.com/app/marketplace/protocols/MUSHROOMS",
                line2: "How does COVER work?",
                line2Url: "https://medium.com/iearn/understanding-cover-protocol-8b12745137b1",
            },
            {
                name: "mLINK",
                pid: 4,
                type: "CRV",
                farmName: "Quinoa Burger",
                icon: "QuinoaBurger",
                coinQueryId: "chainlink",
                vaultId: 2,
                timestamp: 1610391600000
            }
        ]
        config.zapsAddress = "0xd5842e65F1645b38ff6828Ef026bDFa6C4DfD889";
    }

    config.farms = config.farms.filter(farm => !farm.timestamp || farm.timestamp <= new Date().getTime());
    config.vaults = config.vaults.filter(vault => !vault.timestamp || vault.timestamp <= new Date().getTime());

}

setConfig();
eventEmitter.addListener("ON_CONNECTED", setConfig);

export default config;