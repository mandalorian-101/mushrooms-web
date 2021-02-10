import { withNamespaces } from "react-i18next";
import { Card, CardContent, Grid, Box, Tooltip } from "@material-ui/core";
import React, { Component, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { eventEmitter } from "../../../../mushroomsStore";
import { useState } from "react";
import { BigNumber } from "bignumber.js";
import { computeFarmLocked, fetchVaultsTotalLocked } from "../../../contract/apy";
import config from "../../config";
import { queryPairDayData } from "../../../contract/uniswap";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";

import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function Locked({ t }) {

    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();

    let [totalLocked, setTotalLocked] = useState(new BigNumber(0));
    let [liquidity, setLiquidity] = useState(new BigNumber(0));

    async function fetchData() {
        function sum(arr) {
            var r = new BigNumber(0);
            for (var i = arr.length - 1; i >= 0; i--) {
                r = r.plus(arr[i]);
            }
            return r;
        }

        let [vaults, locked, pairDayData] = await Promise.all([
            fetchVaultsTotalLocked(),
            Promise.all(config.farms.filter(farm => !farm.external).filter(f => f.type !== "CRV").map(computeFarmLocked)),
            queryPairDayData("0xbbf933c1af0e9798615099a37a17cafc6da87732")
        ]);

        console.log([vaults.toNumber(), locked.map(d => d.toNumber()), pairDayData], sum([vaults, sum(locked)]).toFixed(2), "TOTAL");
        setTotalLocked(sum([vaults, sum(locked)]));

        let reserveusd = pairDayData.data.pairDayDatas[0].reserveUSD;
        setLiquidity(new BigNumber(reserveusd));

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


    return <Card className="card" elevation={2} >
        <CardBackDrop open={totalLocked.toNumber() === 0} />
        <CardContent className="card-bottom-border-line">
            <Box fontSize={17} color="#ff6e6e" fontWeight="0">{t("Home.Locked")}</Box>
            <Box fontSize={22} color="rgba(228, 0, 0, 0.95)" fontWeight="bold">$<Roller component="span">{totalLocked.toFixed(2)}</Roller></Box>
        </CardContent>
        <CardContent>

            <Box fontSize={12} color="#ffa748" fontWeight="0">
                {t("Home.Liquidity")}:
                <Tooltip interactive enterDelay={0} leaveDelay={200} title={liquidity.toFixed(4)}>
                    <Box title={liquidity.toFixed(4)} component="a" href="https://info.uniswap.org/pair/0xbbf933c1af0e9798615099a37a17cafc6da87732" target="_blank" fontSize={12} color="rgba(228, 0, 0, 0.95)"><img src={process.env.PUBLIC_URL + "/mushrooms/uniswap.png"} className="coin-icon-tiny" /></Box>
                </Tooltip>


                &nbsp; &nbsp; <a href="https://sushiswap.fi/pair/0x41848373dec2867ef3924e47b2ebd0ee645a54f9" target="_blank"><img src={process.env.PUBLIC_URL + "/mushrooms/sushi.png"} className="coin-icon-tiny" /></a>
            </Box>
        </CardContent>
    </Card>
}

export default withNamespaces()(Locked);