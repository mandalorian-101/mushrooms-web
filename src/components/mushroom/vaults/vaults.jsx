import { Card, CardContent, Grid, Box } from "@material-ui/core";
import { useWeb3React } from "@web3-react/core";
import React, { Component, useEffect } from "react";
import { useState } from "react";
import { useTranslation, initReactI18next, withNamespaces } from "react-i18next";
import { withRouter } from "react-router-dom";
import { eventEmitter, isApp } from "../../../mushroomsStore";
import Jar from "./cards/vault";

import config from "../config";
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

function Jars({ t }) {
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
                <Box fontSize={44} color="#e40000">{t("Vaults.Jars")}</Box>
                <Box fontSize={18} color="#e40000">{t("Vaults.Intro")}</Box>
            </>}

            <Grid style={{ marginTop: 30 }}>
                {config.vaults.map((config, i) => <Jar config={config} defaultClose={i !== 0} />)}
            </Grid>
        </>
    } else {
        return <>
            <div>Please Connect wallet first.</div>
        </>;
    }
}

export default withNamespaces()(withRouter(Jars));