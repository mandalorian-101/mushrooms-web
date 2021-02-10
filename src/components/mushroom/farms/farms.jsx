import { Card, CardContent, Grid, Box } from "@material-ui/core";
import { useWeb3React } from "@web3-react/core";
import React, { Component, useEffect, useState } from "react";
import { useTranslation, initReactI18next, withNamespaces } from "react-i18next";
import { withRouter } from "react-router-dom";
import { eventEmitter, isApp } from "../../../mushroomsStore";
import FarmCard from "./cards/farm";
import config from "../config";
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function Farms({ t }) {

    let web3React = useWeb3React();
    let safeAppsSDK = useSafeAppsSDK();
    let [connect, setConnect] = useState(web3React.active || safeAppsSDK.connected);
    useEffect(() => {
        let func = () => {
            setConnect(true);
        };
        eventEmitter.addListener("ON_CONNECTED", func);
        return () => {
            eventEmitter.removeListener("ON_CONNECTED", func);
        }
    }, []);

    if (connect) {
        return <>
            {!isApp() && <>
                <Box fontSize={44} color="#e40000">{t("Farms.Farms")}</Box>
                <Box fontSize={18} color="#e40000" style={{ whiteSpace: "pre-line" }}>{t("Farms.Intro")}</Box>
            </>}
            <Grid style={{ marginTop: 30 }}>
                {config.farms.map((config, index) => <FarmCard config={config} defaultOpen={index === 0} />)}
            </Grid>
        </>
    } else {
        return <>
            <div>Please Connect wallet first.</div>
        </>
    }
}

export default withNamespaces()(withRouter(Farms));