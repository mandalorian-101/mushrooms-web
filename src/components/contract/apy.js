import { getChainId, getWeb3 } from "../../mushroomsStore";
import mmVault from "./mmVault";

import Coingecko from "coingecko-api";
import { BigNumber } from "bignumber.js";
import masterchef from "./masterchef";
import cmpdStrategy from "./cmpdStrategy";
import { queryPairData, queryPairDayData, raw } from "./uniswap";
import erc20 from "./erc20";
import config from "../mushroom/config";

const GLOBAL_CONFIG = config;


function sum(arr) {
    var r = new BigNumber(0);
    for (var i = arr.length - 1; i >= 0; i--) {
        r = r.plus(arr[i]);
    }
    return r;
}

let coingecko = new Coingecko();

let abi1 = [{ "name": "Deposit", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "Withdraw", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "UpdateLiquidityLimit", "inputs": [{ "type": "address", "name": "user", "indexed": false }, { "type": "uint256", "name": "original_balance", "indexed": false }, { "type": "uint256", "name": "original_supply", "indexed": false }, { "type": "uint256", "name": "working_balance", "indexed": false }, { "type": "uint256", "name": "working_supply", "indexed": false }], "anonymous": false, "type": "event" }, { "outputs": [], "inputs": [{ "type": "address", "name": "lp_addr" }, { "type": "address", "name": "_minter" }], "stateMutability": "nonpayable", "type": "constructor" }, { "name": "user_checkpoint", "outputs": [{ "type": "bool", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 2079152 }, { "name": "claimable_tokens", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 1998318 }, { "name": "kick", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 2084532 }, { "name": "set_approve_deposit", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }, { "type": "bool", "name": "can_deposit" }], "stateMutability": "nonpayable", "type": "function", "gas": 35766 }, { "name": "deposit", "outputs": [], "inputs": [{ "type": "uint256", "name": "_value" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "deposit", "outputs": [], "inputs": [{ "type": "uint256", "name": "_value" }, { "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "withdraw", "outputs": [], "inputs": [{ "type": "uint256", "name": "_value" }], "stateMutability": "nonpayable", "type": "function", "gas": 2208318 }, { "name": "integrate_checkpoint", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2297 }, { "name": "minter", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1421 }, { "name": "crv_token", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1451 }, { "name": "lp_token", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1481 }, { "name": "controller", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1511 }, { "name": "voting_escrow", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1541 }, { "name": "balanceOf", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1725 }, { "name": "totalSupply", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1601 }, { "name": "future_epoch_time", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1631 }, { "name": "approved_to_deposit", "outputs": [{ "type": "bool", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }, { "type": "address", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 1969 }, { "name": "working_balances", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1845 }, { "name": "working_supply", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1721 }, { "name": "period", "outputs": [{ "type": "int128", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1751 }, { "name": "period_timestamp", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1890 }, { "name": "integrate_inv_supply", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1920 }, { "name": "integrate_inv_supply_of", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1995 }, { "name": "integrate_checkpoint_of", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2025 }, { "name": "integrate_fraction", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2055 }, { "name": "inflation_rate", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1931 }];

let abi2 = [{ "name": "CommitOwnership", "inputs": [{ "type": "address", "name": "admin", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "ApplyOwnership", "inputs": [{ "type": "address", "name": "admin", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "AddType", "inputs": [{ "type": "string", "name": "name", "indexed": false }, { "type": "int128", "name": "type_id", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "NewTypeWeight", "inputs": [{ "type": "int128", "name": "type_id", "indexed": false }, { "type": "uint256", "name": "time", "indexed": false }, { "type": "uint256", "name": "weight", "indexed": false }, { "type": "uint256", "name": "total_weight", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "NewGaugeWeight", "inputs": [{ "type": "address", "name": "gauge_address", "indexed": false }, { "type": "uint256", "name": "time", "indexed": false }, { "type": "uint256", "name": "weight", "indexed": false }, { "type": "uint256", "name": "total_weight", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "VoteForGauge", "inputs": [{ "type": "uint256", "name": "time", "indexed": false }, { "type": "address", "name": "user", "indexed": false }, { "type": "address", "name": "gauge_addr", "indexed": false }, { "type": "uint256", "name": "weight", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "NewGauge", "inputs": [{ "type": "address", "name": "addr", "indexed": false }, { "type": "int128", "name": "gauge_type", "indexed": false }, { "type": "uint256", "name": "weight", "indexed": false }], "anonymous": false, "type": "event" }, { "outputs": [], "inputs": [{ "type": "address", "name": "_token" }, { "type": "address", "name": "_voting_escrow" }], "stateMutability": "nonpayable", "type": "constructor" }, { "name": "commit_transfer_ownership", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 37597 }, { "name": "apply_transfer_ownership", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 38497 }, { "name": "gauge_types", "outputs": [{ "type": "int128", "name": "" }], "inputs": [{ "type": "address", "name": "_addr" }], "stateMutability": "view", "type": "function", "gas": 1625 }, { "name": "add_gauge", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }, { "type": "int128", "name": "gauge_type" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "add_gauge", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }, { "type": "int128", "name": "gauge_type" }, { "type": "uint256", "name": "weight" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "checkpoint", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 18033784416 }, { "name": "checkpoint_gauge", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 18087678795 }, { "name": "gauge_relative_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "view", "type": "function" }, { "name": "gauge_relative_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }, { "type": "uint256", "name": "time" }], "stateMutability": "view", "type": "function" }, { "name": "gauge_relative_weight_write", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "gauge_relative_weight_write", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }, { "type": "uint256", "name": "time" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "add_type", "outputs": [], "inputs": [{ "type": "string", "name": "_name" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "add_type", "outputs": [], "inputs": [{ "type": "string", "name": "_name" }, { "type": "uint256", "name": "weight" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "change_type_weight", "outputs": [], "inputs": [{ "type": "int128", "name": "type_id" }, { "type": "uint256", "name": "weight" }], "stateMutability": "nonpayable", "type": "function", "gas": 36246310050 }, { "name": "change_gauge_weight", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }, { "type": "uint256", "name": "weight" }], "stateMutability": "nonpayable", "type": "function", "gas": 36354170809 }, { "name": "vote_for_gauge_weights", "outputs": [], "inputs": [{ "type": "address", "name": "_gauge_addr" }, { "type": "uint256", "name": "_user_weight" }], "stateMutability": "nonpayable", "type": "function", "gas": 18142052127 }, { "name": "get_gauge_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "view", "type": "function", "gas": 2974 }, { "name": "get_type_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "int128", "name": "type_id" }], "stateMutability": "view", "type": "function", "gas": 2977 }, { "name": "get_total_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2693 }, { "name": "get_weights_sum_per_type", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "int128", "name": "type_id" }], "stateMutability": "view", "type": "function", "gas": 3109 }, { "name": "admin", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1841 }, { "name": "future_admin", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1871 }, { "name": "token", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1901 }, { "name": "voting_escrow", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1931 }, { "name": "n_gauge_types", "outputs": [{ "type": "int128", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1961 }, { "name": "n_gauges", "outputs": [{ "type": "int128", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1991 }, { "name": "gauge_type_names", "outputs": [{ "type": "string", "name": "" }], "inputs": [{ "type": "int128", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 8628 }, { "name": "gauges", "outputs": [{ "type": "address", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2160 }, { "name": "vote_user_slopes", "outputs": [{ "type": "uint256", "name": "slope" }, { "type": "uint256", "name": "power" }, { "type": "uint256", "name": "end" }], "inputs": [{ "type": "address", "name": "arg0" }, { "type": "address", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 5020 }, { "name": "vote_user_power", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2265 }, { "name": "last_user_vote", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }, { "type": "address", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 2449 }, { "name": "points_weight", "outputs": [{ "type": "uint256", "name": "bias" }, { "type": "uint256", "name": "slope" }], "inputs": [{ "type": "address", "name": "arg0" }, { "type": "uint256", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 3859 }, { "name": "time_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2355 }, { "name": "points_sum", "outputs": [{ "type": "uint256", "name": "bias" }, { "type": "uint256", "name": "slope" }], "inputs": [{ "type": "int128", "name": "arg0" }, { "type": "uint256", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 3970 }, { "name": "time_sum", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2370 }, { "name": "points_total", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2406 }, { "name": "time_total", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2321 }, { "name": "points_type_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "int128", "name": "arg0" }, { "type": "uint256", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 2671 }, { "name": "time_type_weight", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2490 }];

let abi3 = [{ "name": "Deposit", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "Withdraw", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "value", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "UpdateLiquidityLimit", "inputs": [{ "type": "address", "name": "user", "indexed": false }, { "type": "uint256", "name": "original_balance", "indexed": false }, { "type": "uint256", "name": "original_supply", "indexed": false }, { "type": "uint256", "name": "working_balance", "indexed": false }, { "type": "uint256", "name": "working_supply", "indexed": false }], "anonymous": false, "type": "event" }, { "outputs": [], "inputs": [{ "type": "address", "name": "lp_addr" }, { "type": "address", "name": "_minter" }], "stateMutability": "nonpayable", "type": "constructor" }, { "name": "user_checkpoint", "outputs": [{ "type": "bool", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 2079152 }, { "name": "claimable_tokens", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 1998318 }, { "name": "kick", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function", "gas": 2084532 }, { "name": "set_approve_deposit", "outputs": [], "inputs": [{ "type": "address", "name": "addr" }, { "type": "bool", "name": "can_deposit" }], "stateMutability": "nonpayable", "type": "function", "gas": 35766 }, { "name": "deposit", "outputs": [], "inputs": [{ "type": "uint256", "name": "_value" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "deposit", "outputs": [], "inputs": [{ "type": "uint256", "name": "_value" }, { "type": "address", "name": "addr" }], "stateMutability": "nonpayable", "type": "function" }, { "name": "withdraw", "outputs": [], "inputs": [{ "type": "uint256", "name": "_value" }], "stateMutability": "nonpayable", "type": "function", "gas": 2208318 }, { "name": "integrate_checkpoint", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2297 }, { "name": "minter", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1421 }, { "name": "crv_token", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1451 }, { "name": "lp_token", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1481 }, { "name": "controller", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1511 }, { "name": "voting_escrow", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1541 }, { "name": "balanceOf", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1725 }, { "name": "totalSupply", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1601 }, { "name": "future_epoch_time", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1631 }, { "name": "approved_to_deposit", "outputs": [{ "type": "bool", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }, { "type": "address", "name": "arg1" }], "stateMutability": "view", "type": "function", "gas": 1969 }, { "name": "working_balances", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1845 }, { "name": "working_supply", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1721 }, { "name": "period", "outputs": [{ "type": "int128", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1751 }, { "name": "period_timestamp", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1890 }, { "name": "integrate_inv_supply", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1920 }, { "name": "integrate_inv_supply_of", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 1995 }, { "name": "integrate_checkpoint_of", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2025 }, { "name": "integrate_fraction", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "address", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2055 }, { "name": "inflation_rate", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1931 }];

let abi4 = [{ "name": "TokenExchange", "inputs": [{ "type": "address", "name": "buyer", "indexed": true }, { "type": "int128", "name": "sold_id", "indexed": false }, { "type": "uint256", "name": "tokens_sold", "indexed": false }, { "type": "int128", "name": "bought_id", "indexed": false }, { "type": "uint256", "name": "tokens_bought", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "AddLiquidity", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256[3]", "name": "token_amounts", "indexed": false }, { "type": "uint256[3]", "name": "fees", "indexed": false }, { "type": "uint256", "name": "invariant", "indexed": false }, { "type": "uint256", "name": "token_supply", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "RemoveLiquidity", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256[3]", "name": "token_amounts", "indexed": false }, { "type": "uint256[3]", "name": "fees", "indexed": false }, { "type": "uint256", "name": "token_supply", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "RemoveLiquidityOne", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256", "name": "token_amount", "indexed": false }, { "type": "uint256", "name": "coin_amount", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "RemoveLiquidityImbalance", "inputs": [{ "type": "address", "name": "provider", "indexed": true }, { "type": "uint256[3]", "name": "token_amounts", "indexed": false }, { "type": "uint256[3]", "name": "fees", "indexed": false }, { "type": "uint256", "name": "invariant", "indexed": false }, { "type": "uint256", "name": "token_supply", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "CommitNewAdmin", "inputs": [{ "type": "uint256", "name": "deadline", "indexed": true }, { "type": "address", "name": "admin", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "NewAdmin", "inputs": [{ "type": "address", "name": "admin", "indexed": true }], "anonymous": false, "type": "event" }, { "name": "CommitNewFee", "inputs": [{ "type": "uint256", "name": "deadline", "indexed": true }, { "type": "uint256", "name": "fee", "indexed": false }, { "type": "uint256", "name": "admin_fee", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "NewFee", "inputs": [{ "type": "uint256", "name": "fee", "indexed": false }, { "type": "uint256", "name": "admin_fee", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "RampA", "inputs": [{ "type": "uint256", "name": "old_A", "indexed": false }, { "type": "uint256", "name": "new_A", "indexed": false }, { "type": "uint256", "name": "initial_time", "indexed": false }, { "type": "uint256", "name": "future_time", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "StopRampA", "inputs": [{ "type": "uint256", "name": "A", "indexed": false }, { "type": "uint256", "name": "t", "indexed": false }], "anonymous": false, "type": "event" }, { "outputs": [], "inputs": [{ "type": "address", "name": "_owner" }, { "type": "address[3]", "name": "_coins" }, { "type": "address", "name": "_pool_token" }, { "type": "uint256", "name": "_A" }, { "type": "uint256", "name": "_fee" }, { "type": "uint256", "name": "_admin_fee" }], "stateMutability": "nonpayable", "type": "constructor" }, { "name": "A", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 5227 }, { "name": "get_virtual_price", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1133537 }, { "name": "calc_token_amount", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256[3]", "name": "amounts" }, { "type": "bool", "name": "deposit" }], "stateMutability": "view", "type": "function", "gas": 4508776 }, { "name": "add_liquidity", "outputs": [], "inputs": [{ "type": "uint256[3]", "name": "amounts" }, { "type": "uint256", "name": "min_mint_amount" }], "stateMutability": "nonpayable", "type": "function", "gas": 6954858 }, { "name": "get_dy", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "int128", "name": "i" }, { "type": "int128", "name": "j" }, { "type": "uint256", "name": "dx" }], "stateMutability": "view", "type": "function", "gas": 2673791 }, { "name": "get_dy_underlying", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "int128", "name": "i" }, { "type": "int128", "name": "j" }, { "type": "uint256", "name": "dx" }], "stateMutability": "view", "type": "function", "gas": 2673474 }, { "name": "exchange", "outputs": [], "inputs": [{ "type": "int128", "name": "i" }, { "type": "int128", "name": "j" }, { "type": "uint256", "name": "dx" }, { "type": "uint256", "name": "min_dy" }], "stateMutability": "nonpayable", "type": "function", "gas": 2818066 }, { "name": "remove_liquidity", "outputs": [], "inputs": [{ "type": "uint256", "name": "_amount" }, { "type": "uint256[3]", "name": "min_amounts" }], "stateMutability": "nonpayable", "type": "function", "gas": 192846 }, { "name": "remove_liquidity_imbalance", "outputs": [], "inputs": [{ "type": "uint256[3]", "name": "amounts" }, { "type": "uint256", "name": "max_burn_amount" }], "stateMutability": "nonpayable", "type": "function", "gas": 6951851 }, { "name": "calc_withdraw_one_coin", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "_token_amount" }, { "type": "int128", "name": "i" }], "stateMutability": "view", "type": "function", "gas": 1102 }, { "name": "remove_liquidity_one_coin", "outputs": [], "inputs": [{ "type": "uint256", "name": "_token_amount" }, { "type": "int128", "name": "i" }, { "type": "uint256", "name": "min_amount" }], "stateMutability": "nonpayable", "type": "function", "gas": 4025523 }, { "name": "ramp_A", "outputs": [], "inputs": [{ "type": "uint256", "name": "_future_A" }, { "type": "uint256", "name": "_future_time" }], "stateMutability": "nonpayable", "type": "function", "gas": 151919 }, { "name": "stop_ramp_A", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 148637 }, { "name": "commit_new_fee", "outputs": [], "inputs": [{ "type": "uint256", "name": "new_fee" }, { "type": "uint256", "name": "new_admin_fee" }], "stateMutability": "nonpayable", "type": "function", "gas": 110461 }, { "name": "apply_new_fee", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 97242 }, { "name": "revert_new_parameters", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 21895 }, { "name": "commit_transfer_ownership", "outputs": [], "inputs": [{ "type": "address", "name": "_owner" }], "stateMutability": "nonpayable", "type": "function", "gas": 74572 }, { "name": "apply_transfer_ownership", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 60710 }, { "name": "revert_transfer_ownership", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 21985 }, { "name": "admin_balances", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "i" }], "stateMutability": "view", "type": "function", "gas": 3481 }, { "name": "withdraw_admin_fees", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 21502 }, { "name": "donate_admin_fees", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 111389 }, { "name": "kill_me", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 37998 }, { "name": "unkill_me", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 22135 }, { "name": "coins", "outputs": [{ "type": "address", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2220 }, { "name": "balances", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [{ "type": "uint256", "name": "arg0" }], "stateMutability": "view", "type": "function", "gas": 2250 }, { "name": "fee", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2171 }, { "name": "admin_fee", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2201 }, { "name": "owner", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2231 }, { "name": "initial_A", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2261 }, { "name": "future_A", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2291 }, { "name": "initial_A_time", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2321 }, { "name": "future_A_time", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2351 }, { "name": "admin_actions_deadline", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2381 }, { "name": "transfer_ownership_deadline", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2411 }, { "name": "future_fee", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2441 }, { "name": "future_admin_fee", "outputs": [{ "type": "uint256", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2471 }, { "name": "future_owner", "outputs": [{ "type": "address", "name": "" }], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2501 }];

export async function getApyRate({ name, apyConfig }) {
    if (getChainId() === 4) {
        return 10;
    }
    let web3 = getWeb3();

    let contract1 = new web3.eth.Contract(abi1, apyConfig.gaugeInflationRate);
    let contract2 = new web3.eth.Contract(abi2, apyConfig.gaugeRelativeWeight);
    let contract3 = new web3.eth.Contract(abi3, apyConfig.gaugeInflationRate);
    let contract4 = new web3.eth.Contract(abi4, apyConfig.poolVirtualPrice);

    let [gaugeInflationRate, weight, gaugeWorkingSupply, virtualPrice, response] = await Promise.all([
        contract1.methods.inflation_rate().call(),
        contract2.methods.gauge_relative_weight(apyConfig.gaugeInflationRate).call(),
        contract3.methods.working_supply().call(),
        contract4.methods.get_virtual_price().call(),
        coingecko.simple.price({ ids: apyConfig.coinQueryId, vs_currencies: "usd" })
    ]);
    let price = response.data[apyConfig.coinQueryId].usd;
    console.log("rate", name, gaugeInflationRate, weight, gaugeWorkingSupply, virtualPrice, price);
    let rate = (gaugeInflationRate * weight * 31536000 / (gaugeWorkingSupply * price) * 0.4) / virtualPrice;
    return rate;
}

export async function getApys() {
    let res = await fetch("https://stats.curve.fi/raw-stats/apys.json");
    return await res.json();
}

async function compoundToken(coin) {
    let res = await fetch("https://api.compound.finance/api/v2/ctoken");
    let json = await res.json();
    for (let i = 0; i < json.cToken.length; i++) {
        let token = json.cToken[i];
        if (token.underlying_symbol === coin) {
            return token;
        }
    }
}

export async function computeVaultApy(config) {
    if (getChainId() === 4) {
        return 10;
    }
    if (config.type === "vault") {
        let [apyRate, apys, price] = await Promise.all([
            getApyRate(config),
            getApys(),
            coingecko.simple.price({ ids: "curve-dao-token", vs_currencies: "usd" }),
        ]);
        let crvPrice = price.data["curve-dao-token"].usd;
        let apy = apyRate * crvPrice;
        let pool3Apy = apys.apy.day[config.apyConfig.apyId];
        let resultApy = apy + pool3Apy;
        return resultApy;
    } else if (config.type === "vault2") {
        let cmpdStrategyContract = cmpdStrategy(config.apyConfig.strategyAddress);
        let [ctoken, suppliedView, balanceOfPool, borrowedView, poolTokenPrice] = await Promise.all([
            compoundToken(config.apyConfig.token),
            cmpdStrategyContract.methods.getSuppliedView().call(),
            cmpdStrategyContract.methods.balanceOfPool().call(),
            cmpdStrategyContract.methods.getBorrowedView().call(),
            getTokenPrice(config.apyConfig.coinQueryId)
        ]);

        let supply_rate = ctoken.supply_rate.value * 100;
        let borrow_rate = ctoken.borrow_rate.value * 100;
        let comp_borrow_apy = ctoken.comp_borrow_apy.value;
        let comp_supply_apy = ctoken.comp_supply_apy.value;


        console.log("APY", [supply_rate, borrow_rate, comp_borrow_apy, comp_supply_apy, suppliedView, balanceOfPool, borrowedView]);

        // let erc20Token = erc20(ctoken.underlying_address);
        // let decimals = await erc20Token.methods.decimals().call();

        let poolValue = new BigNumber(balanceOfPool).times(poolTokenPrice);
        let apy = new BigNumber(suppliedView).div(poolValue)
            .times(new BigNumber(supply_rate).plus(comp_supply_apy))
            .plus(
                new BigNumber(borrowedView).div(poolValue).times(
                    new BigNumber(comp_borrow_apy).minus(borrow_rate)
                )
            )
        suppliedView = suppliedView / (10 ** 8)
        balanceOfPool = balanceOfPool / (10 ** 8)
        borrowedView = borrowedView / (10 ** 8)
        console.log(`(${suppliedView} / ${balanceOfPool}) * (${supply_rate} + ${comp_supply_apy}) +  ${borrowedView} / ${balanceOfPool}  * (${comp_borrow_apy} - ${borrow_rate}) = ${apy.toNumber()}`);
        return apy.div(100).toNumber();
    } else if (config.type === "mir") {
        const DECIMALS = 18;
        const SMALLEST = new BigNumber(10).pow(DECIMALS).toString();

        const getMIRAnnualRewards = (now = Date.now(), isMIR = false) => {
            const GENESIS = 1607022000000
            const YEAR_TO_MILLISECONDS = 31556952000
            const rewards = [3431250, 1715625, 857813, 428906]
            const index = Math.max(0, Math.floor((now - GENESIS) / YEAR_TO_MILLISECONDS))
            const reward = rewards[index]
            return !reward ? undefined : isMIR ? reward * 3 : reward
        }

        const apr = (params) => {
            const { MIRAnnualRewards, MIRPrice } = params
            const { liquidityValue, stakedLpShare, totalLpShare } = params

            const MIRAnnualRewardsValue = new BigNumber(MIRAnnualRewards).times(MIRPrice)
            const stakedRatio = new BigNumber(stakedLpShare).div(totalLpShare)
            const liquidityAmount = new BigNumber(liquidityValue).div(SMALLEST)

            const numerator = MIRAnnualRewardsValue
            const denominator = liquidityAmount.times(stakedRatio)

            return denominator.gt(0) ? numerator.div(denominator).toString() : "0"
        }

        let MIRAnnualRewards = getMIRAnnualRewards(Date.now(), true);

        let stakedLpShareToken = erc20(config.apyConfig.stakedLpShare);
        let [stakedLpShare, priceResponse, pairData] = await Promise.all([
            stakedLpShareToken.methods.totalSupply().call(),
            coingecko.simple.price({ ids: config.apyConfig.coinQueryId, vs_currencies: "usd" }),
            queryPairDayData(config.apyConfig.pair)
        ]);
        let MIRPrice = priceResponse.data[config.apyConfig.coinQueryId].usd;
        // stakedLpShare = new BigNumber(stakedLpShare).div(10 ** 18);
        let liquidityValue = parseFloat(pairData.data.pairDayDatas[0].reserveUSD) * 10 ** 18;
        let totalLpShare = parseFloat(pairData.data.pairDayDatas[0].totalSupply) * 10 ** 18;
        console.log({ MIRAnnualRewards, MIRPrice, liquidityValue, totalLpShare, stakedLpShare: stakedLpShare, D: pairData.data.pairDayDatas[0] }, "MIR");

        //         MIRAnnualRewards: "10293750"
        // MIRPrice: "1.36240884761659438744"
        // liquidityValue: "2.15286122048000000000038730749576e+24"
        // stakedLpShare: "8.84158178734e+23"
        // totalLpShare: "8.95999141313e+23"

        return parseFloat(apr({ MIRAnnualRewards, MIRPrice, liquidityValue, totalLpShare, stakedLpShare }));
    } else if (config.type === "mph") {
        let poolList = await (await fetch("https://api.88mph.app/pools")).json();
        let detail = poolList.filter(pool => pool.tokenSymbol === config.token)[0];
        return (parseFloat(detail.oneYearInterestRate) + parseFloat(detail.mphAPY)) / 100;
    }
}


export async function getMMtokenPrice() {
    let [pairData] = await Promise.all([
        queryPairData("0xbbf933c1af0e9798615099a37a17cafc6da87732")
    ]);
    let mmTokenPrice = pairData.data.pair.token0Price;
    return mmTokenPrice;
}

// coingecko.coins.list();
export async function getTokenPrice(id) {
    let response = await coingecko.simple.price({ ids: id, vs_currencies: "usd" });
    return response.data[id].usd;
}

export async function computeFarmApy(config) {
    if (getChainId() === 4) {
        return 10;
    }
    if (config.external) {
        let CLAIM = await raw(` 
                pools(first: 1, where: {id: "0x6cd4eaae3b61a04002e5543382f2b4b1a364871d"}) {
                  id
                  liquidity
                  totalShares
                  tokensList
                }
            `, "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer");
        let NOCLAIM = await raw(` 
                    pools(first: 1, where: {id: "0x4533c2377522c61fc9c6efd3e6a3abe1b2b44022"}) {
                      id
                      liquidity
                      totalShares
                      tokensList
                    }
                `, "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer");

        let mmPrice = await getMMtokenPrice();
        // let all = await coingecko.coins.list(); 
        // console.log("allToken",all);
        let coverPrice = await getTokenPrice("cover-protocol");
        console.log(`((${mmPrice}*458.01645)/${CLAIM.data.pools[0].liquidity})*100*13`);
        console.log(`((${mmPrice}*2595.42655)/${NOCLAIM.data.pools[0].liquidity})*100*13`);
        return [new BigNumber(mmPrice).times(458.01645).times(100).times(52 / 4)
            .plus(new BigNumber(coverPrice).times(0).times(100).times(52))
            .div(CLAIM.data.pools[0].liquidity),
        new BigNumber(mmPrice).times(2595.42655).times(100).times(52 / 4)
            .plus(new BigNumber(coverPrice).times(0).times(100).times(52))
            .div(NOCLAIM.data.pools[0].liquidity)];
    }

    let masterchefContract = masterchef();
    let [poolInfo, totalAllocPoint, mmPerBlock] = await Promise.all([
        masterchefContract.methods.poolInfo(config.pid).call(),
        masterchefContract.methods.totalAllocPoint().call(),
        masterchefContract.methods.mmPerBlock().call(),
    ]);
    let v1 = new BigNumber(poolInfo.allocPoint).div(totalAllocPoint).times(mmPerBlock).div(10 ** 18).times(5760 * 365).times(100);


    if (config.type == "MM") {
        if (poolInfo.amount == 0) {
            return new BigNumber(0);
        }
        async function computeVaultBuyBack(config) {
            let [locked, apy] = await Promise.all([fetchVaultLockedBalance(config), computeVaultApy(config)]);
            return locked.times(apy).times(0.3);
        }

        let [allBuyBack, mmPrice] = await Promise.all([Promise.all(GLOBAL_CONFIG.vaults.map(computeVaultBuyBack)), getMMtokenPrice()])

        let buyBackMMCount = sum(allBuyBack).div(mmPrice);

        return v1.plus(buyBackMMCount.times(100)).div(new BigNumber(poolInfo.amount).div(10 ** 18));
    } else if (config.type == "LP") {
        if (poolInfo.amount == 0) {
            return new BigNumber(0);
        }

        let erc20Contract = erc20(poolInfo.lpToken);
        let [pairDayData, tokenPrice, totalSupply] = await Promise.all([
            queryPairDayData(config.pairAddress),
            getMMtokenPrice(),
            erc20Contract.methods.totalSupply().call()
        ]);

        console.log(pairDayData, tokenPrice, poolInfo, totalSupply, "pairData");
        let reserveusd = pairDayData.data.pairDayDatas[0].reserveUSD;

        let result = v1.times(new BigNumber(tokenPrice)).div(
            new BigNumber(poolInfo.amount).div(totalSupply).times(reserveusd)
        );
        return result;

    } else if (config.type === "MLP") {
        if (poolInfo.amount == 0) {
            return new BigNumber(0);
        }

        let vault = GLOBAL_CONFIG.vaults.filter(v => v.id === config.vaultId)[0];
        let erc20Contract = erc20(config.pairAddress);
        let [pairDayData, tokenPrice, totalSupply, balance] = await Promise.all([
            queryPairDayData(config.pairAddress),
            getMMtokenPrice(),
            erc20Contract.methods.totalSupply().call(),
            mmVault(vault.address).methods.balance().call()
        ]);
        console.log(pairDayData, tokenPrice, poolInfo, totalSupply, "pairData");
        let reserveusd = pairDayData.data.pairDayDatas[0].reserveUSD;

        let result = v1.times(new BigNumber(tokenPrice)).div(
            new BigNumber(balance).div(totalSupply).times(reserveusd)
        );
        return result;
    } else if (config.type === "SUSHILP") {
        if (poolInfo.amount == 0) {
            return new BigNumber(0);
        }

        let erc20Contract = erc20(poolInfo.lpToken);
        let [pairDayData, tokenPrice, totalSupply] = await Promise.all([
            queryPairDayData(poolInfo.lpToken, true),
            getMMtokenPrice(),
            erc20Contract.methods.totalSupply().call()
        ]);

        console.log(pairDayData, tokenPrice, poolInfo, totalSupply, "pairData");
        let reserveusd = pairDayData.data.pairDayDatas[0].reserveUSD;

        let result = v1.times(new BigNumber(tokenPrice)).div(
            new BigNumber(poolInfo.amount).div(totalSupply).times(reserveusd)
        );
        return result;

    } else if (config.type == "CRV") {
        if (poolInfo.amount == 0) {
            return new BigNumber(0);
        }
        let erc20Contract = erc20(poolInfo.lpToken);
        let id = config.coinQueryId;
        let [pairData, decimals, response] = await Promise.all([
            queryPairData("0xbbf933c1af0e9798615099a37a17cafc6da87732"),
            erc20Contract.methods.decimals().call(),
            coingecko.simple.price({ ids: id, vs_currencies: "usd" })
        ]);
        let mmTokenPrice = pairData.data.pair.token0Price;
        let price = response.data[id].usd;

        let result = v1.times(mmTokenPrice).div(new BigNumber(poolInfo.amount).div(10 ** decimals).times(price));
        console.log(result.toString());
        return result;
    }
}

export async function computeFarmLocked(config) {
    let masterchefContract = masterchef();
    if (config.type === "MM") {
        let [poolInfo, price] = await Promise.all([
            masterchefContract.methods.poolInfo(config.pid).call(),
            coingecko.simple.price({ ids: "dai", vs_currencies: "usd" })
        ]);
        let erc20Contract = erc20(poolInfo.lpToken);
        let decimals = await erc20Contract.methods.decimals().call();
        console.log(poolInfo, "poolInfo");
        return new BigNumber(poolInfo.amount).div(10 ** decimals).times(price.data["dai"].usd);
    } else if (config.type === "LP" || config.type === "SUSHILP") {
        let [poolInfo] = await Promise.all([
            masterchefContract.methods.poolInfo(config.pid).call(),
        ]);
        let erc20Contract = erc20(poolInfo.lpToken);
        let [pairDayData, totalSupply] = await Promise.all([
            queryPairDayData(config.pairAddress || poolInfo.lpToken, config.type === "SUSHILP"),
            erc20Contract.methods.totalSupply().call()
        ]);
        let reserveusd = pairDayData.data.pairDayDatas[0].reserveUSD;
        return new BigNumber(poolInfo.amount).div(totalSupply).times(reserveusd);
    } else if (config.type === "MLP") {

        let vault = GLOBAL_CONFIG.vaults.filter(v => v.id === config.vaultId)[0];
        let erc20Contract = erc20(config.pairAddress);
        let [pairDayData, totalSupply, balance] = await Promise.all([
            queryPairDayData(config.pairAddress),
            erc20Contract.methods.totalSupply().call(),
            mmVault(vault.address).methods.balance().call()
        ]);
        let reserveusd = pairDayData.data.pairDayDatas[0].reserveUSD;
        return new BigNumber(balance).div(totalSupply).times(reserveusd);

    } else if (config.type === "CRV") {
        let [poolInfo, priceResponse] = await Promise.all([
            masterchefContract.methods.poolInfo(config.pid).call(),
            coingecko.simple.price({ ids: config.coinQueryId, vs_currencies: "usd" })
        ]);
        let erc20Contract = erc20(poolInfo.lpToken);
        let decimals = await erc20Contract.methods.decimals().call();
        let price = priceResponse.data[config.coinQueryId].usd;
        console.log("FARM LOCKED", config, poolInfo.amount, new BigNumber(poolInfo.amount).div(10 ** decimals).times(price).toString());
        return new BigNumber(poolInfo.amount).div(10 ** decimals).times(price);
    }
}

async function fetchVaultLockedBalance(config) {
    let vault = mmVault(config.address);

    let valueCoinId = config.apyConfig.valueCoinQueryId || config.apyConfig.coinQueryId;

    let [balance, decimals, priceResponse] = await Promise.all([
        vault.methods.balance().call(),
        vault.methods.decimals().call(),
        coingecko.simple.price({ ids: valueCoinId, vs_currencies: "usd" }),
    ]);

    let vl = new BigNumber(balance).div(10 ** decimals).times(priceResponse.data[valueCoinId].usd);
    console.log("VAULT LOCKED", valueCoinId, config.token, balance, vl.toString());

    return vl;
}

export async function fetchVaultsTotalLocked() {

    let balances = await Promise.all(config.vaults.map(fetchVaultLockedBalance));
    console.log(balances, "balances");

    return sum(balances);
}
