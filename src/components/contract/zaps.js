
import { getWeb3 } from "../../mushroomsStore";
import config from "../mushroom/config";
import { hook } from "./contractHook";
let abi = [
    {
        "inputs": [],
        "name": "ethZap",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_inToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_inAmount",
                "type": "uint256"
            }
        ],
        "name": "tokenZap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "weth9",
        "outputs": [
            {
                "internalType": "contract WETH9",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export default function () {
    let web3 = getWeb3();
    let contract = new web3.eth.Contract(abi, config.zapsAddress);
    hook(contract);
    return contract;
}