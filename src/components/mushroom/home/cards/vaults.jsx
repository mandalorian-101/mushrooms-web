import { withNamespaces } from "react-i18next";
import { Card, CardContent, Grid, Box } from "@material-ui/core";
import React, { Component, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { computeVaultApy, fetchVaultsTotalLocked as fetchVaultsTotalLocked } from "../../../contract/apy";
import config from "../../config";
import { eventEmitter } from "../../../../mushroomsStore";
import mmVault from "../../../contract/mmVault";
import { BigNumber } from "bignumber.js";
import CardBackDrop from "../../commons/CardBackDrop";
import Roller from "../../commons/Roller";
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function Vaults({ t }) {

    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();
    let [tableList, setTableList] = useState([]);
    let [totalLocked, setTotalLocked] = useState(new BigNumber(0));

    async function fetchData() {


        async function getTokenAddress(config) {
            let contract = mmVault(config.address);
            let token = await contract.methods.token().call();
            return token;
        }

        let [apys, totalLocked, tokenAddressList] = await Promise.all([
            Promise.all(config.vaults.map(computeVaultApy)),
            fetchVaultsTotalLocked(),
            Promise.all(config.vaults.map(getTokenAddress)),
        ]);
        setTableList(apys.map((apy, i) => {
            return { ...config.vaults[i], apy, tokenAddress: tokenAddressList[i] }
        }));
        setTotalLocked(totalLocked);
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
        <CardBackDrop open={tableList.length === 0} />
        <CardContent  >
            <Box fontSize={27} color="#ff0000" fontWeight="0">{t("Home.Vaults")}</Box>
            <Box fontSize={22} color="#ff6e6e" fontWeight="0">{t("Home.TotalLocked")}:&nbsp;&nbsp;
            <Box fontSize={22} component="span" color="#f10000" fontWeight="bold">$<Roller component="span">{totalLocked.toFixed(2)}</Roller></Box>
            </Box>
            <table className="common-table">
                <thead>
                    <tr>
                        <th>
                            <span>{t("Home.Vaults.Table.Vault")}</span>
                        </th>
                        <th>
                            <span>{t("Home.Vaults.DepositToken")}</span>
                        </th>
                        <th>
                            <span>{t("Home.Vaults.APY")}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tableList.map(d => <tr key={d} className={d.flash ? `vault-tr` : ""}>
                        <td className="name">
                            {d.flash && <img src={process.env.PUBLIC_URL + "/mushrooms/dragon-icon.png"} style={{ width: 20, marginTop: -10 }} />}
                            <span className='name'>{d.name}</span>
                        </td>
                        <td>
                            <Box color="#ff0000" target="_blank" component="a" href={`https://etherscan.io/token/${d.tokenAddress}`}>{d.token}</Box>
                        </td>
                        <td className="apy"><Roller component="span">{parseInt(d.apy * 10000) / 100}</Roller>%</td>
                    </tr>)}
                </tbody>
            </table>
            {/* <style>{
                `
                .vault-tr:nth-of-type(even) {
                    background-image: url(${process.env.PUBLIC_URL}/mushrooms/drogan-icon.png);
                    height: 20px;
                    background-size: cover;
                    background-repeat: no-repeat;
                    color: white !important;
                }
                
                .vault-tr:nth-of-type(odd) {
                    background-image: url(${process.env.PUBLIC_URL}/mushrooms/drogan-icon.png);
                    height: 20px;
                    background-size: cover;
                    background-repeat: no-repeat;
                    color: red !important;
                }
                
                .vault-tr .name {
                    padding-left: 40px !important;
                }
                
                .vault-tr a {
                    color: white !important;
                }
                
                .vault-tr:nth-of-type(odd) a {
                    color: red !important;
                }`
            }
            </style> */}
        </CardContent>
    </Card>
}

export default withNamespaces()(Vaults);