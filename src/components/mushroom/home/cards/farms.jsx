import { withNamespaces } from "react-i18next";
import { Card, CardContent, Grid, Box } from "@material-ui/core";
import React, { Component, useEffect } from "react";
import { eventEmitter } from "../../../../mushroomsStore";
import { useWeb3React } from "@web3-react/core";
import config from "../../config";
import { computeFarmApy, computeFarmLocked } from "../../../contract/apy";
import { useState } from "react";
import { BigNumber } from "bignumber.js";
import masterchef from "../../../contract/masterchef";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";

import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function Farms({ t }) {

    let [list, setList] = useState([]);
    let [locked, setLocked] = useState(new BigNumber(0));
    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();
    async function fetchData() {
        function sum(arr) {
            var r = new BigNumber(0);
            for (var i = arr.length - 1; i >= 0; i--) {
                r = r.plus(arr[i]);
            }
            return r;
        }
        let masterchefContract = masterchef();
        let [list, locked] = await Promise.all([
            Promise.all(config.farms.filter(farm => !farm.external).map(async c => {
                let [apy, poolInfo] = await Promise.all([
                    computeFarmApy(c),
                    masterchefContract.methods.poolInfo(c.pid).call()
                ]);
                return { ...c, apy, poolInfo };
            })),
            Promise.all(config.farms.filter(farm => !farm.external).map(computeFarmLocked))
        ]);

        console.log(list, "list");
        setList(list);
        setLocked(sum(locked));
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
        <CardBackDrop open={list.length === 0} />
        <CardContent  >
            <Box fontSize={27} color="#ff0000" fontWeight="0">{t("Home.Farms")}</Box>
            <Box fontSize={22} color="#ff6e6e" fontWeight="0">{t("Home.TotalLocked")}:&nbsp;&nbsp;
                <Box fontSize={22} component="span" color="#f10000" fontWeight="bold">$<Roller component="span">{locked.toFixed(2)}</Roller></Box>
            </Box>
            <table className="common-table">
                <thead>
                    <tr>
                        <th>
                            <span>{t("Home.Farms.Table.Pool")}</span>
                        </th>
                        <th>
                            <span>{t("Home.Farms.DepositToken")}</span>
                        </th>
                        <th>
                            <span>{t("Home.Farms.APY")}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(d =>
                        <tr>
                            <td><span>{d.farmName}</span></td>
                            <td><a style={{ color: "#ff4c4c" }} target="_blank" href={`https://etherscan.io/address/${d.poolInfo.lpToken}`}>{d.name}</a></td>
                            <td><Roller component="span">{d.apy.toFixed(2)}</Roller>%</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </CardContent>
    </Card>
}

export default withNamespaces()(Farms);