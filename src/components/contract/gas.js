let lastGas = 0;

export async function getGasPrice() {
    try {
        const url = 'https://gasprice.poa.network/'
        const res = await fetch(url);
        const priceJSON = await res.json();
        if (priceJSON) {
            lastGas = priceJSON.fast.toFixed(0);
        }
        return lastGas;
    } catch (e) {
        console.log(e)
        return lastGas;
    }
};