import { withNamespaces } from "react-i18next";
import { Card, CardContent, Grid, Box } from "@material-ui/core";
import React, { Component, useEffect, useState } from "react";
import { eventEmitter } from "../../../../mushroomsStore";
import mmVault from "../../../contract/mmVault";
import config from "../../config";
import { BigNumber } from "bignumber.js";
import { useWeb3React } from "@web3-react/core";
import masterchef from "../../../contract/masterchef";
import erc20 from "../../../contract/erc20";
import { queryPairData } from "../../../contract/uniswap";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function MarketCap({ t }) {

    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();
    let [totalSupply, setTotalSupply] = useState(new BigNumber(0));
    let [cap, setCap] = useState(new BigNumber(0));

    async function fetchData() {
        var contract = masterchef();
        let erc20Contract = erc20(await contract.methods.mm().call());

        let [totalSupply, decimals, pairData] = await Promise.all([
            erc20Contract.methods.totalSupply().call(),
            erc20Contract.methods.decimals().call(),
            queryPairData("0xbbf933c1af0e9798615099a37a17cafc6da87732")
        ]);
        let mmTokenPrice = pairData.data.pair.token0Price;
        setTotalSupply(new BigNumber(totalSupply).div(10 ** decimals));
        setCap(new BigNumber(totalSupply).div(10 ** decimals).times(mmTokenPrice));
    }

    useEffect(() => {
        let timer = 0;
        let func = () => {
            fetchData();
            timer = setInterval(fetchData, 30000);
        };
        if (web3React.active || safeAppsSDK.connected) {
            func();
        } else {
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
        <CardBackDrop open={cap.toNumber() === 0} />
        <CardContent className="card-bottom-border-line">
            <Box fontSize={17} color="#ff6e6e" fontWeight="0">{t("Home.MarketCap")}</Box>
            <Box fontSize={22} color="rgba(228, 0, 0, 0.95)" fontWeight="bold">$<Roller component="span">{cap.toFixed(2, BigNumber.ROUND_DOWN)}</Roller></Box>
        </CardContent>
        <CardContent>
            <Box fontSize={12} color="#ffa748" fontWeight="0">
                {t("Home.TotalSupply")}: &nbsp;
                <Box component="span" fontSize={12} color="rgba(228, 0, 0, 0.95)"><img src={process.env.PUBLIC_URL + "/mushrooms/logo icon.png" } className="coin-icon-tiny" />&nbsp;<Roller component="span">{totalSupply.toFixed(4)}</Roller></Box>
            </Box>
        </CardContent>
    </Card>
}

export default withNamespaces()(MarketCap);