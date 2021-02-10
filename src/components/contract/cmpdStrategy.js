import { getWeb3 } from "../../mushroomsStore";
import { hook } from "./contractHook";

export default function (address) {
    let web3 = getWeb3();
    let contract = new web3.eth.Contract(require("./strategy-cmpd-dai.abi.json"), address);
    hook(contract);
    return contract;
}