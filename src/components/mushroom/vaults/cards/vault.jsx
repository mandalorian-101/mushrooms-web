import { Card, CardContent, Grid, Box, IconButton, Button, ModalManager, Snackbar } from "@material-ui/core";
// import { Alert } from "@material-ui/lab";
import React, { Component, useEffect, useState } from "react";
import { useTranslation, initReactI18next, withNamespaces } from "react-i18next";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "bignumber.js";

import { SnackbarProvider, useSnackbar } from 'notistack';

import "./vault.css";
import mmVault from "../../../contract/mmVault";
import { eventEmitter, getAccount, getChainId, getSafeAppsSDK, getWeb3, isApp } from "../../../../mushroomsStore";
import erc20 from "../../../contract/erc20";
import { getGasPrice } from "../../../contract/gas";
import Coingecko from "coingecko-api";
import { computeVaultApy, getApyRate, getApys } from "../../../contract/apy";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";
import { getDigest, getDOMAIN_SEPARATOR, getSignatureParameters } from "../../../contract/sign";

function Jars({ t, config, defaultClose }) {
    const [open, setOpen] = useState(!defaultClose);
    const [balance, setBalance] = useState(new BigNumber(0));
    const [amountToSend, setAmountToSend] = useState(0);
    const [amountToWithdraw, setAmountToWithdraw] = useState(0);
    const [decimals, setDecimals] = useState(0);
    const [tokenAddress, setTokenAddress] = useState("");
    const [deposited, setDeposited] = useState(new BigNumber(0));
    const [staked, setStaked] = useState("-");
    const [apy, setApy] = useState(new BigNumber(0));
    const [value, setValue] = useState(new BigNumber(0));
    const [nextWithdrawDate, setNextWithdrawDate] = useState(0);
    const [nextLockDate, setNextLockDate] = useState(0);
    const [alertInfo, setAlertInfo] = useState("");

    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    function openAlert(info) {
        enqueueSnackbar(info);
        // setAlertInfo(info);
        // setSnackBarOpen(true);
    }

    function onSnackBarClose() {
        setSnackBarOpen(false);
    }

    function toggleOpen() {
        setOpen(!open);
    }

    let loadSuccess = !!tokenAddress;

    async function depositPremit() {
        if (!loadSuccess) {
            return;
        }
        let account = getAccount();
        let web3 = getWeb3();
        let contract = mmVault(config.address, config.type === "mph");
        let erc20Contract = erc20(tokenAddress);
        let tokenPermitContract = mmVault(tokenAddress);

        let amount = new BigNumber(amountToSend).times(10 ** decimals);
        let allowance = await erc20Contract.methods.allowance(account, config.address).call();
        if (amount.gt(allowance)) {
            let [PERMIT_TYPEHASH, DOMAIN_TYPEHASH, nonce, totalSupply] = await Promise.all([
                tokenPermitContract.methods.PERMIT_TYPEHASH().call(),
                tokenPermitContract.methods.DOMAIN_TYPEHASH().call(),
                tokenPermitContract.methods.nonces(account).call(),
                erc20Contract.methods.totalSupply().call()
            ]);

            let DOMAIN_SEPARATOR = "0x28e9a6a663fbec82798f959fbf7b0805000a2aa21154d62a24be5f2a8716bf81"//getDOMAIN_SEPARATOR(DOMAIN_TYPEHASH, "Uniswap", tokenAddress);

            console.log("REAL DOMAIN_SEPARATOR", DOMAIN_SEPARATOR);
            let expiry = new Date().getTime() + 365 * 24 * 3600 * 1000;
            expiry = 100000000000000;
            let digest = getDigest(DOMAIN_SEPARATOR,
                { holder: account, spender: config.address }, totalSupply,
                nonce, expiry, PERMIT_TYPEHASH
            );
            let sign = await web3.eth.sign(digest, account);
            let { v, r, s } = getSignatureParameters(web3, sign);
            console.log({ v, r, s });
            await contract.methods
                // .permit(account, config.address, totalSupply, expiry, v, r, s)
                .deposit(totalSupply, amount.toFormat(), expiry, v, r, s)
                .send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        } else {
            console.log("start deposit", amount, amount.toFormat());
            await contract.methods.deposit(amount.toFormat()).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        }
    }

    async function deposit() {
        if (config.permit) {
            await depositPremit();
            return;
        }
        if (!loadSuccess) {
            return;
        }
        let account = getAccount();
        let web3 = getWeb3();
        let contract = mmVault(config.address, config.type === "mph");
        let erc20Contract = erc20(tokenAddress);
        let amount = new BigNumber(amountToSend).times(10 ** decimals);
        let allowance = await erc20Contract.methods.allowance(account, config.address).call();
        if (amount.gt(allowance)) {
            let all = await erc20Contract.methods.totalSupply().call();
            if (isApp()) {
                let sdk = getSafeAppsSDK();
                let txs = [{
                    to: erc20Contract._address,
                    value: 0,
                    data: erc20Contract.methods.approve(config.address, all).encodeABI(),
                }, {
                    to: contract._address,
                    value: 0,
                    data: contract.methods.deposit(amount.toFormat()).encodeABI(),
                }];
                const result = await sdk.txs.send({ txs, params: {} });
                console.log(result);
                return;
            }
            await erc20Contract.methods.approve(config.address, all).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        }
        console.log("start deposit", amount, amount.toFormat());
        await contract.methods.deposit(amount.toFormat()).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
    }

    async function withdraw() {
        if (!loadSuccess) {
            return;
        }
        let web3 = getWeb3();
        let contract = mmVault(config.address, config.type === "mph");
        let account = getAccount();
        // let erc20Contract = erc20(tokenAddress);

        let amount = new BigNumber(amountToWithdraw).times(10 ** decimals);
        if (config.type === "mph") {

            if (!(new Date().getTime() > nextWithdrawDate && new Date().getTime() < nextLockDate)) {
                let withdrawableWithoutLock = await contract.methods.withdrawableWithoutLock(amount.toFormat()).call();
                if (!withdrawableWithoutLock) {
                    openAlert(`next unlock epoch:${new Date(nextWithdrawDate).toLocaleString()}`);
                    return;
                }
            }

        }

        console.log("start withdraw", amount, amount.toFormat());
        // let amount = (amountToWithdraw * 10 ** decimals).toString();
        // await erc20Contract.methods.approve(config.address, amount).send({ from:account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        await contract.methods.withdraw(amount.toFormat()).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
    }

    async function refreshData() {
        console.log("fetch balance", config);
        let account = getAccount();
        let contract = mmVault(config.address, config.type === "mph");
        let token = await contract.methods.token().call();
        let erc20Contract = erc20(token);
        let [balance, decimals, deposited, apy, totalSupply, share, vaultBalance] = await Promise.all([
            erc20Contract.methods.balanceOf(account).call(),
            erc20Contract.methods.decimals().call(),
            contract.methods.balanceOf(account).call(),
            computeVaultApy(config),
            contract.methods.totalSupply().call(),
            contract.methods.balanceOf(account).call(),
            contract.methods.balance().call()
        ]);

        setDecimals(decimals);
        balance = new BigNumber(balance).div(10 ** decimals);
        deposited = new BigNumber(deposited).div(10 ** decimals);
        setBalance(balance);
        setTokenAddress(token);
        setDeposited(deposited);
        setApy(new BigNumber(apy).times(100));
        setValue(new BigNumber(vaultBalance).times(share).div(totalSupply).div(10 ** decimals));

        if (config.type === "mph") {
            let [earnedTimestamp, getLockCycleEndTime, withdrawWindow, lockWindow, lockStartTime] = await Promise.all([
                contract.methods.earnedTimestamp().call(),
                contract.methods.getLockCycleEndTime().call(),
                contract.methods.withdrawWindow().call(),
                contract.methods.lockWindow().call(),
                contract.methods.lockStartTime().call()
            ])

            let nextOpen, nextStart;
            if (earnedTimestamp === 0) {
                nextOpen = parseInt(getLockCycleEndTime);
                nextStart = parseInt(lockStartTime) + parseInt(withdrawWindow);
            } else {
                nextOpen = parseInt(lockStartTime) + parseInt(lockWindow);
                nextStart = parseInt(getLockCycleEndTime);
            }
            setNextWithdrawDate(nextOpen * 1000);
            setNextLockDate(nextStart * 1000);
        }

    }

    useEffect(() => {
        refreshData();
        let timer = setInterval(refreshData, 30000);
        eventEmitter.addListener("ACCOUNT_CHANGE", refreshData);
        return () => {
            clearInterval(timer);
            eventEmitter.removeListener("ACCOUNT_CHANGE", refreshData);
        }
    }, []);

    return <>
        <Box bgcolor="white" borderRadius={12} boxShadow={1} style={{ position: "relative" }} marginBottom={1}>


            <Snackbar open={snackBarOpen} message={alertInfo} autoHideDuration={6000} onClose={onSnackBarClose}>

            </Snackbar>


            <CardBackDrop open={apy.toNumber() === 0} />
            <IconButton
                style={{ color: "#ff0000", zIndex: 10000000 }}
                className={`open-icon ${open ? "open" : "close"}`}
                onClick={toggleOpen}
            >
                <ExpandMoreIcon />
            </IconButton>

            <CardContent>
                <Grid container>
                    <Grid item md={2}>
                        <div className="card-coin">
                            <img src={process.env.PUBLIC_URL + `/mushrooms/vaulticon/${config.icon}.png`} />
                            <Box color="#ff0000">{config.name}</Box>
                            <Box color="#ff7a7a" target="_blank" component="a" href={`https://etherscan.io/token/${tokenAddress}`}>{config.token}</Box>
                        </div>
                    </Grid>
                    <Grid item md={10} container>
                        <Grid item md={3}>
                            <Box color="#ff0000"><Roller component="span">{apy.dp(2).toString()}</Roller>%</Box>
                            <Box color="#ff7a7a">{t("Vaults.APY")}</Box>
                        </Grid>
                        <Grid item md={3}>
                            <Roller color="#ff0000" >{balance.dp(8, BigNumber.ROUND_DOWN).toString()}</Roller>
                            <Box color="#ff7a7a">{t("Vaults.Balance")}</Box>
                        </Grid>

                        <Grid item md={3}>
                            <Roller color="#ff0000">{deposited.dp(8, BigNumber.ROUND_DOWN).toString()}</Roller>
                            <Box color="#ff7a7a">{t("Vaults.Deposited")}</Box>
                        </Grid>
                        <Grid item md={3}>
                            <Roller color="#ff0000">{value.dp(8, BigNumber.ROUND_DOWN).toString()}</Roller>
                            <Box color="#ff7a7a">{t("Vaults.Value")}</Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container spacing={3} style={{ marginTop: 20 }} style={{ display: `${open ? "" : "none"}` }}>
                    <Grid item md="6" style={{ paddingTop: 20 }}>
                        <div>
                            <Box component="span" color="#ff7a7a">{t("Vaults.Balance")}: &nbsp;</Box>
                            <Box component="span" fontWeight="bold" color="#ff0000">{balance.toFixed(8, BigNumber.ROUND_DOWN)}</Box>
                            <Box component="span" color="#15b000" style={{ float: "right" }} onClick={e => { setAmountToSend(balance.toFixed(8, BigNumber.ROUND_DOWN)) }} className="max-btn">{t("Vaults.Max")}</Box>
                        </div>
                        <div>
                            <input className="coin-value-input" value={amountToSend} onChange={e => { setAmountToSend(e.target.value) }} />
                        </div>
                        <div className="btn-container">
                            <Button size="small" variant="contained" className={`card-btn ${loadSuccess ? "enable" : "disable"}`} onClick={deposit} disabled={!loadSuccess}>{t("Vaults.Deposit")}</Button>
                        </div>
                    </Grid>
                    <Grid item md="6" style={{ paddingTop: 20 }}>
                        <div>
                            <Box component="span" color="#ff7a7a">{t("Vaults.Deposited")}: &nbsp;</Box>
                            <Box component="span" fontWeight="bold" color="#ff0000">{deposited.toFixed(8, BigNumber.ROUND_DOWN)}</Box>
                            <Box component="span" color="#15b000" style={{ float: "right" }} onClick={e => { setAmountToWithdraw(deposited.toFixed(8, BigNumber.ROUND_DOWN)) }} className="max-btn">{t("Vaults.Max")}</Box>
                        </div>
                        <div>
                            <input className="coin-value-input" value={amountToWithdraw} onChange={e => { setAmountToWithdraw(e.target.value) }} />
                        </div>
                        <div className="btn-container">
                            <Button size="small" variant="contained" className={`card-btn ${loadSuccess ? "enable" : "disable"}`} onClick={withdraw} disabled={!loadSuccess}>{t("Vaults.Withdraw")}</Button>
                        </div>
                        <Box textAlign="center" paddingTop="10" color="#ff0000" fontSize={14} marginTop={1}>
                            0.2% withdrawal fee
                        </Box>
                        {
                            nextWithdrawDate !== 0 &&
                            <Box textAlign="center" paddingTop="10" color="#ff0000" fontSize={14} marginTop={1}>
                                {`next unlock epoch:${new Date(nextWithdrawDate).toLocaleString()}`}
                            </Box>
                        }
                        {
                            nextWithdrawDate !== 0 &&
                            <Box textAlign="center" paddingTop="10" color="#ff0000" fontSize={14} marginTop={1}>
                                {`next lock epoch:${new Date(nextLockDate).toLocaleString()}`}
                            </Box>
                        }
                    </Grid>
                </Grid>

                {config.flash && <img src={process.env.PUBLIC_URL + "/mushrooms/vaulticon/flash.png"} className="flash-icon" />}
            </CardContent>
        </Box>
    </>
}

export default withNamespaces()(Jars);