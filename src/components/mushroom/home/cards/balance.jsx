import { withNamespaces } from "react-i18next";
import { Card, CardContent, Grid, Box, Backdrop, CircularProgress } from "@material-ui/core";
import React, { Component, useEffect, useState } from "react";
import { eventEmitter, getAccount, getWeb3 } from "../../../../mushroomsStore";
import { BigNumber } from "bignumber.js";
import masterchef from "../../../contract/masterchef";
import config from "../../config";
import { useWeb3React } from "@web3-react/core";
import mmVault from "../../../contract/mmVault";
import erc20 from "../../../contract/erc20";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function Balance({ t }) {

    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();

    let [pending, setPending] = useState(new BigNumber(0));

    let [balance, setBalance] = useState(new BigNumber(0));

    let [loadSuccess, setLoadSuccess] = useState(false);

    async function fetchData() {

        function sum(arr) {
            var r = new BigNumber(0);
            for (var i = arr.length - 1; i >= 0; i--) {
                r = r.plus(arr[i]);
            }
            return r;
        }

        let masterchefContract = masterchef();
        // let accounts = await web3.eth.getAccounts();
        let account = getAccount();

        let mmTokenAddress = await masterchefContract.methods.mm().call();

        let erc20Contract = erc20(mmTokenAddress);

        let [pendings, balance, decimals] = await Promise.all(
            [
                Promise.all(config.farms.filter(farm => !farm.external).map(farm => {
                    return masterchefContract.methods.pendingMM(farm.pid, account).call()
                })),
                erc20Contract.methods.balanceOf(account).call(),
                erc20Contract.methods.decimals().call(),
            ]
        );



        setBalance(new BigNumber(balance).div(10 ** decimals));

        setPending(sum(pendings.map(p => new BigNumber(p).div(10 ** decimals))));

        setLoadSuccess(true);
        console.log("pendings", pendings, balance, decimals);
    }

    useEffect(() => {
        let timer = 0;
        let func = () => {
            fetchData();
            timer = setInterval(fetchData, 30000);
        };
        if (web3React.active || safeAppsSDK.connected) {
            func();
        }
        else {
            eventEmitter.addListener("ON_CONNECTED", func);
        }
        eventEmitter.addListener("ACCOUNT_CHANGE", fetchData);
        return () => {
            clearInterval(timer);
            eventEmitter.removeListener("ON_CONNECTED", func);
            eventEmitter.removeListener("ACCOUNT_CHANGE", fetchData);
        }
    }, []);


    return <Card className="card" elevation={2}>
        <CardBackDrop open={!loadSuccess} />
        <CardContent className="card-bottom-border-line">
            <Roller fontSize={30} color="#ff6e6e">{t("Home.YourBalance")}</Roller>
            <Box fontSize={25} fontWeight={500} color="rgba(228, 0, 0, 0.95)"><img src={process.env.PUBLIC_URL + "/mushrooms/logo icon.png"} className="coin-icon" /> <Roller component="span">{balance.toFixed(4, BigNumber.ROUND_DOWN)}</Roller></Box>
        </CardContent>
        <CardContent>
            <Box fontSize={12} color="#ffa748">
                {t("Home.Pending")}: &nbsp;
                <Box component="span" fontSize={16} color="rgba(228, 0, 0, 0.95)"><img src={process.env.PUBLIC_URL + "/mushrooms/logo icon.png"} className="coin-icon-tiny" /> <Roller component="span">{pending.toFixed(4, BigNumber.ROUND_DOWN)}</Roller></Box>
            </Box>
        </CardContent>
    </Card>;
}

export default withNamespaces()(Balance);