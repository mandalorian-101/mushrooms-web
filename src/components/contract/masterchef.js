import { getWeb3 } from "../../mushroomsStore";
import config from "../mushroom/config";
import { hook } from "./contractHook";

export default function (address) {

    let web3 = getWeb3();
    let contract = new web3.eth.Contract(require("./masterchef.abi.json"), config.masterchefAddress);
    hook(contract);
    return contract;
}