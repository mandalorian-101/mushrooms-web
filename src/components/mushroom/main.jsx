import { CircularProgress, Container } from "@material-ui/core";
import React, { Component } from "react";
import Header from "./header/header";
import Footer from "./footer/footer";

import "./main.css";
import "./card.css";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import MuiAlert from '@material-ui/lab/Alert';
import config from "./config";

import { SnackbarProvider, useSnackbar } from 'notistack';
import SafeProvider, { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { isApp } from "../../mushroomsStore";
import AppHeader from "./header/appheader";

export default function ({ children }) {

    let isAppEnv = isApp();
    function getLibrary(provider) {
        let web3Provider = new Web3Provider(provider); // this will vary according to whether you use e.g. ethers or web3.js
        // initStore(new Web3(web3Provider.provider), web3React.chainId);
        // debugger;
        // debugger;
        return web3Provider;
    }


    return <SnackbarProvider maxSnack={5}>
        <div className="bg main">
            <SafeProvider>
                <Web3ReactProvider getLibrary={getLibrary}>
                    <div style={{ display: isAppEnv ? "none" : "block" }}>
                        <Header />
                    </div>
                    {isAppEnv && <AppHeader />}

                    {!isAppEnv && <>
                        <div className="bg-cloud-left"></div>
                        <div className="bg-circle-left-bottom"></div>
                        <div className="bg-cloud-right-bottom"></div>
                        <div className="bg-cloud-right-top"></div>
                        <div className="bg-circle-right-top"></div>
                        <Container style={{ zIndex: 1000, position: "relative", maxWidth: 1024 }}>
                            {config.open && <>
                                <img src={process.env.PUBLIC_URL + "/mushrooms/shroom-high-2.png"} style={{ textAlign: "center", width: 400 }} />
                                <a href="https://github.com/mushroomsforest/deployment/blob/main/security.md" target="_blank" style={{ textDecoration: "none" }}>
                                    <MuiAlert icon={false} severity="warning" elevation={1} variant="filled" >
                                        Smart Contracts Audited by CoinFabrik. Check our security report/bounty program here
                                </MuiAlert>
                                </a>
                            </>}
                            {children}
                        </Container>
                        <Footer />
                    </>}


                    {isAppEnv && <Container style={{ zIndex: 1000, position: "relative", maxWidth: 1024 }}>
                        {children}
                    </Container>}
                </Web3ReactProvider>
            </SafeProvider>
        </div>
    </SnackbarProvider>
};