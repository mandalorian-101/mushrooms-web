import { isApp, getSafeAppsSDK } from "../../mushroomsStore";

function hookSend(methodObj, contract) {
    let oldFunc = methodObj.send;

    methodObj.send = async function (params) {
        // let result = oldFunc.apply(methodObj, arguments);
        let sdk = getSafeAppsSDK();

        let txs = [{
            to: contract._address,
            value: 0,
            data: methodObj.encodeABI(),
        }];
        let sendParams = {
            // safeTxGas: 500000
        }
        // debugger;
        const result = await sdk.txs.send({ txs, params: sendParams });
        return result;
        // return result;
    }
}

export function hook(contract) {
    if (isApp()) {
        for (const key in contract.methods) {
            let oldMethod = contract.methods[key];
            contract.methods[key] = function () {
                // debugger;
                let ret = oldMethod.apply(oldMethod, arguments);
                hookSend(ret, contract);
                return ret;
            }
        }
    }
}