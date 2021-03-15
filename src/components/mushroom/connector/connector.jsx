import React, { Component, useEffect, useState } from "react";
import "./connector.css";
import { Box, Snackbar } from "@material-ui/core";
import { useWeb3React } from "@web3-react/core";
import { withNamespaces } from "react-i18next";
import { InjectedConnector } from "@web3-react/injected-connector";
import { URI_AVAILABLE, WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

import Dialog from "./dialog";

import Web3 from 'web3';

import { eventEmitter, getAccount, initStore, isApp, refreshAccount, setSafeAppsSDK } from "../../../mushroomsStore";

export const injected = new InjectedConnector({
    supportedChainIds: [1, 1337]
});

const POLLING_INTERVAL = 12000;
const RPC_URLS = { 1: "https://eth-mainnet.alchemyapi.io/v2/iBDTL8xvgp_HyJlAVgWzYEJmqoWWSKUC" };

export const walletconnect = new WalletConnectConnector({
    rpc: { 1: RPC_URLS[1] },
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: POLLING_INTERVAL
});

function Connector({ t }) {
    let [connectType, setConnectType] = useState("");
    const web3React = useWeb3React();
    let [blockHigh, setBlockHigh] = useState("0");
    let [gas, setGas] = useState("0");
    let [open, setOpen] = useState(false);

    async function onClick(e) {
        setOpen(true);
    }

    function onLinkClick(e) {
        e.stopPropagation();
    }

    async function connectWallet(value) {
        if (value === "close") {
            web3React.deactivate();
            if (web3React.library.provider.disconnect) {
                await web3React.library.provider.disconnect();
            }
            window.location.reload();
        } else if (value === "walletconnect") {
            web3React.activate(walletconnect);
        } else if (value === "metamask") {
            web3React.activate(injected);
        }
        localStorage.setItem("LAST_STATE", value);
    }

    const handleClose = async (value) => {
        setOpen(false);
        setConnectType(value);
        connectWallet(value);
    };

    useEffect(() => {

        if (!isApp()) {
            walletconnect.on(URI_AVAILABLE, uri => {
                console.log("URI_AVAILABLE", uri);
            })

            let lastState = localStorage.getItem("LAST_STATE");

            if (lastState !== "close") {
                connectWallet(lastState);
            }
            if (navigator.userAgent.indexOf("imToken") !== -1) {
                connectWallet("metamask");
            }
        }

        let func = (d) => {
            setBlockHigh(d);
        };

        let gasFunc = (gas) => {
            setGas(gas);
        }

        eventEmitter.addListener("BLOCK_HIGH_CHANGE", func);
        eventEmitter.addListener("GAS_UPDATE", gasFunc);

        return () => {
            eventEmitter.removeListener("BLOCK_HIGH_CHANGE", func);
            eventEmitter.removeListener("GAS_UPDATE", gasFunc);
        }
    }, []);

    if (web3React.active && web3React.account) {
        console.log(web3React, "web3React");
        initStore(new Web3(web3React.library.provider), web3React.chainId, web3React.account);
        refreshAccount(web3React.account);
    }

    let safeAppsSDK = useSafeAppsSDK();
    console.log(safeAppsSDK, "safeAppsSDK");
    if (safeAppsSDK.connected && safeAppsSDK.safe.safeAddress) {
        setSafeAppsSDK(safeAppsSDK.sdk);
        if(safeAppsSDK.safe.network === "RINKEBY"){
            initStore(new Web3("https://rinkeby.infura.io/v3/615f7d771e0c47ffb7b9574cb6562038"), 0, safeAppsSDK.safe.safeAddress);
        }else{
            initStore(new Web3("https://mainnet.infura.io/v3/615f7d771e0c47ffb7b9574cb6562038"), 0, safeAppsSDK.safe.safeAddress);
        }
        refreshAccount(safeAppsSDK.safe.safeAddress);
    }

    let account = getAccount();
    let active = web3React.active || safeAppsSDK.connected;

    console.log("PUBLIC", JSON.stringify(process.env));
    let showAddress = active ? account.substr(2, 4) + "..." + account.substr(account.length - 4, 4) : "";
    return <><Box className={`mushroom-connector ${active ? "connected" : ""}`} boxShadow={2} borderRadius={10} onClick={onClick}>
        {
            active ? <>
                <div className="blockHigh">Bk-{blockHigh}</div>
                <div className="gas">
                    <img src={process.env.PUBLIC_URL + "/mushrooms/gas.png"} />
                    <span><a href="https://www.gasnow.org/?utm_source=MushroomsFinance" onClick={onLinkClick} style={{ color: "white" }} target="_blank">{gas}Gwei</a></span></div>
                <div className="address-container">
                    <div className="address">{showAddress}</div>
                    <img className="pm-icon" src={process.env.PUBLIC_URL + "/mushrooms/pm.png"} />
                </div>
            </> : <>
                    <img src={process.env.PUBLIC_URL + "/mushrooms/wallet-2.png"} className="icon" />
                    <div className="connect-text">{t("Connect.Connect")}</div>
                </>
        }
    </Box>
        <Dialog open={open} onClose={handleClose} active={active} />
    </>
};

export default withNamespaces()(Connector);