import Web3 from 'web3';

import { EventEmitter } from 'events';
import { getGasPrice } from './components/contract/gas';

export let eventEmitter = new EventEmitter();

let web3 = null;

let chainId = -1;

let safeAppsSDK;
export function setSafeAppsSDK(sdk){
    safeAppsSDK = sdk;
}

export async function initStore(_web3, _chainId, _account) {
    if (!web3) {
        web3 = _web3;
        console.log('web3', web3);
        console.log("init web3", _chainId);
        if (!_chainId) {
            _chainId = await web3.eth.getChainId();
        }
        blockHighTimer();
        chainId = _chainId;
        account = _account;
        eventEmitter.emit("ON_CONNECTED");
        eventEmitter.emit("ACCOUNT_CHANGE", account);
        window.ethereum.on('chainChanged', async function () {
            // refresh on chain changed
            window.location.reload();
        });
    }
}

async function blockHighTimer() {
    eventEmitter.emit("BLOCK_HIGH_CHANGE", await web3.eth.getBlockNumber());
    setInterval(async () => {
        eventEmitter.emit("BLOCK_HIGH_CHANGE", await web3.eth.getBlockNumber());
    }, 5000);
}

async function updateGasPrice() {
    let gas = await getGasPrice();
    eventEmitter.emit("GAS_UPDATE", gas);
}

setInterval(updateGasPrice, 30000);
updateGasPrice();

export function getWeb3() {
    return web3;
}

let account = "";
export function refreshAccount(_account) {
    if (account != _account) {
        console.log("ACCOUNT_CHANGE", _account, account);
        account = _account;
        eventEmitter.emit("ACCOUNT_CHANGE", account);
    }
}


export function getAccount() {
    return account;
}

export function getChainId() {
    return chainId;
}

export function isApp() {
    return window && window.top !== window.self;
}

export function getSafeAppsSDK(){
    return safeAppsSDK;
}