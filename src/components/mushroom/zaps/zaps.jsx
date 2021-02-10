import React, { Component, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import "./zaps.css";
import Connector from "../connector/connector";
import config from "../config";
import { Box, Button, createMuiTheme, Grid, InputBase, MenuItem, Select, Slider, ThemeProvider } from "@material-ui/core";
import BigNumber from "bignumber.js";

import { red, purple, green, blue } from '@material-ui/core/colors';

import erc20 from "../../contract/erc20";
import { eventEmitter, getAccount, getWeb3 } from "../../../mushroomsStore";
import { useWeb3React } from "@web3-react/core";
import CardBackDrop from "../commons/CardBackDrop";
import { getGasPrice } from "../../contract/gas";
import { getTokenPrice } from "../../contract/apy";

const MushroomSlider = withStyles({
    root: {
        color: '#FF0000',
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundImage: `url(${process.env.PUBLIC_URL}/mushrooms/mushroom-slider.png)`,
        border: '2px solid currentColor',
        backgroundSize: "17px 17px",
        backgroundPosition: "center",
        backgroundColor: "rgba(240,240,240,0.9)",
        backgroundRepeat: "no-repeat",
        marginTop: -8,
        marginLeft: -12,
        border: "none",
        // boxShadow: "1px 1px 1px #888888",
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 8px)',
    },
    markLabel: {
        color: "#ff0000"
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);


const CoinSelect = withStyles((theme) => ({
    root: {
        width: "100%",
        'label + &': {
            marginTop: theme.spacing(3),
        }
    },
    ".MuiSelect-icon": {
        color: "#ff0000 "
    },
    input: {
        borderRadius: 4,
        width: "100%",
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #ff0000',
        fontSize: 16,
        borderWidth: 2,
        padding: '10px 26px 10px 12px',
        color: "#ff0000",
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            'SemplicitaPro',
        ].join(','),
        fontWeight: 600,
        '&:focus': {
            borderRadius: 4,
            borderColor: '#ff0000',
            boxShadow: '0 0 0 0.2rem rgba(255,0,0,.25)',
        },
    },
}))(InputBase);

const ColorButton = withStyles((theme) => ({
    root: {
        width: "100%"
    },
}))(Button);

const theme = createMuiTheme({
    palette: {
        primary: red,
    },
});


let amountTimer = 0;

function CoinValueInput({ token, onAmountChange, amountInput }) {
    return <div>
        <div className="value-input-wrapper">
            <div className="value-input-coin">{token.name}</div>
            <CoinSelect className="value-input" onChange={(e) => { onAmountChange(e.target.value, token) }} value={amountInput || ""} />
        </div>

    </div>
}

function CoinValueSilder({ percent, onPercentChange, token }) {
    return <div className="slider-wrapper">
        <MushroomSlider
            defaultValue={0}
            step={1}
            marks={[
                {
                    value: 0,
                    label: '0%',
                },
                {
                    value: 25,
                    label: '25%',
                },
                {
                    value: 50,
                    label: '50%',
                },
                {
                    value: 75,
                    label: '75%',
                },
                {
                    value: 100,
                    label: '100%',
                },
            ]}
            valueLabelDisplay="auto"
            value={percent || 0}
            onChange={(e, v) => { onPercentChange(v, token) }}
        />
    </div>
}

function Zaps(props) {

    let web3React = useWeb3React();

    function getAllPathFromList() {
        let result = [];
        let id = 0;
        for (let i = 0; i < config.zaps.path.length; i++) {
            const path = config.zaps.path[i];
            for (let i = 0; i < path.from.length; i++) {
                let from = path.from[i];
                if (!Array.isArray(from)) {
                    from = [from];
                }
                result.push({ id: id++, from: from.map(c => getToken(c)), path });
            }
        }
        return result;
    }
    let allPathFromList = getAllPathFromList();

    let [loading, setLoading] = useState(true);
    let [path, setPath] = useState(allPathFromList[0]);
    let [balance, setBalance] = useState({});

    let [amount, setAmount] = useState({});
    let [amountInput, setAmountInput] = useState({});
    let [percent, setPercent] = useState({});
    let [price, setPrice] = useState({});

    function getToken(name) {
        let result = config.zaps.coinList.filter(t => t.name === name)[0];
        return result;
    }

    async function onSwap() {
        if (!checkCanSwap()) {
            return;
        }
        let web3 = getWeb3();
        let account = getAccount();

        async function approve() {
            for (let i = 0; i < path.from.length; i++) {
                const from = path.from[i];
                let erc20Contract = erc20(from.address);
                let allowance = await erc20Contract.methods.allowance(account, path.path.funcAddress).call();
                if (amount[from.name].gt(allowance)) {
                    let all = await erc20Contract.methods.totalSupply().call();
                    await erc20Contract.methods.approve(path.path.funcAddress, all).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
                }
            }
        }
        console.log(path);
        let realPath = path.path;
        if (realPath.type === "deposit") {
            let fun = web3.eth.sendTransaction;
            await fun({ from: getAccount(), to: realPath.funcAddress, value: amount["ETH"].toFormat(), gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        } else if (realPath.type === "LP") {
            await approve();
            let contract = new web3.eth.Contract(realPath.abi, realPath.funcAddress);
            await contract.methods[realPath.func](path.from[0].address, path.from[1].address,
                amount[path.from[0].name].toFormat(), amount[path.from[1].name].toFormat(),
                0, 0, getAccount(), parseInt(new Date().getTime() + 3600 * 1000)
            ).send({ from: getAccount(), gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        } else if (realPath.type === "addLiquidity") {
            await approve();
            let contract = new web3.eth.Contract(realPath.abi, realPath.funcAddress);
            let args = realPath.addLiquidityMap.map(key => {
                return (amount[key] || new BigNumber(0)).toFormat()
            })
            await contract.methods[realPath.func](args, 0).send({ from: getAccount(), gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        }
        loadingBalance(path);
    }

    function onPercentChange(v, token) {
        percent[token.name] = v;
        setPercent({ ...percent });
        clearTimeout(amountTimer);
        amountTimer = setTimeout(() => {
            amount[token.name] = balance[token.name].times(v / 100).integerValue()
            amountInput[token.name] = balance[token.name].times(v / 100).integerValue().div(10 ** token.decimal).toFormat();
            setAmount({ ...amount })
            setAmountInput({ ...amountInput });
            // setAmountInput()

            if (path.path.type === "LP") {
                syncOtherLpToken(amount[token.name], token);
            }
        }, 200);
    }

    function onAmountChange(value, token) {
        amountInput[token.name] = value;
        setAmountInput({ ...amountInput });
        let amountBN = new BigNumber(value).times(10 ** token.decimal);
        if (!amountBN.isNaN()) {
            amount[token.name] = amountBN;
            setAmount({ ...amount });
            percent[token.name] = amountBN.div(balance[token.name]).times(100).integerValue().toNumber();
            setPercent({ ...percent });
            if (path.path.type === "LP") {
                syncOtherLpToken(amountBN, token);
            }
        }
    }


    function syncOtherLpToken(amountBN, token) {
        let tokenValue = amountBN.div(10 ** token.decimal).times(price[token.name]);
        for (let i = 0; i < path.from.length; i++) {
            const from = path.from[i];
            if (from.name !== token.name) {
                let sameAmount = tokenValue.div(price[from.name]).times(10 ** from.decimal).integerValue();
                amount[from.name] = sameAmount;
                amountInput[from.name] = sameAmount.div(10 ** from.decimal).toFormat();
                percent[from.name] = sameAmount.div(balance[from.name]).times(100).integerValue().toNumber();
                setAmount({ ...amount });
                setAmountInput({ ...amountInput });
                setPercent({ ...percent });
            }
        }
    }

    async function loadingBalance(path) {
        console.log("start loding", path);
        setLoading(true);
        setBalance({});

        let account = getAccount();
        let balanceObj = {};
        let amountObj = {};
        let amountInputObj = {};
        let percentObj = {};
        for (let i = 0; i < path.from.length; i++) {
            const token = path.from[i];
            if (token.address === "0x0") {
                let web3 = getWeb3();
                let balance = await web3.eth.getBalance(account);
                balanceObj[token.name] = new BigNumber(balance);
            } else {
                let erc20Contract = erc20(token.address);
                let balance = await erc20Contract.methods.balanceOf(account).call();
                balanceObj[token.name] = new BigNumber(balance);;
            }
            amountInputObj[token.name] = "";
            percentObj[token.name] = 0;
            amountObj[token.name] = new BigNumber(0);
        }
        if (path.path.type === "LP") {
            let priceObj = {};
            for (let i = 0; i < path.from.length; i++) {
                const token = path.from[i];
                let price = await getTokenPrice(token.tokenQueryId);
                priceObj[token.name] = price;
            }
            setPrice(priceObj);
        }
        setBalance(balanceObj);
        setAmountInput(amountInputObj);
        setAmount(amountObj);
        setPercent(percentObj);
        setLoading(false);
    }

    function onPathChange(e) {
        let newPath = allPathFromList.filter(p => p.id == e.target.value)[0];
        setPath(newPath);
        loadingBalance(newPath);
    }

    function checkCanSwap() {
        for (let i = 0; i < path.from.length; i++) {
            const from = path.from[i];
            if (new BigNumber(amountInput[from.name]).isNaN()) {
                return false;
            }
            if (amount[from.name].gt(balance[from.name])) {
                return false;
            }
        }
        return true;
    }

    let [connect, setConnect] = useState(web3React.active);
    useEffect(() => {
        let func = () => {
            setConnect(true);
            if (getAccount()) {
                loadingBalance(path);
            }
        };
        let accountEvent = () => {
            console.log("ACCOUNT_CHANGE!!!!1", connect);
            if (getWeb3() && getAccount()) {
                loadingBalance(path);
            }
        };
        if (connect && getAccount()) {
            loadingBalance(path);
        }
        eventEmitter.addListener("ON_CONNECTED", func);
        eventEmitter.addListener("ACCOUNT_CHANGE", accountEvent);
        return () => {
            eventEmitter.removeListener("ON_CONNECTED", func);
            eventEmitter.removeListener("ACCOUNT_CHANGE", accountEvent);
        }
    }, []);
    if (!connect) {
        return <>
            <div>Please Connect wallet first.</div>
        </>
    }

    let sortedPathFrom = path.from.sort((a, b) => {
        if (path.path.type === "LP" && balance[a.name] && balance[b.name]) {
            return balance[a.name].div(10 ** a.decimal).times(price[a.name]).minus(balance[b.name].div(10 ** b.decimal).times(price[b.name])).toNumber();
        } else {
            return 0;
        }
    });

    return <>
        <Grid style={{ marginTop: 30 }} container justify="center">

            <Grid>
                <Box fontSize={44} color="#e40000">Zaps</Box>
                <Box fontSize={18} color="#e40000"></Box>
                <Box bgcolor="white" borderRadius={4} width={600} boxShadow={1} style={{ position: "relative" }} marginBottom={1}>

                    <CardBackDrop open={loading} />
                    <div className="zap-container">
                        <div className="i-have-and-balance">
                            <div className="i-have">I HAVE</div>
                            <div className="balance">Balance:{Object.keys(balance).map((k, i) => <span>{i > 0 ? " , " : ""} {balance[k].div(10 ** getToken(k).decimal).decimalPlaces(8).toFormat()} {k}</span>)}</div>
                        </div>
                        <Select onChange={onPathChange} value={path.id} input={<CoinSelect />}>
                            {
                                allPathFromList.map(fromObj => <MenuItem className="coin-option" selected={fromObj.id === path.id} value={fromObj.id}>
                                    {fromObj.from.map((token, i) => <>
                                        {i > 0 && <span style={{ marginLeft: 10, marginRight: 10 }}> + </span>}
                                        <img className="option-icon" src={`${process.env.PUBLIC_URL}/mushrooms/coinicon/${token.name}.png`} />
                                        {token.name}
                                    </>)}
                                </MenuItem>)
                            }
                        </Select>

                        <div className="send-amount">
                            SEND AMOUNT
                        </div>
                        {sortedPathFrom.map((f, i) => <CoinValueInput
                            onAmountChange={onAmountChange} token={f}
                            amount={amount[f.name]}
                            amountInput={amountInput[f.name]} hideSlider={i > 0}
                        />)}

                        {sortedPathFrom.map((f, i) => <>{i === 0 && <CoinValueSilder
                            onPercentChange={onPercentChange} percent={percent[f.name]} token={f} />}
                        </>)}
                    </div>
                    <div className="split-line"></div>
                    <div className="zap-container">
                        <div className="i-will-receive">
                            I WILL RECEIVE
                        </div>

                        <Select input={<CoinSelect />} value={path.id}>
                            <MenuItem className="coin-option" selected={true} value={path.id}>
                                <img className="option-icon" src={`${process.env.PUBLIC_URL}/mushrooms/coinicon/${getToken(path.path.to).name}.png`} />
                                {getToken(path.path.to).name}
                            </MenuItem>
                        </Select>

                        <div className="btn-wrapper">
                            <ThemeProvider theme={theme}>
                                <ColorButton onClick={onSwap} color="primary"
                                    disabled={!checkCanSwap()}
                                    // disabled={amount.gt(balance) || new BigNumber(amountInput).isNaN()}
                                    variant="contained">SWAP</ColorButton>
                            </ThemeProvider>
                        </div>
                    </div>
                </Box>
            </Grid>
        </Grid>
    </>
};

export default withRouter(Zaps);