import { Card, CardContent, Grid, Box, IconButton, Button, Tooltip } from "@material-ui/core";
import React, { Component, useEffect, useState } from "react";
import { useTranslation, initReactI18next, withNamespaces } from "react-i18next";
import { withRouter } from "react-router-dom";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { BigNumber } from "bignumber.js";
import "./farm.css";
import masterchef from "../../../contract/masterchef";
import mmVault from "../../../contract/mmVault";
import erc20 from "../../../contract/erc20";
import { eventEmitter, getAccount, getWeb3, isApp, getSafeAppsSDK } from "../../../../mushroomsStore";
import { getGasPrice } from "../../../contract/gas";
import { computeFarmApy } from "../../../contract/apy";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";

function Farm({ t, defaultOpen, config }) {
    const [open, setOpen] = useState(!!defaultOpen && !config.external);
    const [balance, setBalance] = useState(new BigNumber(0));
    const [decimals, setDecimals] = useState(0);
    const [amountToStake, setAmountToStake] = useState(0);
    const [amountToUnstake, setAmountToUnstake] = useState(0);
    const [apy, setApy] = useState(new BigNumber(0));
    const [apys, setApys] = useState([new BigNumber(0), new BigNumber(0)]);
    const [staked, setStaked] = useState(new BigNumber(0));
    const [tokenAddress, setTokenAddress] = useState("");
    const [earned, setEarned] = useState(new BigNumber(0));
    const [earnedPerBlock, setEarnedPerblock] = useState(new BigNumber(0));
    const [poolInfo, setPoolInfo] = useState({});

    let loadSuccess = !!tokenAddress;

    function toggleOpen() {
        setOpen(!open);
    }


    async function onStake() {
        if (!loadSuccess) {
            return;
        }
        let account = getAccount();
        let masterchefContract = masterchef();
        let poolInfo = await masterchefContract.methods.poolInfo(config.pid).call();
        let erc20Contract = erc20(poolInfo.lpToken);

        let web3 = getWeb3();
        let amount = new BigNumber(amountToStake).times(10 ** decimals);
        let allowance = await erc20Contract.methods.allowance(account, masterchefContract._address).call();
        if (amount.gt(allowance)) {
            let all = await erc20Contract.methods.totalSupply().call();
            if (isApp()) {
                let sdk = getSafeAppsSDK();
                let txs = [{
                    to: erc20Contract._address,
                    value: 0,
                    data: erc20Contract.methods.approve(masterchefContract._address, all).encodeABI(),
                }, {
                    to: masterchefContract._address,
                    value: 0,
                    data: masterchefContract.methods.deposit(config.pid, amount.toFormat()).encodeABI(),
                }];
                const result = await sdk.txs.send({ txs, params: {} });
                console.log(result);
                return;
            }
            await erc20Contract.methods.approve(masterchefContract._address, all).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });
        }
        await masterchefContract.methods.deposit(config.pid, amount.toFormat()).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });;
    }

    async function onHarvest() {
        if (!loadSuccess) {
            return;
        }
        let web3 = getWeb3();
        let masterchefContract = masterchef();
        let account = getAccount();
        await masterchefContract.methods.withdraw(config.pid, 0).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });;
    }

    async function onUnstake() {
        if (!loadSuccess) {
            return;
        }
        let masterchefContract = masterchef();
        let web3 = getWeb3();
        let amount = new BigNumber(amountToUnstake).times(10 ** decimals);
        let account = getAccount();
        await masterchefContract.methods.withdraw(config.pid, amount.toFormat()).send({ from: account, gasPrice: web3.utils.toWei(await getGasPrice(), 'gwei') });;
    }

    async function refreshData() {
        let masterchefContract = masterchef();

        console.log("refreshData", config);
        let account = getAccount();
        console.log("refreshData account", account);
        // poolInfo.allocPoint / totalAllocPoint * mmPerBlock * 5760 * 365 / amount
        // console.log(masterchefContract, "masterchefContract");

        let [userInfo, pendingMM, apy, poolInfo, mmPerBlock, totalAllocPoint] = await Promise.all([
            masterchefContract.methods.userInfo(config.pid, account).call(),
            masterchefContract.methods.pendingMM(config.pid, account).call(),
            computeFarmApy(config),
            masterchefContract.methods.poolInfo(config.pid).call(),
            masterchefContract.methods.mmPerBlock().call(),
            masterchefContract.methods.totalAllocPoint().call()
        ]);

        let erc20Contract = erc20(poolInfo.lpToken);

        let [balance, decimals] = await Promise.all([
            erc20Contract.methods.balanceOf(account).call(),
            erc20Contract.methods.decimals().call()
        ])

        let staked = new BigNumber(userInfo.amount).div(10 ** decimals);

        setStaked(staked);
        setDecimals(decimals);
        balance = new BigNumber(balance).div(10 ** decimals);
        setBalance(balance);
        let earned = new BigNumber(pendingMM).div(10 ** 18);
        setEarned(earned);
        setApy(new BigNumber(apy));
        setTokenAddress(poolInfo.lpToken);

        setPoolInfo(poolInfo);
        let sharePer = staked.div(new BigNumber(poolInfo.amount).div(10 ** decimals));
        let earnedPerBlock = new BigNumber(mmPerBlock).div(10 ** decimals).times(poolInfo.allocPoint).div(totalAllocPoint).times(sharePer);
        setEarnedPerblock(earnedPerBlock);
    }


    useEffect(() => {
        if (!config.external) {
            refreshData();

            let timer = setInterval(refreshData, 15000);

            eventEmitter.addListener("ACCOUNT_CHANGE", refreshData);
            return () => {
                clearInterval(timer);
                eventEmitter.removeListener("ACCOUNT_CHANGE", refreshData);
            }
        } else {

            (async () => {
                let apys = await computeFarmApy(config);
                setApys(apys);
            })();
        }
    }, []);

    let sharePer = staked.div(new BigNumber(poolInfo.amount).div(10 ** decimals)).times(100);

    return <Box bgcolor="white" borderRadius={12} boxShadow={1} style={{ position: "relative" }} marginBottom={1}>
        <CardBackDrop open={!loadSuccess && !config.external} />
        <IconButton
            style={{ color: "#ff0000", zIndex: 10000000 }}
            className={`open-icon ${open ? "open" : "close"}`}
            onClick={toggleOpen}
        >
            {!config.external && <ExpandMoreIcon />}
        </IconButton>

        <CardContent>
            {
                !config.external ? <Grid container>
                    <Grid item md={4}>
                        <div className="card-coin">
                            <img src={process.env.PUBLIC_URL + `/mushrooms/farmicon/${config.icon}.png`} />
                            <Box color="#ff0000">{config.farmName}</Box>
                            <Box color="#ff7a7a" component="a" target="_blank" href={`https://etherscan.io/address/${tokenAddress}`}>{config.name}</Box>
                        </div>
                    </Grid>
                    <Grid item md={8} container>
                        <Grid item md={3}>
                            <Box color="#ff0000"><Roller component="span">{apy.dp(2).toString()}</Roller>%</Box>
                            <Box color="#ff7a7a">{t("Farms.TotalAPY")}</Box>
                        </Grid>

                        <Grid item md={3}>
                            <Tooltip interactive enterDelay={1500} leaveDelay={200} title={`${earnedPerBlock.toFixed(8)}MM/Block \n\rShare%:${sharePer.toFixed(2)}% `}>
                                <div><Roller color="#ff0000" >{earned.dp(8, BigNumber.ROUND_DOWN).toString()}</Roller></div>
                            </Tooltip>
                            <Box color="#ff7a7a">{t("Farms.Earned")}</Box>
                        </Grid>

                        <Grid item md={3}>
                            <Roller color="#ff0000">{balance.dp(8, BigNumber.ROUND_DOWN).toString()}</Roller>
                            <Box color="#ff7a7a">{t("Farms.Balance")}</Box>
                        </Grid>

                        <Grid item md={3}>
                            <Roller color="#ff0000">{staked.dp(8, BigNumber.ROUND_DOWN).toString()}</Roller>
                            <Box color="#ff7a7a">{t("Farms.Staked")}</Box>
                        </Grid>

                        {/* <Grid item md={2}>
                        <Box color="#ff0000">12.21%</Box>
                        <Box color="#ff7a7a">{t("Farms.Value")}</Box>
                    </Grid> */}
                    </Grid>
                </Grid> : <Grid container>
                        <Grid item md={4}>
                            <div className="card-coin">
                                <img src={process.env.PUBLIC_URL + `/mushrooms/farmicon/${config.icon}.png`} />
                                <Box color="#ff7a7a" component="a" target="_blank" href={config.nameUrl}>{config.name}</Box>
                            </div>
                        </Grid>
                        <Grid item md={5} container>
                            <Grid item md={12}>
                                <Box><Box color="#ff0000" component="a" target="_blank" href={config.line1Url}>{config.line1}</Box></Box>
                                <Box><Box color="#ff7a7a" component="a" target="_blank" href={config.line2Url}>{config.line2}</Box></Box>
                            </Grid>
                        </Grid>
                        <Grid item md={3} container>
                            <Grid item md={6}>
                                <Box color="#ff0000"><Roller component="span">{apys[0].toFixed(4)}</Roller>%</Box>
                                <Box color="#ff7a7a">CLAIM APY</Box>
                            </Grid>
                            <Grid item md={6}>
                                <Box color="#ff0000"><Roller component="span">{apys[1].toFixed(4)}</Roller>%</Box>
                                <Box color="#ff7a7a">NOCLAIM APY</Box>
                            </Grid>
                        </Grid>
                    </Grid>
            }


            <Grid container spacing={3} style={{ display: `${open ? "" : "none"}` }}>
                <Grid item md="6" style={{ paddingTop: 20 }}>
                    <div>
                        <Box component="span" color="#ff7a7a">{t("Farms.Balance")}: &nbsp;</Box>
                        <Roller component="span" fontWeight="bold" color="#ff0000">{balance.toFixed(8, BigNumber.ROUND_DOWN)}</Roller>
                        <Box className="max-btn" component="span" color="#15b000" style={{ float: "right" }} onClick={e => { setAmountToStake(balance.toFixed(8, BigNumber.ROUND_DOWN)) }}>{t("Farms.Max")}</Box>
                    </div>
                    <div>
                        <input className="coin-value-input" value={amountToStake} onChange={e => { setAmountToStake(e.target.value) }} />
                    </div>
                    <div className="btn-container">
                        <Button size="small" variant="contained" className={`card-btn ${loadSuccess ? "enable" : "disable"}`} disabled={!loadSuccess} onClick={onStake}>{t("Farms.Stake")}</Button>
                    </div>
                </Grid>
                <Grid item md="6" style={{ paddingTop: 20 }}>
                    <div>
                        <Box component="span" color="#ff7a7a">{t("Farms.Staked")}: &nbsp;</Box>
                        <Roller component="span" fontWeight="bold" color="#ff0000">{staked.toFixed(8, BigNumber.ROUND_DOWN)}</Roller>
                        <Box className="max-btn" component="span" color="#15b000" style={{ float: "right" }} onClick={e => { setAmountToUnstake(staked) }}>{t("Farms.Max")}</Box>
                    </div>
                    <div>
                        <input className="coin-value-input" value={amountToUnstake} onChange={e => { setAmountToUnstake(e.target.value) }} />
                    </div>
                    <div className="btn-container">
                        <Button size="small" variant="contained" className={`card-btn ${loadSuccess ? "enable" : "disable"}`} disabled={!loadSuccess} onClick={onUnstake}>{t("Farms.Unstake")}</Button>
                    </div>
                </Grid>
                <Grid item md="12">
                    <div className="btn-container">
                        <Button size="small" variant="contained" className={`card-btn card-btn-long ${loadSuccess ? "enable" : "disable"}`} onClick={onHarvest} disabled={!loadSuccess} >{t("Farms.Harvest")}</Button>
                    </div>
                    <div>
                        <Box fontSize={12} color="#ff0000" textAlign="center" marginTop={2}>{t("Farms.ButtonDescription")}</Box>
                    </div>
                </Grid>
            </Grid>


        </CardContent>
    </Box>
}

export default withNamespaces()(Farm);