import { defaultAbiCoder, solidityPack, toUtf8Bytes, keccak256 } from "ethers/utils"

export function getDigest(DOMAIN_SEPARATOR, approve, amount, nonce, expiry, permitTypeHash) {
    console.log("DOMAIN_SEPARATOR", DOMAIN_SEPARATOR);
    return keccak256(
        solidityPack(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
                '0x19',
                '0x01',
                DOMAIN_SEPARATOR,
                keccak256(
                    defaultAbiCoder.encode(
                        ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
                        [permitTypeHash, approve.holder, approve.spender, amount, nonce, expiry]
                    )
                )
            ]
        )
    )
}

export function getDOMAIN_SEPARATOR(DOMAIN_TYPEHASH, name, address) {
    return keccak256(
        solidityPack(
            ['bytes32', 'bytes32', 'bytes1', 'address'],
            [
                DOMAIN_TYPEHASH,
                keccak256(
                    solidityPack(
                        ["bytes32"],
                        [name]
                    )
                ), 1, address
            ]
        )
    )
}




const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
];

const permitType = [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
];




export function signPermit(name, verifyingContract, chainId, message, web3, account) {

    let domainDataERC20 = {
        version: "1",
        name,
        verifyingContract: verifyingContract,
        chainId: chainId
    };

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            Permit: permitType
        },
        domain: domainDataERC20,
        primaryType: "Permit",
        message: message
    };


    const sigString = JSON.stringify(dataToSign);
    console.log(dataToSign);


    web3.currentProvider.send(
        {
            jsonrpc: "2.0",
            id: 999999999999,
            method: "eth_signTypedData_v4",
            params: [account, sigString]
        },
        function (error, response) {
            console.log(response);
            let { r, s, v } = getSignatureParameters(response.result);
        }
    );



}


export function getSignatureParameters(web3, signature) {
    if (!web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};