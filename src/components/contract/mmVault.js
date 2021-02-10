import { getWeb3 } from "../../mushroomsStore";
import config from "../mushroom/config";
import { hook } from "./contractHook";

export default function (address, uni) {
    let web3 = getWeb3();
    let contract = new web3.eth.Contract(uni ? require("./uni-vault-abi.json") : require("./mmVault.abi.v2.json"), address || config.mmVaultAddress);
    hook(contract);
    return contract;
}